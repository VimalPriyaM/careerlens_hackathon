import { getClaude } from '../utils/claude';
import { CLAUDE_MODEL } from '../config/constants';
import { parseLLMJSON } from '../utils/parseLLMJSON';

const CODE_QUALITY_SYSTEM_PROMPT = `You are a senior code reviewer. Assess the quality of this source code file.
Rate each dimension on a scale of 1–5 where:
1 = Poor, 2 = Below Average, 3 = Average, 4 = Good, 5 = Excellent.

Return ONLY valid JSON with no markdown or backticks:
{
  "organization": number,
  "naming": number,
  "error_handling": number,
  "idioms": number,
  "complexity": number
}

Dimensions:
1. organization — Is the code logically structured? Clear separation of concerns?
2. naming — Are variables, functions, and classes named descriptively?
3. error_handling — Are errors caught and handled? Input validation present?
4. idioms — Does the code use language-specific patterns correctly?
5. complexity — Is the code appropriately complex for the task?

Judge relative to mid-level developer standards. Focus on substance, not formatting.`;

interface CodeSample {
  repo: string;
  filename: string;
  content: string;
  language: string;
}

interface CodeQualityResult {
  score: number;
  details: string;
  files_reviewed: number;
  average_ratings: {
    organization: number;
    naming: number;
    error_handling: number;
    idioms: number;
    complexity: number;
  } | null;
}

/**
 * Component C: Send code samples to Claude for quality assessment.
 * Score: 0-20 points
 *
 * To save API calls, we batch multiple files into a single Claude request.
 */
export async function scoreCodeQuality(
  skillName: string,
  codeSamples: CodeSample[]
): Promise<CodeQualityResult> {
  if (codeSamples.length === 0) {
    return {
      score: 0,
      details: 'No code samples available for review',
      files_reviewed: 0,
      average_ratings: null,
    };
  }

  // Take up to 4 code samples to keep the prompt reasonable
  const samplesToReview = codeSamples.slice(0, 4);

  // Build a batched prompt with all files
  const filesText = samplesToReview
    .map((s, i) => `--- FILE ${i + 1}: ${s.filename} (${s.language}, repo: ${s.repo}) ---\n${s.content}\n`)
    .join('\n');

  const batchPrompt = `Review the following ${samplesToReview.length} code files. For EACH file, rate the 5 dimensions.

Return ONLY valid JSON — an array of ratings, one per file:
[
  { "file": "filename", "organization": N, "naming": N, "error_handling": N, "idioms": N, "complexity": N },
  ...
]

${filesText}`;

  try {
    const llm = getClaude();
    const response = await llm.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: CODE_QUALITY_SYSTEM_PROMPT },
        { role: 'user', content: batchPrompt },
      ],
    });

    const responseText = response.choices[0]?.message?.content || '';
    const ratings = parseLLMJSON(responseText, 'code quality scoring');

    // Handle both array and single object responses
    const ratingsArray = Array.isArray(ratings) ? ratings : [ratings];

    // Average across all files
    let totalOrg = 0, totalNam = 0, totalErr = 0, totalIdi = 0, totalCom = 0;
    let count = 0;

    for (const r of ratingsArray) {
      if (r.organization && r.naming && r.error_handling && r.idioms && r.complexity) {
        totalOrg += r.organization;
        totalNam += r.naming;
        totalErr += r.error_handling;
        totalIdi += r.idioms;
        totalCom += r.complexity;
        count++;
      }
    }

    if (count === 0) {
      return { score: 0, details: 'Code quality assessment returned invalid data', files_reviewed: 0, average_ratings: null };
    }

    const avgOrg = totalOrg / count;
    const avgNam = totalNam / count;
    const avgErr = totalErr / count;
    const avgIdi = totalIdi / count;
    const avgCom = totalCom / count;

    // Overall average across all dimensions (1-5 scale)
    const overallAvg = (avgOrg + avgNam + avgErr + avgIdi + avgCom) / 5;

    // Normalize to 0-20 scale: (avg - 1) / 4 * 20
    const score = Math.round(((overallAvg - 1) / 4) * 20);

    return {
      score: Math.max(0, Math.min(20, score)),
      details: `Average quality: ${overallAvg.toFixed(1)}/5 across ${count} files`,
      files_reviewed: count,
      average_ratings: {
        organization: Math.round(avgOrg * 10) / 10,
        naming: Math.round(avgNam * 10) / 10,
        error_handling: Math.round(avgErr * 10) / 10,
        idioms: Math.round(avgIdi * 10) / 10,
        complexity: Math.round(avgCom * 10) / 10,
      },
    };
  } catch (error: any) {
    console.error('Code quality scoring failed:', error.message);
    return {
      score: 0,
      details: `Code quality assessment failed: ${error.message}`,
      files_reviewed: 0,
      average_ratings: null,
    };
  }
}
