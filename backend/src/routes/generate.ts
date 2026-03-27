import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { getClaude } from '../utils/claude';
import { CLAUDE_MODEL } from '../config/constants';
import { supabaseAdmin } from '../utils/supabase';

const router = Router();

/**
 * POST /api/generate-bullet — Generate a resume bullet point from a project description
 */
router.post('/generate-bullet', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { project_description, tech_stack, scan_id } = req.body;

    // Validate project_description
    if (
      !project_description ||
      typeof project_description !== 'string' ||
      project_description.trim().length < 10
    ) {
      res.status(400).json({
        error: true,
        code: 'INVALID_DESCRIPTION',
        message: 'Project description is required and must be at least 10 characters.',
      });
      return;
    }

    if (project_description.length > 1000) {
      res.status(400).json({
        error: true,
        code: 'DESCRIPTION_TOO_LONG',
        message: 'Project description must be 1000 characters or fewer.',
      });
      return;
    }

    // Validate tech_stack
    if (!tech_stack || !Array.isArray(tech_stack) || tech_stack.length === 0) {
      res.status(400).json({
        error: true,
        code: 'INVALID_TECH_STACK',
        message: 'Tech stack is required and must be a non-empty array of strings.',
      });
      return;
    }

    // Fetch scan context if provided
    let roleContext = '';
    if (scan_id) {
      const { data: scan } = await supabaseAdmin
        .from('scans')
        .select('target_role, evidence, gap_analysis')
        .eq('id', scan_id)
        .single();

      if (scan) {
        roleContext = `\nTarget Role: ${scan.target_role || 'Not specified'}`;

        // Add top critical skills for context
        const skillScores =
          scan.evidence?.skill_scores ||
          scan.gap_analysis?.skill_scores ||
          [];
        const criticalSkills = skillScores
          .filter((s: any) => s.importance === 'critical' || s.score < 40)
          .slice(0, 5)
          .map((s: any) => s.skill || s.name)
          .filter(Boolean);

        if (criticalSkills.length > 0) {
          roleContext += `\nKey skills to highlight if relevant: ${criticalSkills.join(', ')}`;
        }
      }
    }

    const techStackStr = tech_stack.join(', ');

    const systemPrompt = `You are a resume writing expert. Generate a single resume bullet point. Rules:
- Start with a strong action verb (e.g., Engineered, Architected, Developed, Implemented, Optimized)
- Include a metric or quantifiable outcome (e.g., reduced latency by 40%, served 10K+ users)
- Mention the actual tech stack used
- Keep it to 1-2 lines maximum
- Align with the target role if provided
- Return ONLY the bullet point text, no quotes, no dash prefix, no explanation`;

    const userContent = `Project Description: ${project_description.trim()}
Tech Stack: ${techStackStr}${roleContext}

Generate a single polished resume bullet point for this project.`;

    const claude = getClaude();
    const response = await claude.messages.create({
      model: CLAUDE_MODEL,
      max_tokens: 256,
      system: systemPrompt,
      messages: [{ role: 'user', content: userContent }],
    });

    const bullet =
      response.content
        .filter((block) => block.type === 'text')
        .map((block) => {
          if (block.type === 'text') return block.text;
          return '';
        })
        .join('')
        .trim() || 'Unable to generate bullet point. Please try again.';

    res.json({ bullet });
  } catch (error: any) {
    console.error('Generate bullet error:', error);
    res.status(500).json({
      error: true,
      code: 'GENERATE_ERROR',
      message: 'Failed to generate resume bullet. Please try again.',
    });
  }
});

export default router;
