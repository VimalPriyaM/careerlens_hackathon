import pdfParse from 'pdf-parse';
import { getClaude } from '../utils/claude';
import { RESUME_EXTRACTION_SYSTEM_PROMPT, buildResumeExtractionPrompt } from '../prompts/resumeExtraction';
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '../config/constants';

export interface ResumeSkill {
  name: string;
  category: 'language' | 'framework' | 'tool' | 'platform' | 'concept';
  confidence: 'explicit' | 'inferred';
}

export interface ResumeExperience {
  title: string;
  company: string;
  duration: string;
  description: string;
  skills_used: string[];
}

export interface ResumeProject {
  name: string;
  description: string;
  tech_stack: string[];
}

export interface ResumeEducation {
  degree: string;
  institution: string;
  year: string;
  relevant_coursework: string[];
}

export interface ParsedResume {
  raw_text: string;
  skills: ResumeSkill[];
  experience: ResumeExperience[];
  projects: ResumeProject[];
  education: ResumeEducation;
  certifications: string[];
}

export async function parseResume(pdfBuffer: Buffer): Promise<ParsedResume> {
  const pdfData = await pdfParse(pdfBuffer);
  const rawText = pdfData.text;

  if (!rawText || rawText.trim().length < 50) {
    throw new Error('Resume PDF appears to be empty or contains too little text.');
  }

  const claude = getClaude();
  const response = await claude.messages.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    system: RESUME_EXTRACTION_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: buildResumeExtractionPrompt(rawText) }],
  });

  const responseText = response.content[0].type === 'text' ? response.content[0].text : '';

  let parsed: any;
  try {
    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    parsed = JSON.parse(cleaned);
  } catch (e) {
    console.error('Failed to parse resume extraction response:', responseText);
    throw new Error('Failed to parse resume data. Please try again.');
  }

  return {
    raw_text: rawText,
    skills: parsed.skills || [],
    experience: parsed.experience || [],
    projects: parsed.projects || [],
    education: parsed.education || { degree: '', institution: '', year: '', relevant_coursework: [] },
    certifications: parsed.certifications || [],
  };
}
