export type CrossRefStatus =
  | 'fully_verified'
  | 'claimed_unproven'
  | 'underreported'
  | 'hidden_skill'
  | 'suspicious'
  | 'undiscovered'
  | 'social_only'
  | 'missing';

export interface CrossRefResult {
  status: CrossRefStatus;
  label: string;
  resume: boolean;
  linkedin: boolean;
  github: boolean;
  description: string;
  action: string;
}

/**
 * Classify a skill into one of 8 cross-reference scenarios based on which sources contain it.
 *
 * "github" here means the GitHub evidence score for this specific skill is above a threshold (>= 15).
 * "linkedin" means the skill was found on LinkedIn (listed or mentioned in experience).
 * "resume" means the skill was found on the resume (explicit or inferred).
 */
export function classifyCrossReference(
  skillName: string,
  onResume: boolean,
  onLinkedIn: boolean,
  onGitHub: boolean
): CrossRefResult {
  if (onResume && onLinkedIn && onGitHub) {
    return {
      status: 'fully_verified',
      label: 'Fully Verified',
      resume: true, linkedin: true, github: true,
      description: 'All three sources independently confirm this skill. Strongest possible evidence.',
      action: 'No action needed — this is a strength.',
    };
  }

  if (onResume && onLinkedIn && !onGitHub) {
    return {
      status: 'claimed_unproven',
      label: 'Claimed, Unproven',
      resume: true, linkedin: true, github: false,
      description: 'Resume and LinkedIn agree, but no code evidence on GitHub.',
      action: `Build a project using ${skillName} and push it to GitHub to create code evidence.`,
    };
  }

  if (onResume && !onLinkedIn && onGitHub) {
    return {
      status: 'underreported',
      label: 'Underreported',
      resume: true, linkedin: false, github: true,
      description: 'Resume and GitHub confirm it, but LinkedIn doesn\'t mention it.',
      action: `Add ${skillName} to your LinkedIn skills section.`,
    };
  }

  if (!onResume && onLinkedIn && onGitHub) {
    return {
      status: 'hidden_skill',
      label: 'Hidden Skill',
      resume: false, linkedin: true, github: true,
      description: 'LinkedIn and GitHub confirm it, but it\'s missing from your resume!',
      action: `Add ${skillName} to your resume immediately — you have strong evidence for it.`,
    };
  }

  if (onResume && !onLinkedIn && !onGitHub) {
    return {
      status: 'suspicious',
      label: 'Suspicious Claim',
      resume: true, linkedin: false, github: false,
      description: 'Only appears on the resume. No social validation and no code evidence.',
      action: `High risk of recruiter scrutiny. Either build a project to prove ${skillName} or remove it from your resume.`,
    };
  }

  if (!onResume && !onLinkedIn && onGitHub) {
    return {
      status: 'undiscovered',
      label: 'Undiscovered',
      resume: false, linkedin: false, github: true,
      description: 'Code evidence exists but you don\'t even identify with this skill.',
      action: `Add ${skillName} to both your resume and LinkedIn — your code already proves it.`,
    };
  }

  if (!onResume && onLinkedIn && !onGitHub) {
    return {
      status: 'social_only',
      label: 'Social Only',
      resume: false, linkedin: true, github: false,
      description: 'Only on LinkedIn, possibly from endorsement exchanges. Weak signal.',
      action: `Build a project using ${skillName} to back up the LinkedIn listing.`,
    };
  }

  // !onResume && !onLinkedIn && !onGitHub
  return {
    status: 'missing',
    label: 'Missing',
    resume: false, linkedin: false, github: false,
    description: 'Required for the target role but absent from all three sources.',
    action: `Priority: learn ${skillName} and build a project demonstrating it.`,
  };
}
