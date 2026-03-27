/**
 * Builds a human-readable system prompt from scan data for the chat co-pilot.
 * Uses actual Supabase scan field names.
 */
export function buildChatSystemPrompt(scanData: any): string {
  const sections: string[] = [];

  sections.push(
    `You are CareerLens AI, a career development co-pilot. You have the user's complete profile analysis below. ALWAYS reference their actual data — never give generic advice. Be encouraging but realistic. When asked about strengths, cite specific evidence scores. When asked what to build, reference the project roadmap. When asked for a resume bullet, use: action-verb first, include metric/outcome, mention tech stack, 1-2 lines max. If a skill is suspicious (resume-only), say so constructively.`
  );

  // Profile overview
  const targetRole = scanData.target_role || 'Not specified';
  const overallScore = scanData.overall_score ?? 0;
  const verified = scanData.verified_skill_count ?? 0;
  const total = scanData.total_target_skills ?? 0;
  const readiness = scanData.overall_readiness_percentage ?? 0;
  const projected = scanData.projected_readiness ?? 0;

  sections.push(
    `=== PROFILE ===\nTarget Role: ${targetRole}\nEvidence Score: ${overallScore}/100\nSkills Verified: ${verified}/${total}\nReadiness: ${readiness}%\nProjected After Projects: ${projected}%`
  );

  // Gap summary
  if (scanData.gap_summary) {
    sections.push(`=== ASSESSMENT ===\n${scanData.gap_summary}`);
  }

  // Evidence scores (from evidence_scores JSONB column)
  const evidenceScores = scanData.evidence_scores || [];
  if (evidenceScores.length > 0) {
    const lines = evidenceScores.map((s: any) => {
      const score = s.evidence_score ?? 0;
      const icon = score >= 60 ? '✅' : score >= 35 ? '⚠️' : '❌';
      const xref = s.cross_reference || {};
      const sources: string[] = [];
      if (xref.resume) sources.push('Resume');
      if (xref.linkedin) sources.push('LinkedIn');
      if (xref.github) sources.push('GitHub');
      return `${icon} ${s.skill_name} (${score}/100) — ${xref.label || s.importance || 'unknown'} [${sources.join(', ') || 'none'}]`;
    });
    sections.push(`=== SKILL EVIDENCE ===\n${lines.join('\n')}`);
  }

  // Conflicts
  const conflicts = scanData.conflicts || [];
  if (conflicts.length > 0) {
    const lines = conflicts.map((c: any) =>
      `- ${c.skill}: ${c.issue} → ${c.action}`
    );
    sections.push(`=== CONFLICTS ===\n${lines.join('\n')}`);
  }

  // Hidden skills
  const hiddenSkills = scanData.hidden_skills || [];
  if (hiddenSkills.length > 0) {
    const lines = hiddenSkills.map((h: any) =>
      `- ${h.skill}: found on ${Array.isArray(h.found_on) ? h.found_on.join(' & ') : h.found_on} → ${h.action}`
    );
    sections.push(`=== HIDDEN SKILLS ===\n${lines.join('\n')}`);
  }

  // Project recommendations
  const projects = scanData.project_recommendations || [];
  if (projects.length > 0) {
    const lines = projects.map((p: any, i: number) => {
      const skills = Array.isArray(p.skills_covered) ? p.skills_covered.join(', ') : '';
      return `${i + 1}. "${p.title}" — ${p.difficulty}, ~${p.estimated_hours}h — covers: ${skills}`;
    });
    sections.push(`=== RECOMMENDED PROJECTS ===\n${lines.join('\n')}`);
  }

  // Quick wins
  const quickWins = scanData.quick_wins || [];
  if (quickWins.length > 0) {
    sections.push(`=== QUICK WINS ===\n${quickWins.map((w: string) => `- ${w}`).join('\n')}`);
  }

  // Resume skills (from resume_skills JSONB)
  const resumeSkills = scanData.resume_skills?.skills || [];
  if (resumeSkills.length > 0) {
    const names = resumeSkills.slice(0, 20).map((s: any) => `${s.name} (${s.confidence})`).join(', ');
    sections.push(`=== RESUME SKILLS ===\n${names}`);
  }

  // GitHub summary (from github_data JSONB)
  const github = scanData.github_data || {};
  if (github.username) {
    const langs = github.aggregate_languages
      ? Object.entries(github.aggregate_languages)
          .sort(([, a], [, b]) => (b as number) - (a as number))
          .slice(0, 8)
          .map(([lang]) => lang)
          .join(', ')
      : 'N/A';
    const repoCount = Array.isArray(github.repos) ? github.repos.length : github.public_repos || 0;
    sections.push(`=== GITHUB ===\nUsername: ${github.username}\nRepos Analyzed: ${repoCount}\nTop Languages: ${langs}`);
  }

  // LinkedIn summary (from linkedin_skills JSONB)
  const linkedin = scanData.linkedin_skills || {};
  if (linkedin.headline || linkedin.skills) {
    const parts: string[] = [];
    if (linkedin.headline) parts.push(`Headline: ${linkedin.headline}`);
    if (Array.isArray(linkedin.skills) && linkedin.skills.length > 0) {
      const topSkills = linkedin.skills.slice(0, 10).map((s: any) =>
        `${s.name}${s.endorsement_count ? ` (${s.endorsement_count} endorsements)` : ''}`
      ).join(', ');
      parts.push(`Skills: ${topSkills}`);
    }
    if (Array.isArray(linkedin.certifications) && linkedin.certifications.length > 0) {
      parts.push(`Certs: ${linkedin.certifications.map((c: any) => c.name).join(', ')}`);
    }
    sections.push(`=== LINKEDIN ===\n${parts.join('\n')}`);
  }

  return sections.join('\n\n');
}
