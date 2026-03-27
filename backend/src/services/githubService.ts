import { getOctokit } from '../utils/github';
import { MAX_REPOS_TO_ANALYZE, MAX_CODE_SAMPLES_PER_REPO, MAX_REPOS_FOR_CODE_REVIEW, MAX_FILE_SIZE_FOR_REVIEW } from '../config/constants';

export interface RepoLanguages {
  [language: string]: number; // language name → bytes
}

export interface RepoFileEntry {
  name: string;
  type: 'file' | 'dir';
  size: number;
  path: string;
}

export interface RepoData {
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  languages: RepoLanguages;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  created_at: string;
  fork: boolean;
  size: number;
  default_branch: string;
  file_tree: RepoFileEntry[];
  readme_content: string | null;
  code_samples: { filename: string; content: string; language: string }[];
}

export interface GitHubProfile {
  username: string;
  name: string | null;
  bio: string | null;
  public_repos: number;
  followers: number;
  following: number;
  created_at: string;
  repos: RepoData[];
  aggregate_languages: RepoLanguages;
}

export async function analyzeGitHubProfile(username: string): Promise<GitHubProfile> {
  const octokit = getOctokit();

  // Step 1: Verify user exists and get profile metadata
  let userProfile: any;
  try {
    const { data } = await octokit.rest.users.getByUsername({ username });
    userProfile = data;
  } catch (error: any) {
    if (error.status === 404) {
      throw new Error(`GitHub user "${username}" not found. Please check the username and try again.`);
    }
    throw new Error(`Failed to fetch GitHub profile: ${error.message}`);
  }

  // Step 2: Fetch repos sorted by most recently updated
  const { data: allRepos } = await octokit.rest.repos.listForUser({
    username,
    sort: 'updated',
    direction: 'desc',
    per_page: 30,
    type: 'owner', // Only repos owned by user, not forks they haven't modified
  });

  // Filter out empty repos and take top N
  const repos = allRepos
    .filter((repo) => (repo.size ?? 0) > 0) // Exclude empty repos
    .slice(0, MAX_REPOS_TO_ANALYZE);

  if (repos.length === 0) {
    return {
      username,
      name: userProfile.name,
      bio: userProfile.bio,
      public_repos: userProfile.public_repos,
      followers: userProfile.followers,
      following: userProfile.following,
      created_at: userProfile.created_at,
      repos: [],
      aggregate_languages: {},
    };
  }

  // Step 3: For each repo, fetch languages, file tree, and README in parallel
  const repoDataPromises = repos.map(async (repo, index): Promise<RepoData> => {
    const owner = repo.owner?.login || username;
    const repoName = repo.name;

    // Parallel fetches per repo
    const [languagesRes, fileTreeRes, readmeRes] = await Promise.allSettled([
      // Languages
      octokit.rest.repos.listLanguages({ owner, repo: repoName }),
      // Root file tree
      octokit.rest.repos.getContent({ owner, repo: repoName, path: '' }),
      // README
      octokit.rest.repos.getReadme({ owner, repo: repoName }),
    ]);

    const languages: RepoLanguages =
      languagesRes.status === 'fulfilled' ? languagesRes.value.data : {};

    const fileTree: RepoFileEntry[] =
      fileTreeRes.status === 'fulfilled' && Array.isArray(fileTreeRes.value.data)
        ? (fileTreeRes.value.data as any[]).map((f) => ({
            name: f.name,
            type: f.type === 'dir' ? 'dir' : 'file',
            size: f.size || 0,
            path: f.path,
          }))
        : [];

    let readmeContent: string | null = null;
    if (readmeRes.status === 'fulfilled') {
      const readmeData = readmeRes.value.data as any;
      if (readmeData.content && readmeData.encoding === 'base64') {
        readmeContent = Buffer.from(readmeData.content, 'base64').toString('utf-8');
      }
    }

    // Step 4: For the top N repos, fetch code samples
    let codeSamples: { filename: string; content: string; language: string }[] = [];

    if (index < MAX_REPOS_FOR_CODE_REVIEW) {
      codeSamples = await fetchCodeSamples(
        octokit,
        owner,
        repoName,
        fileTree,
        repo.language || ''
      );
    }

    return {
      name: repoName,
      full_name: repo.full_name,
      description: repo.description ?? null,
      html_url: repo.html_url,
      language: repo.language ?? null,
      languages,
      stargazers_count: repo.stargazers_count ?? 0,
      forks_count: repo.forks_count ?? 0,
      updated_at: repo.updated_at || '',
      created_at: repo.created_at || '',
      fork: repo.fork,
      size: repo.size ?? 0,
      default_branch: repo.default_branch || 'main',
      file_tree: fileTree,
      readme_content: readmeContent,
      code_samples: codeSamples,
    };
  });

  const repoData = await Promise.all(repoDataPromises);

  // Step 5: Compute aggregate language stats across all repos
  const aggregateLanguages: RepoLanguages = {};
  for (const repo of repoData) {
    for (const [lang, bytes] of Object.entries(repo.languages)) {
      aggregateLanguages[lang] = (aggregateLanguages[lang] || 0) + bytes;
    }
  }

  return {
    username,
    name: userProfile.name,
    bio: userProfile.bio,
    public_repos: userProfile.public_repos,
    followers: userProfile.followers,
    following: userProfile.following,
    created_at: userProfile.created_at,
    repos: repoData,
    aggregate_languages: aggregateLanguages,
  };
}

/**
 * Fetch 2-3 key source files from a repo for code quality analysis.
 * Strategy: pick the main entry point files and the largest source files
 * in the primary language.
 */
async function fetchCodeSamples(
  octokit: ReturnType<typeof getOctokit>,
  owner: string,
  repo: string,
  fileTree: RepoFileEntry[],
  primaryLanguage: string
): Promise<{ filename: string; content: string; language: string }[]> {
  // Define file extensions by language
  const langExtensions: Record<string, string[]> = {
    Python: ['.py'],
    JavaScript: ['.js', '.jsx'],
    TypeScript: ['.ts', '.tsx'],
    Java: ['.java'],
    Go: ['.go'],
    Rust: ['.rs'],
    'C++': ['.cpp', '.cc', '.h'],
    C: ['.c', '.h'],
    Ruby: ['.rb'],
    PHP: ['.php'],
  };

  const extensions = langExtensions[primaryLanguage] || [];

  // Priority files to look for (entry points)
  const priorityNames = [
    'main.py', 'app.py', 'server.py', 'index.py',
    'index.js', 'index.ts', 'app.js', 'app.ts', 'server.js', 'server.ts',
    'main.go', 'main.rs', 'Main.java', 'App.java',
    'index.jsx', 'index.tsx', 'App.jsx', 'App.tsx',
  ];

  // Find candidate files
  const sourceFiles = fileTree.filter((f) => {
    if (f.type !== 'file') return false;
    if (f.size > MAX_FILE_SIZE_FOR_REVIEW) return false;
    if (f.size < 100) return false; // Skip tiny files
    // Skip config/lock files
    if (f.name.endsWith('.json') || f.name.endsWith('.lock') || f.name.endsWith('.yaml') || f.name.endsWith('.yml')) return false;
    if (f.name.startsWith('.')) return false;
    return extensions.some((ext) => f.name.endsWith(ext)) || priorityNames.includes(f.name);
  });

  // Sort: priority names first, then by size descending (larger files are usually more interesting)
  sourceFiles.sort((a, b) => {
    const aPriority = priorityNames.includes(a.name) ? 0 : 1;
    const bPriority = priorityNames.includes(b.name) ? 0 : 1;
    if (aPriority !== bPriority) return aPriority - bPriority;
    return b.size - a.size;
  });

  // Fetch top N files
  const filesToFetch = sourceFiles.slice(0, MAX_CODE_SAMPLES_PER_REPO);
  const samples: { filename: string; content: string; language: string }[] = [];

  for (const file of filesToFetch) {
    try {
      const { data } = await octokit.rest.repos.getContent({
        owner,
        repo,
        path: file.path,
      });

      if (!Array.isArray(data) && data.type === 'file' && data.content) {
        const content = Buffer.from(data.content, 'base64').toString('utf-8');
        // Truncate very long files to first 200 lines for Claude analysis
        const truncated = content.split('\n').slice(0, 200).join('\n');
        samples.push({
          filename: file.name,
          content: truncated,
          language: primaryLanguage,
        });
      }
    } catch (e) {
      // Skip files that can't be fetched (e.g., binary files misidentified)
      continue;
    }
  }

  return samples;
}
