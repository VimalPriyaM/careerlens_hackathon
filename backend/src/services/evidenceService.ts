import { scoreLanguagePresence } from '../scoring/languagePresence';
import { scoreStructuralEvidence } from '../scoring/structuralEvidence';
import { scoreCodeQuality } from '../scoring/codeQualityScorer';
import { scoreReadmeQuality } from '../scoring/readmeScorer';
import { scoreLinkedInCorroboration } from '../scoring/linkedinCorroboration';
import { classifyCrossReference, CrossRefResult } from '../scoring/crossReference';
import { computeOverallScore } from '../scoring/overallScore';

interface TargetSkill {
  name: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  category: string;
  typical_evidence: string;
}

interface RepoForScoring {
  name: string;
  languages: Record<string, number>;
  file_tree: { name: string; type: string; path: string }[];
  readme_content: string | null;
}

interface CodeSample {
  repo: string;
  filename: string;
  content: string;
  language: string;
}

interface LinkedInData {
  skills: { name: string; endorsement_count: number; listed_position: number }[];
  certifications: { name: string; issuer: string; date: string }[];
  courses: { name: string; platform: string }[];
  experience: { title: string; company: string; description: string; skills_mentioned: string[] }[];
  recommendations_count: number;
}

interface ResumeSkills {
  skills: { name: string; category: string; confidence: string }[];
}

export interface EvidenceScore {
  skill_name: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  category: string;
  evidence_score: number;
  components: {
    github_language: { score: number; max: 25; details: string };
    github_structure: { score: number; max: 20; details: string };
    github_code_quality: { score: number; max: 20; details: string };
    github_readme: { score: number; max: 10; details: string };
    linkedin_corroboration: { score: number; max: 25; details: string };
  };
  cross_reference: CrossRefResult;
}

export interface EvidenceResult {
  evidence_scores: EvidenceScore[];
  conflicts: { skill: string; issue: string; risk_level: string; action: string }[];
  hidden_skills: { skill: string; found_on: string[]; action: string }[];
  overall_score: number;
  verified_skill_count: number;
  total_target_skills: number;
}

const GITHUB_PRESENCE_THRESHOLD = 15; // Score >= 15 means "GitHub has evidence"

export async function computeEvidence(
  targetSkills: TargetSkill[],
  resumeData: ResumeSkills,
  linkedinData: LinkedInData,
  repos: RepoForScoring[],
  codeSamples: CodeSample[]
): Promise<EvidenceResult> {
  // Pre-compute README data for batch scoring
  const readmes = repos
    .filter((r) => r.readme_content)
    .map((r) => ({ repo: r.name, content: r.readme_content! }));

  // Run code quality and README quality as batch Claude calls ONCE (not per-skill)
  // These are expensive, so we compute them once and reuse across skills
  const [codeQualityResult, readmeResult] = await Promise.all([
    scoreCodeQuality('overall', codeSamples),
    scoreReadmeQuality('overall', readmes),
  ]);

  // Score each target skill
  const evidenceScores: EvidenceScore[] = [];
  const conflicts: { skill: string; issue: string; risk_level: string; action: string }[] = [];
  const hiddenSkills: { skill: string; found_on: string[]; action: string }[] = [];

  for (const targetSkill of targetSkills) {
    const skillName = targetSkill.name;

    // Component A: Language presence (per-skill)
    const langResult = scoreLanguagePresence(skillName, repos);

    // Component B: Structural evidence (per-skill using matching repos)
    const matchingRepos = langResult.matching_repos.length > 0
      ? repos.filter((r) => langResult.matching_repos.includes(r.name))
      : repos;
    const structResult = scoreStructuralEvidence(skillName, matchingRepos);

    // Components C & D: Use the batch results (shared across skills)
    // If the skill has matching repos, the code quality is more relevant
    // For simplicity, use the global scores — this is accurate enough for a hackathon
    const codeScore = langResult.matching_repos.length > 0 ? codeQualityResult.score : 0;
    const readmeScore = langResult.matching_repos.length > 0 ? readmeResult.score : 0;

    // Component E: LinkedIn corroboration (per-skill)
    const linkedinResult = scoreLinkedInCorroboration(skillName, linkedinData);

    // Total evidence score
    const totalScore = langResult.score + structResult.score + codeScore + readmeScore + linkedinResult.score;

    // Determine source presence for cross-reference
    const onResume = resumeData.skills.some(
      (s) => s.name.toLowerCase() === skillName.toLowerCase() ||
             s.name.toLowerCase().includes(skillName.toLowerCase()) ||
             skillName.toLowerCase().includes(s.name.toLowerCase())
    );

    const onLinkedIn = linkedinData.skills.some(
      (s) => s.name.toLowerCase() === skillName.toLowerCase() ||
             s.name.toLowerCase().includes(skillName.toLowerCase()) ||
             skillName.toLowerCase().includes(s.name.toLowerCase())
    ) || linkedinData.experience.some(
      (exp) => exp.skills_mentioned.some(
        (s) => s.toLowerCase().includes(skillName.toLowerCase())
      )
    );

    const githubScore = langResult.score + structResult.score + codeScore + readmeScore;
    const onGitHub = githubScore >= GITHUB_PRESENCE_THRESHOLD;

    // Cross-reference classification
    const crossRef = classifyCrossReference(skillName, onResume, onLinkedIn, onGitHub);

    evidenceScores.push({
      skill_name: skillName,
      importance: targetSkill.importance,
      category: targetSkill.category,
      evidence_score: Math.min(100, totalScore),
      components: {
        github_language: { score: langResult.score, max: 25, details: langResult.details },
        github_structure: { score: structResult.score, max: 20, details: structResult.details },
        github_code_quality: { score: codeScore, max: 20, details: codeQualityResult.details },
        github_readme: { score: readmeScore, max: 10, details: readmeResult.details },
        linkedin_corroboration: { score: linkedinResult.score, max: 25, details: linkedinResult.details },
      },
      cross_reference: crossRef,
    });

    // Collect conflicts
    if (crossRef.status === 'suspicious') {
      conflicts.push({
        skill: skillName,
        issue: crossRef.description,
        risk_level: 'high',
        action: crossRef.action,
      });
    } else if (crossRef.status === 'claimed_unproven') {
      conflicts.push({
        skill: skillName,
        issue: crossRef.description,
        risk_level: 'medium',
        action: crossRef.action,
      });
    }

    // Collect hidden skills
    if (crossRef.status === 'hidden_skill') {
      const foundOn: string[] = [];
      if (onLinkedIn) foundOn.push('linkedin');
      if (onGitHub) foundOn.push('github');
      hiddenSkills.push({ skill: skillName, found_on: foundOn, action: crossRef.action });
    } else if (crossRef.status === 'undiscovered') {
      hiddenSkills.push({ skill: skillName, found_on: ['github'], action: crossRef.action });
    }
  }

  // Compute overall score
  const { overall_score, verified_count, total_count } = computeOverallScore(
    evidenceScores.map((e) => ({
      skill_name: e.skill_name,
      importance: e.importance,
      evidence_score: e.evidence_score,
    }))
  );

  return {
    evidence_scores: evidenceScores,
    conflicts,
    hidden_skills: hiddenSkills,
    overall_score,
    verified_skill_count: verified_count,
    total_target_skills: total_count,
  };
}
