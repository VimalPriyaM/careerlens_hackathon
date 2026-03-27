import { IMPORTANCE_WEIGHTS } from '../config/constants';

interface ScoredSkill {
  skill_name: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  evidence_score: number;
}

/**
 * Compute weighted overall evidence score across all target skills.
 * Critical skills weigh 3x, important 2x, nice-to-have 1x.
 */
export function computeOverallScore(skills: ScoredSkill[]): {
  overall_score: number;
  verified_count: number;
  total_count: number;
} {
  if (skills.length === 0) {
    return { overall_score: 0, verified_count: 0, total_count: 0 };
  }

  let totalWeightedScore = 0;
  let totalWeight = 0;
  let verifiedCount = 0;

  for (const skill of skills) {
    const weight = IMPORTANCE_WEIGHTS[skill.importance] || 1;
    totalWeightedScore += skill.evidence_score * weight;
    totalWeight += 100 * weight; // Max possible per skill is 100
    if (skill.evidence_score >= 55) {
      verifiedCount++;
    }
  }

  const overallScore = totalWeight > 0
    ? Math.round((totalWeightedScore / totalWeight) * 100)
    : 0;

  return {
    overall_score: overallScore,
    verified_count: verifiedCount,
    total_count: skills.length,
  };
}
