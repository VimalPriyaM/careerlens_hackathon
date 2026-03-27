import pdfParse from 'pdf-parse';
import { getClaude } from '../utils/claude';
import { LINKEDIN_EXTRACTION_SYSTEM_PROMPT, buildLinkedInExtractionPrompt } from '../prompts/linkedinExtraction';
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '../config/constants';
import { parseLLMJSON } from '../utils/parseLLMJSON';

export interface LinkedInSkill {
  name: string;
  endorsement_count: number;
  listed_position: number;
}

export interface LinkedInExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills_mentioned: string[];
}

export interface LinkedInCertification {
  name: string;
  issuer: string;
  date: string;
}

export interface LinkedInCourse {
  name: string;
  platform: string;
}

export interface LinkedInEducation {
  degree: string;
  institution: string;
  year: string;
}

export interface ParsedLinkedIn {
  raw_text: string;
  headline: string;
  summary: string;
  skills: LinkedInSkill[];
  experience: LinkedInExperience[];
  certifications: LinkedInCertification[];
  courses: LinkedInCourse[];
  education: LinkedInEducation[];
  recommendations_count: number;
  connection_count_range: string;
}

export async function parseLinkedIn(pdfBuffer: Buffer): Promise<ParsedLinkedIn> {
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = pdfData.text;

  if (!rawText || rawText.trim().length < 30) {
    throw new Error('LinkedIn PDF appears to be empty or unreadable.');
  }

  const llm = getClaude();
  const response = await llm.chat.completions.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [
      { role: 'system', content: LINKEDIN_EXTRACTION_SYSTEM_PROMPT },
      { role: 'user', content: buildLinkedInExtractionPrompt(rawText) },
    ],
  });

  const responseText = response.choices[0]?.message?.content || '';

  const parsed = parseLLMJSON(responseText, 'LinkedIn extraction');

  return {
    raw_text: rawText,
    headline: parsed.headline || '',
    summary: parsed.summary || '',
    skills: parsed.skills || [],
    experience: parsed.experience || [],
    certifications: parsed.certifications || [],
    courses: parsed.courses || [],
    education: parsed.education || [],
    recommendations_count: parsed.recommendations_count || 0,
    connection_count_range: parsed.connection_count_range || 'unknown',
  };
}
