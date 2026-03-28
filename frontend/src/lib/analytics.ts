/* eslint-disable @typescript-eslint/no-explicit-any */

// ─── Dynamic analytics computation from scan data ───

export interface SkillMetrics {
  total: number;
  strong: number;
  moderate: number;
  weak: number;
  strongPct: number;
  moderatePct: number;
  weakPct: number;
  avgScore: number;
  criticalCount: number;
  importantCount: number;
  niceCount: number;
  verifiedCount: number;
  sourceBreakdown: { resume: number; linkedin: number; github: number };
  statusCounts: Record<string, number>;
}

export interface DeltaMetrics {
  scoreChange: number | null;
  scorePctChange: number | null;
  verifiedChange: number | null;
  readinessChange: number | null;
  direction: 'up' | 'down' | 'neutral';
  hasPrevious: boolean;
}

export interface SkillBarData {
  name: string;
  score: number;
  importance: string;
  status: string;
}

export interface SourceCoverageData {
  source: string;
  found: number;
  notFound: number;
  pct: number;
}

export interface StrengthDistribution {
  label: string;
  count: number;
  pct: number;
  color: string;
}

export interface TrendPoint {
  date: string;
  label: string;
  score: number;
  verified: number;
  total: number;
  readiness: number;
}

// Compute skill-level metrics from evidence matrix
export function computeSkillMetrics(evidenceScores: any[]): SkillMetrics {
  if (!evidenceScores || evidenceScores.length === 0) {
    return {
      total: 0, strong: 0, moderate: 0, weak: 0,
      strongPct: 0, moderatePct: 0, weakPct: 0,
      avgScore: 0, criticalCount: 0, importantCount: 0, niceCount: 0,
      verifiedCount: 0,
      sourceBreakdown: { resume: 0, linkedin: 0, github: 0 },
      statusCounts: {},
    };
  }

  const total = evidenceScores.length;
  const strong = evidenceScores.filter(s => (s.evidence_score ?? 0) >= 60).length;
  const moderate = evidenceScores.filter(s => {
    const sc = s.evidence_score ?? 0;
    return sc >= 35 && sc < 60;
  }).length;
  const weak = total - strong - moderate;

  const avgScore = total > 0
    ? Math.round(evidenceScores.reduce((sum, s) => sum + (s.evidence_score ?? 0), 0) / total)
    : 0;

  const criticalCount = evidenceScores.filter(s => s.importance === 'critical').length;
  const importantCount = evidenceScores.filter(s => s.importance === 'important').length;
  const niceCount = evidenceScores.filter(s => s.importance === 'nice_to_have').length;
  const verifiedCount = evidenceScores.filter(s => (s.evidence_score ?? 0) >= 55).length;

  const sourceBreakdown = { resume: 0, linkedin: 0, github: 0 };
  const statusCounts: Record<string, number> = {};

  evidenceScores.forEach(s => {
    const xref = s.cross_reference || {};
    if (xref.resume) sourceBreakdown.resume++;
    if (xref.linkedin) sourceBreakdown.linkedin++;
    if (xref.github) sourceBreakdown.github++;
    const status = xref.status || 'unknown';
    statusCounts[status] = (statusCounts[status] || 0) + 1;
  });

  return {
    total, strong, moderate, weak,
    strongPct: total > 0 ? Math.round((strong / total) * 100) : 0,
    moderatePct: total > 0 ? Math.round((moderate / total) * 100) : 0,
    weakPct: total > 0 ? Math.round((weak / total) * 100) : 0,
    avgScore, criticalCount, importantCount, niceCount, verifiedCount,
    sourceBreakdown, statusCounts,
  };
}

// Compute delta between current and previous scan
export function computeDelta(current: any, previous: any | null): DeltaMetrics {
  if (!previous) {
    return { scoreChange: null, scorePctChange: null, verifiedChange: null, readinessChange: null, direction: 'neutral', hasPrevious: false };
  }

  const currScore = current.overall_score ?? 0;
  const prevScore = previous.overall_score ?? 0;
  const scoreChange = currScore - prevScore;
  const scorePctChange = prevScore > 0 ? Math.round(((currScore - prevScore) / prevScore) * 100) : null;

  const currVerified = current.verified_skill_count ?? 0;
  const prevVerified = previous.verified_skill_count ?? 0;
  const verifiedChange = currVerified - prevVerified;

  const currReadiness = current.delta_projection?.current_readiness ?? current.overall_readiness_percentage ?? 0;
  const prevReadiness = previous.delta_projection?.current_readiness ?? previous.overall_readiness_percentage ?? 0;
  const readinessChange = currReadiness - prevReadiness;

  const direction = scoreChange > 0 ? 'up' : scoreChange < 0 ? 'down' : 'neutral';

  return { scoreChange, scorePctChange, verifiedChange, readinessChange, direction, hasPrevious: true };
}

// Build sorted horizontal bar chart data
export function buildSkillBarData(evidenceScores: any[]): SkillBarData[] {
  if (!evidenceScores) return [];
  return [...evidenceScores]
    .sort((a, b) => (b.evidence_score ?? 0) - (a.evidence_score ?? 0))
    .map(s => ({
      name: s.skill_name || '',
      score: s.evidence_score ?? 0,
      importance: s.importance || 'nice_to_have',
      status: s.cross_reference?.status || '',
    }));
}

// Build source coverage data for horizontal stacked bars
export function buildSourceCoverage(evidenceScores: any[]): SourceCoverageData[] {
  if (!evidenceScores || evidenceScores.length === 0) return [];
  const total = evidenceScores.length;
  const resume = evidenceScores.filter(s => s.cross_reference?.resume).length;
  const linkedin = evidenceScores.filter(s => s.cross_reference?.linkedin).length;
  const github = evidenceScores.filter(s => s.cross_reference?.github).length;

  return [
    { source: 'Resume', found: resume, notFound: total - resume, pct: Math.round((resume / total) * 100) },
    { source: 'LinkedIn', found: linkedin, notFound: total - linkedin, pct: Math.round((linkedin / total) * 100) },
    { source: 'GitHub', found: github, notFound: total - github, pct: Math.round((github / total) * 100) },
  ];
}

// Build strength distribution for stacked bar
export function buildStrengthDistribution(evidenceScores: any[]): StrengthDistribution[] {
  const metrics = computeSkillMetrics(evidenceScores);
  return [
    { label: 'Strong', count: metrics.strong, pct: metrics.strongPct, color: '#10b981' },
    { label: 'Moderate', count: metrics.moderate, pct: metrics.moderatePct, color: '#f59e0b' },
    { label: 'Weak', count: metrics.weak, pct: metrics.weakPct, color: '#ef4444' },
  ];
}

// Build trend data from scan history
export function buildTrendData(scanHistory: any[], targetRole?: string): TrendPoint[] {
  const filtered = targetRole
    ? scanHistory.filter(s => s.target_role === targetRole)
    : scanHistory;

  return filtered
    .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    .map(s => ({
      date: s.created_at,
      label: new Date(s.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      score: s.overall_score ?? 0,
      verified: s.verified_skill_count ?? 0,
      total: s.total_target_skills ?? 0,
      readiness: s.delta_projection?.current_readiness ?? s.overall_readiness_percentage ?? s.overall_score ?? 0,
    }));
}

// Get top weak skills sorted by importance then score ascending
export function getWeakSkills(evidenceScores: any[], limit = 5): any[] {
  const importanceOrder: Record<string, number> = { critical: 0, important: 1, nice_to_have: 2 };
  return [...(evidenceScores || [])]
    .filter(s => (s.evidence_score ?? 0) < 35)
    .sort((a, b) => {
      const ia = importanceOrder[a.importance] ?? 2;
      const ib = importanceOrder[b.importance] ?? 2;
      if (ia !== ib) return ia - ib;
      return (a.evidence_score ?? 0) - (b.evidence_score ?? 0);
    })
    .slice(0, limit);
}

// Get top strong skills
export function getStrongSkills(evidenceScores: any[], limit = 5): any[] {
  return [...(evidenceScores || [])]
    .filter(s => (s.evidence_score ?? 0) >= 60)
    .sort((a, b) => (b.evidence_score ?? 0) - (a.evidence_score ?? 0))
    .slice(0, limit);
}

// Compute "focus areas" - critical skills that are weak
export function getFocusAreas(evidenceScores: any[]): any[] {
  return (evidenceScores || [])
    .filter(s => s.importance === 'critical' && (s.evidence_score ?? 0) < 60)
    .sort((a, b) => (a.evidence_score ?? 0) - (b.evidence_score ?? 0));
}
