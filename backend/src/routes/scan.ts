import { Router, Response } from 'express';
import { authMiddleware, AuthenticatedRequest } from '../middleware/auth';
import { uploadMiddleware } from '../middleware/upload';
import { parseResume } from '../services/resumeService';
import { parseLinkedIn } from '../services/linkedinService';
import { analyzeGitHubProfile } from '../services/githubService';
import { analyzeTargetRole } from '../services/targetRoleService';
import { supabaseAdmin } from '../utils/supabase';
import { computeEvidence } from '../services/evidenceService';
import { generateGapAnalysis } from '../services/gapAnalysisService';
import { sanitizeString, validateGithubUsername } from '../utils/sanitize';

const router = Router();

/**
 * POST /api/scan
 * Main scan endpoint — runs all 4 extraction pipelines in parallel
 */
router.post('/scan', authMiddleware, (req: AuthenticatedRequest, res: Response, next) => {
  uploadMiddleware(req, res, async (uploadError) => {
    if (uploadError) {
      return res.status(400).json({
        error: true,
        code: 'UPLOAD_ERROR',
        message: uploadError.message || 'File upload failed. Please upload valid PDF files under 5MB.',
      });
    }

    try {
      const userId = req.userId!;
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const githubUsername = req.body?.github_username;
      const targetRole = req.body?.target_role;

      // Validate inputs
      if (!files?.resume?.[0]) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_RESUME',
          message: 'Resume PDF is required.',
        });
      }

      if (!files?.linkedin?.[0]) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_LINKEDIN',
          message: 'LinkedIn PDF is required. Export from LinkedIn: Profile → More → Save to PDF.',
        });
      }

      const ghValidation = validateGithubUsername(githubUsername);
      if (!ghValidation.valid) {
        return res.status(400).json({
          error: true,
          code: 'INVALID_GITHUB',
          message: ghValidation.error || 'Invalid GitHub username.',
        });
      }

      const cleanRole = sanitizeString(targetRole, 200);
      if (cleanRole.length === 0) {
        return res.status(400).json({
          error: true,
          code: 'MISSING_TARGET_ROLE',
          message: 'Target job role is required.',
        });
      }

      const resumeBuffer = files.resume[0].buffer;
      const linkedinBuffer = files.linkedin[0].buffer;
      const cleanUsername = ghValidation.cleaned;

      // Generate scan ID upfront for file storage paths
      const scanId = crypto.randomUUID();

      // Upload PDFs to Supabase Storage in parallel with extraction
      const resumePath = `${userId}/${scanId}_resume.pdf`;
      const linkedinPath = `${userId}/${scanId}_linkedin.pdf`;

      // Run ALL operations in parallel
      const [
        resumeResult,
        linkedinResult,
        githubResult,
        targetRoleResult,
        resumeUpload,
        linkedinUpload,
      ] = await Promise.allSettled([
        parseResume(resumeBuffer),
        parseLinkedIn(linkedinBuffer),
        analyzeGitHubProfile(cleanUsername),
        analyzeTargetRole(cleanRole),
        supabaseAdmin.storage.from('user-documents').upload(resumePath, resumeBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        }),
        supabaseAdmin.storage.from('user-documents').upload(linkedinPath, linkedinBuffer, {
          contentType: 'application/pdf',
          upsert: true,
        }),
      ]);

      // Check for critical failures
      const errors: string[] = [];

      if (resumeResult.status === 'rejected') {
        errors.push(`Resume parsing failed: ${resumeResult.reason?.message || 'Unknown error'}`);
      }
      if (linkedinResult.status === 'rejected') {
        errors.push(`LinkedIn parsing failed: ${linkedinResult.reason?.message || 'Unknown error'}`);
      }
      if (githubResult.status === 'rejected') {
        errors.push(`GitHub analysis failed: ${githubResult.reason?.message || 'Unknown error'}`);
      }
      if (targetRoleResult.status === 'rejected') {
        errors.push(`Target role analysis failed: ${targetRoleResult.reason?.message || 'Unknown error'}`);
      }

      // If ANY critical extraction failed, return error with details
      if (errors.length > 0) {
        return res.status(502).json({
          error: true,
          code: 'EXTRACTION_FAILED',
          message: 'One or more extraction pipelines failed.',
          details: errors,
        });
      }

      // All succeeded — extract values
      const resume = (resumeResult as PromiseFulfilledResult<any>).value;
      const linkedin = (linkedinResult as PromiseFulfilledResult<any>).value;
      const github = (githubResult as PromiseFulfilledResult<any>).value;
      const targetSkills = (targetRoleResult as PromiseFulfilledResult<any>).value;

      // ── PHASE 2: Evidence Scoring ──
      const reposForScoring = github.repos.map((r: any) => ({
        name: r.name,
        languages: r.languages,
        file_tree: r.file_tree,
        readme_content: r.readme_content,
      }));

      const codeSamplesFlat = github.repos.flatMap((r: any) =>
        r.code_samples.map((s: any) => ({
          repo: r.name,
          filename: s.filename,
          content: s.content,
          language: s.language,
        }))
      );

      const linkedinForScoring = {
        skills: linkedin.skills || [],
        certifications: linkedin.certifications || [],
        courses: linkedin.courses || [],
        experience: linkedin.experience || [],
        recommendations_count: linkedin.recommendations_count || 0,
      };

      const resumeForScoring = { skills: resume.skills || [] };

      const evidenceResult = await computeEvidence(
        targetSkills.required_skills,
        resumeForScoring,
        linkedinForScoring,
        reposForScoring,
        codeSamplesFlat
      );

      const gapAnalysis = await generateGapAnalysis(
        evidenceResult.evidence_scores,
        targetSkills,
        evidenceResult.conflicts,
        evidenceResult.hidden_skills
      );

      // ── Store complete scan ──
      const scanRecord = {
        id: scanId,
        user_id: userId,
        target_role: cleanRole,
        github_username: cleanUsername,
        resume_file_path: resumePath,
        linkedin_file_path: linkedinPath,
        resume_text: resume.raw_text,
        linkedin_text: linkedin.raw_text,
        resume_skills: {
          skills: resume.skills,
          experience: resume.experience,
          projects: resume.projects,
          education: resume.education,
          certifications: resume.certifications,
        },
        linkedin_skills: {
          headline: linkedin.headline,
          summary: linkedin.summary,
          skills: linkedin.skills,
          experience: linkedin.experience,
          certifications: linkedin.certifications,
          courses: linkedin.courses,
          education: linkedin.education,
          recommendations_count: linkedin.recommendations_count,
          connection_count_range: linkedin.connection_count_range,
        },
        github_data: {
          username: github.username,
          name: github.name,
          bio: github.bio,
          public_repos: github.public_repos,
          followers: github.followers,
          following: github.following,
          account_created: github.created_at,
          repos: github.repos.map((r: any) => ({
            name: r.name,
            full_name: r.full_name,
            description: r.description,
            html_url: r.html_url,
            language: r.language,
            languages: r.languages,
            stargazers_count: r.stargazers_count,
            forks_count: r.forks_count,
            updated_at: r.updated_at,
            created_at: r.created_at,
            fork: r.fork,
            size: r.size,
            file_tree: r.file_tree,
            readme_content: r.readme_content,
            code_samples_count: r.code_samples.length,
          })),
          aggregate_languages: github.aggregate_languages,
        },
        target_skills: targetSkills,
        evidence_scores: evidenceResult.evidence_scores,
        cross_reference_matrix: evidenceResult.evidence_scores.map((e: any) => ({
          skill: e.skill_name,
          ...e.cross_reference,
        })),
        conflicts: evidenceResult.conflicts,
        hidden_skills: evidenceResult.hidden_skills,
        project_recommendations: gapAnalysis.projects,
        delta_projection: {
          current_readiness: gapAnalysis.overall_readiness_percentage,
          projected_readiness: gapAnalysis.projected_readiness_after_projects,
        },
        gap_summary: gapAnalysis.gap_summary,
        quick_wins: gapAnalysis.quick_wins,
        overall_score: evidenceResult.overall_score,
        verified_skill_count: evidenceResult.verified_skill_count,
        total_target_skills: evidenceResult.total_target_skills,
        overall_readiness_percentage: gapAnalysis.overall_readiness_percentage,
        projected_readiness: gapAnalysis.projected_readiness_after_projects,
      };

      const { error: insertError } = await supabaseAdmin
        .from('scans')
        .insert(scanRecord);

      if (insertError) {
        console.error('Failed to store scan:', insertError);
        return res.status(500).json({
          error: true,
          code: 'STORAGE_FAILED',
          message: 'Failed to save scan results. Please try again.',
        });
      }

      // Return complete analysis
      return res.status(200).json({
        scan_id: scanId,
        target_role: cleanRole,
        github_username: cleanUsername,
        overall_score: evidenceResult.overall_score,
        verified_skill_count: evidenceResult.verified_skill_count,
        total_target_skills: evidenceResult.total_target_skills,
        evidence_matrix: evidenceResult.evidence_scores,
        conflicts: evidenceResult.conflicts,
        hidden_skills: evidenceResult.hidden_skills,
        project_recommendations: gapAnalysis.projects,
        delta_projection: {
          current_readiness: gapAnalysis.overall_readiness_percentage,
          projected_readiness: gapAnalysis.projected_readiness_after_projects,
        },
        gap_summary: gapAnalysis.gap_summary,
        quick_wins: gapAnalysis.quick_wins,
        created_at: new Date().toISOString(),
      });
    } catch (error: any) {
      console.error('Scan error:', error);
      return res.status(500).json({
        error: true,
        code: 'SCAN_FAILED',
        message: error.message || 'Scan failed unexpectedly. Please try again.',
      });
    }
  });
});

/**
 * GET /api/scans
 * List all scans for the authenticated user
 */
router.get('/scans', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;

    const { data, error, count } = await supabaseAdmin
      .from('scans')
      .select('id, target_role, overall_score, verified_skill_count, total_target_skills, github_username, created_at', { count: 'exact' })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      throw error;
    }

    return res.json({
      scans: data || [],
      total: count || 0,
    });
  } catch (error: any) {
    console.error('List scans error:', error);
    return res.status(500).json({
      error: true,
      code: 'LIST_SCANS_FAILED',
      message: 'Failed to retrieve scan history.',
    });
  }
});

/**
 * GET /api/scans/:id
 * Get full details of a specific scan
 */
router.get('/scans/:id', authMiddleware, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const scanId = req.params.id;

    const { data, error } = await supabaseAdmin
      .from('scans')
      .select('*')
      .eq('id', scanId)
      .eq('user_id', userId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        error: true,
        code: 'SCAN_NOT_FOUND',
        message: 'Scan not found.',
      });
    }

    return res.json(data);
  } catch (error: any) {
    console.error('Get scan error:', error);
    return res.status(500).json({
      error: true,
      code: 'GET_SCAN_FAILED',
      message: 'Failed to retrieve scan details.',
    });
  }
});

export default router;
