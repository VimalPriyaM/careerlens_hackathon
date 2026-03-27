interface RepoData {
  name: string;
  file_tree: { name: string; type: string; path: string }[];
}

interface StructuralMarker {
  name: string;
  patterns: string[];
  points: number;
}

const STRUCTURAL_MARKERS: StructuralMarker[] = [
  {
    name: 'tests',
    patterns: ['test/', 'tests/', '__tests__/', 'spec/', 'test_', '.test.', '.spec.', 'pytest.ini', 'jest.config'],
    points: 5,
  },
  {
    name: 'ci_cd',
    patterns: ['.github/', '.gitlab-ci.yml', 'Jenkinsfile', '.circleci/', '.travis.yml', 'azure-pipelines.yml'],
    points: 4,
  },
  {
    name: 'containerization',
    patterns: ['Dockerfile', 'docker-compose.yml', 'docker-compose.yaml', '.dockerignore'],
    points: 3,
  },
  {
    name: 'project_structure',
    patterns: ['src/', 'lib/', 'pkg/', 'internal/', 'app/', 'core/'],
    points: 3,
  },
  {
    name: 'dependency_management',
    patterns: ['requirements.txt', 'package.json', 'go.mod', 'Cargo.toml', 'Gemfile', 'pyproject.toml', 'Pipfile', 'composer.json', 'pubspec.yaml'],
    points: 2,
  },
  {
    name: 'documentation',
    patterns: ['docs/', 'CONTRIBUTING.md', 'API.md', 'CHANGELOG.md', 'doc/', 'wiki/'],
    points: 3,
  },
];

/**
 * Component B: Check file trees for structural markers indicating real-world usage.
 * Score: 0-20 points
 */
export function scoreStructuralEvidence(
  skillName: string,
  repos: RepoData[]
): { score: number; details: string; markers_found: string[] } {
  if (repos.length === 0) {
    return { score: 0, details: 'No repos to analyze', markers_found: [] };
  }

  const foundMarkers = new Set<string>();

  for (const repo of repos) {
    for (const marker of STRUCTURAL_MARKERS) {
      if (foundMarkers.has(marker.name)) continue; // Already found this marker

      const found = marker.patterns.some((pattern) => {
        return repo.file_tree.some((f) => {
          const name = f.name.toLowerCase();
          const patternLower = pattern.toLowerCase();
          // Match directory names, file names, or file name patterns
          return (
            name === patternLower ||
            name === patternLower.replace('/', '') ||
            name.startsWith(patternLower.replace('/', '')) ||
            name.includes(patternLower.replace('.', ''))
          );
        });
      });

      if (found) {
        foundMarkers.add(marker.name);
      }
    }
  }

  // Calculate total score from found markers
  let totalScore = 0;
  const markersList: string[] = [];

  for (const marker of STRUCTURAL_MARKERS) {
    if (foundMarkers.has(marker.name)) {
      totalScore += marker.points;
      markersList.push(marker.name);
    }
  }

  // Cap at 20
  totalScore = Math.min(totalScore, 20);

  const details = markersList.length > 0
    ? `Found: ${markersList.join(', ')}`
    : 'No structural markers found';

  return { score: totalScore, details, markers_found: markersList };
}
