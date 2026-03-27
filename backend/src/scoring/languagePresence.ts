import { findSkillMapping } from '../config/skillMappings';

interface RepoData {
  name: string;
  languages: Record<string, number>;
  file_tree: { name: string; type: string; path: string }[];
}

/**
 * Component A: Check how many repos contain evidence of this skill.
 * Score: 0-25 points
 */
export function scoreLanguagePresence(
  skillName: string,
  repos: RepoData[]
): { score: number; details: string; matching_repos: string[] } {
  const mapping = findSkillMapping(skillName);
  if (!mapping) {
    return { score: 0, details: `No GitHub mapping found for "${skillName}"`, matching_repos: [] };
  }

  const matchingRepos: string[] = [];

  for (const repo of repos) {
    let matched = false;

    // Check if any mapped language appears in repo's languages
    if (mapping.languages.length > 0) {
      for (const lang of mapping.languages) {
        if (repo.languages[lang] && repo.languages[lang] > 0) {
          matched = true;
          break;
        }
      }
    }

    // Check file markers in the file tree
    if (!matched && mapping.fileMarkers.length > 0) {
      for (const marker of mapping.fileMarkers) {
        const markerClean = marker.replace('*', '');
        const found = repo.file_tree.some(
          (f) => f.name === marker || f.name.endsWith(markerClean) || f.path === marker.replace('/', '')
        );
        if (found) {
          matched = true;
          break;
        }
      }
    }

    // Check dependency keys (would need to parse package.json/requirements.txt from file content)
    // For Phase 2, we check if dependency-related files exist in the file tree
    // Full dependency parsing can be enhanced later
    if (!matched && mapping.dependencyKeys.length > 0) {
      const hasDependencyFile = repo.file_tree.some(
        (f) => f.name === 'package.json' || f.name === 'requirements.txt' ||
               f.name === 'Pipfile' || f.name === 'go.mod' || f.name === 'Cargo.toml' ||
               f.name === 'Gemfile' || f.name === 'composer.json' || f.name === 'pubspec.yaml'
      );
      if (hasDependencyFile) {
        // For now, if the language matches AND dependency file exists, count it
        for (const lang of mapping.languages) {
          if (repo.languages[lang]) {
            matched = true;
            break;
          }
        }
      }
    }

    if (matched) {
      matchingRepos.push(repo.name);
    }
  }

  const count = matchingRepos.length;
  let score: number;
  let details: string;

  if (count >= 5) {
    score = 25;
    details = `Strong presence: found in ${count} repos`;
  } else if (count >= 3) {
    score = 18;
    details = `Good presence: found in ${count} repos`;
  } else if (count >= 1) {
    score = 10;
    details = `Limited presence: found in ${count} repo(s)`;
  } else {
    score = 0;
    details = 'Not found in any repository';
  }

  return { score, details, matching_repos: matchingRepos };
}
