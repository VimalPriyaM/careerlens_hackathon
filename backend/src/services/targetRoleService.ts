import { getClaude } from '../utils/claude';
import { TARGET_ROLE_SYSTEM_PROMPT, buildTargetRolePrompt } from '../prompts/targetRoleSkills';
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '../config/constants';

export interface TargetSkill {
  name: string;
  importance: 'critical' | 'important' | 'nice_to_have';
  category: 'language' | 'framework' | 'tool' | 'platform' | 'concept';
  typical_evidence: string;
}

export interface TargetRoleAnalysis {
  role: string;
  role_category: string;
  required_skills: TargetSkill[];
}

export async function analyzeTargetRole(targetRole: string): Promise<TargetRoleAnalysis> {
  const claude = getClaude();

  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: TARGET_ROLE_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildTargetRolePrompt(targetRole) }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  let parsed: any;
  try {
    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse target role analysis response:', responseText);
    throw new Error('Failed to analyze target role. Please try again.');
  }

  return {
    role: parsed.role || targetRole,
    role_category: parsed.role_category || 'unknown',
    required_skills: parsed.required_skills || [],
  };
}
