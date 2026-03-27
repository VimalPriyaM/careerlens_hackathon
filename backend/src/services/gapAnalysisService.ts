import { getClaude } from '../utils/claude';
import { GAP_ANALYSIS_SYSTEM_PROMPT, buildGapAnalysisPrompt } from '../prompts/gapAnalysis';
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '../config/constants';
import { parseLLMJSON } from '../utils/parseLLMJSON';
import { EvidenceScore } from './evidenceService';

export interface GapAnalysisResult {
  gap_summary: string;
  critical_conflicts: { skill: string; issue: string; risk_level: string; action: string }[];
  hidden_skills_to_add: { skill: string; found_on: string[]; action: string }[];
  projects: {
    title: string;
    description: string;
    tech_stack: string[];
    skills_covered: string[];
    estimated_hours: number;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    github_checklist: string[];
    evidence_impact: string;
  }[];
  quick_wins: string[];
  overall_readiness_percentage: number;
  projected_readiness_after_projects: number;
}

export async function generateGapAnalysis(
  evidenceScores: EvidenceScore[],
  targetSkills: any,
  conflicts: { skill: string; issue: string; risk_level: string; action: string }[],
  hiddenSkills: { skill: string; found_on: string[]; action: string }[]
): Promise<GapAnalysisResult> {
  const llm = getClaude();

  // Build a compact evidence summary for the prompt
  const evidenceSummary = evidenceScores.map((e) => ({
    skill: e.skill_name,
    importance: e.importance,
    score: e.evidence_score,
    status: e.cross_reference.status,
    resume: e.cross_reference.resume,
    linkedin: e.cross_reference.linkedin,
    github: e.cross_reference.github,
  }));

  const response = await llm.chat.completions.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [
      { role: 'system', content: GAP_ANALYSIS_SYSTEM_PROMPT },
      {
        role: 'user',
        content: buildGapAnalysisPrompt(
          JSON.stringify(evidenceSummary, null, 2),
          JSON.stringify(targetSkills, null, 2),
          JSON.stringify([...conflicts, ...hiddenSkills.map((h) => ({
            skill: h.skill,
            issue: `Hidden skill found on ${h.found_on.join(' and ')} but missing from resume`,
            risk_level: 'low',
            action: h.action,
          }))], null, 2)
        ),
      },
    ],
  });

  const responseText = response.choices[0]?.message?.content || '';

  const parsed = parseLLMJSON(responseText, 'gap analysis');

  return {
    gap_summary: parsed.gap_summary || '',
    critical_conflicts: parsed.critical_conflicts || conflicts,
    hidden_skills_to_add: parsed.hidden_skills_to_add || hiddenSkills,
    projects: parsed.projects || [],
    quick_wins: parsed.quick_wins || [],
    overall_readiness_percentage: parsed.overall_readiness_percentage || 0,
    projected_readiness_after_projects: parsed.projected_readiness_after_projects || 0,
  };
}
