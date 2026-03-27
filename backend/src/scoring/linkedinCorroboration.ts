interface LinkedInSkill {
  name: string;
  endorsement_count: number;
  listed_position: number;
}

interface LinkedInCert {
  name: string;
  issuer: string;
  date: string;
}

interface LinkedInCourse {
  name: string;
  platform: string;
}

interface LinkedInExperience {
  title: string;
  company: string;
  description: string;
  skills_mentioned: string[];
}

interface LinkedInData {
  skills: LinkedInSkill[];
  certifications: LinkedInCert[];
  courses: LinkedInCourse[];
  experience: LinkedInExperience[];
  recommendations_count: number;
}

interface CorroborationResult {
  score: number;
  details: string;
  signals: string[];
}

/**
 * Component E: Check LinkedIn for social/professional validation of a skill.
 * Score: 0-25 points
 */
export function scoreLinkedInCorroboration(
  skillName: string,
  linkedinData: LinkedInData
): CorroborationResult {
  let score = 0;
  const signals: string[] = [];
  const skillLower = skillName.toLowerCase();

  // Signal 1: Skill explicitly listed on LinkedIn profile (+5)
  const listedSkill = linkedinData.skills.find(
    (s) => s.name.toLowerCase() === skillLower ||
           s.name.toLowerCase().includes(skillLower) ||
           skillLower.includes(s.name.toLowerCase())
  );

  if (listedSkill) {
    score += 5;
    signals.push(`Listed on LinkedIn (position #${listedSkill.listed_position})`);

    // Signal 2: Endorsement count
    if (listedSkill.endorsement_count >= 10) {
      score += 7;
      signals.push(`${listedSkill.endorsement_count} endorsements (strong)`);
    } else if (listedSkill.endorsement_count >= 3) {
      score += 4;
      signals.push(`${listedSkill.endorsement_count} endorsements (moderate)`);
    } else if (listedSkill.endorsement_count >= 1) {
      score += 2;
      signals.push(`${listedSkill.endorsement_count} endorsement(s) (minimal)`);
    }
  }

  // Signal 3: Skill mentioned in job descriptions (+5)
  const mentionedInJob = linkedinData.experience.some(
    (exp) => exp.skills_mentioned.some(
      (s) => s.toLowerCase() === skillLower ||
             s.toLowerCase().includes(skillLower) ||
             skillLower.includes(s.toLowerCase())
    ) || exp.description.toLowerCase().includes(skillLower)
  );

  if (mentionedInJob) {
    score += 5;
    signals.push('Mentioned in job experience');
  }

  // Signal 4: Relevant certification (+6)
  const hasCert = linkedinData.certifications.some(
    (cert) => cert.name.toLowerCase().includes(skillLower) ||
              skillLower.includes(cert.name.toLowerCase().split(' ')[0])
  );

  if (hasCert) {
    score += 6;
    signals.push('Has relevant certification');
  }

  // Signal 5: Relevant course completed (+3)
  const hasCourse = linkedinData.courses.some(
    (course) => course.name.toLowerCase().includes(skillLower)
  );

  if (hasCourse) {
    score += 3;
    signals.push('Completed relevant course');
  }

  // Cap at 25
  score = Math.min(score, 25);

  const details = signals.length > 0
    ? signals.join('; ')
    : 'No LinkedIn evidence found for this skill';

  return { score, details, signals };
}
