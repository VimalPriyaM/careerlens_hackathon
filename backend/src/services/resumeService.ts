import pdfParse from 'pdf-parse';
import { getClaude } from '../utils/claude';
import { RESUME_EXTRACTION_SYSTEM_PROMPT, buildResumeExtractionPrompt } from '../prompts/resumeExtraction';
import { CLAUDE_MODEL, CLAUDE_MAX_TOKENS } from '../config/constants';
import { parseLLMJSON } from '../utils/parseLLMJSON';

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

  const llm = getClaude();
  const response = await llm.chat.completions.create({
    model: CLAUDE_MODEL,
    max_tokens: CLAUDE_MAX_TOKENS,
    messages: [
      { role: 'system', content: RESUME_EXTRACTION_SYSTEM_PROMPT },
      { role: 'user', content: buildResumeExtractionPrompt(rawText) },
    ],
  });

  const responseText = response.choices[0]?.message?.content || '';

  const parsed = parseLLMJSON(responseText, 'resume extraction');

  return {
    raw_text: rawText,
    skills: parsed.skills || [],
    experience: parsed.experience || [],
    projects: parsed.projects || [],
    education: parsed.education || { degree: '', institution: '', year: '', relevant_coursework: [] },
    certifications: parsed.certifications || [],
  };
}
