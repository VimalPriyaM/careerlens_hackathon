import { getClaude } from '../utils/claude';
import { CLAUDE_MODEL } from '../config/constants';

const README_QUALITY_SYSTEM_PROMPT = `You are evaluating the README.md of a GitHub repository.
Rate each dimension on a scale of 1–5.
Return ONLY valid JSON with no markdown or backticks:
{
  "purpose": number,
  "setup": number,
  "stack": number,
  "understanding": number,
  "visuals": number
}

Dimensions:
1. purpose — Does it clearly explain what this project does and why?
2. setup — Does it explain how to install, configure, and run the project?
3. stack — Does it clearly list the technologies used?
4. understanding — Does it show the author understands the problem (not just a tutorial)?
5. visuals — Does it include screenshots, diagrams, example output, or GIFs?`;

interface ReadmeResult {
  score: number;
  details: string;
  readmes_reviewed: number;
}

/**
 * Component D: Assess README quality from the most relevant repos.
 * Score: 0-10 points
 *
 * Batches multiple READMEs into one Claude call.
 */
export async function scoreReadmeQuality(
  skillName: string,
  readmes: { repo: string; content: string }[]
): Promise<ReadmeResult> {
  // Filter out null/empty readmes
  const validReadmes = readmes.filter((r) => r.content && r.content.trim().length > 30);

  if (validReadmes.length === 0) {
    return { score: 0, details: 'No READMEs available to assess', readmes_reviewed: 0 };
  }

  // Take up to 3 READMEs
  const toReview = validReadmes.slice(0, 3);

  // Truncate very long READMEs to keep token usage reasonable
  const readmeTexts = toReview
    .map((r, i) => {
      const truncated = r.content.length > 3000
        ? r.content.substring(0, 3000) + '\n[... truncated]'
        : r.content;
      return `--- README ${i + 1}: ${r.repo} ---\n${truncated}\n`;
    })
    .join('\n');

  const batchPrompt = `Review the following ${toReview.length} README files. For EACH, rate the 5 dimensions.

Return ONLY valid JSON — an array:
[
  { "repo": "name", "purpose": N, "setup": N, "stack": N, "understanding": N, "visuals": N },
  ...
]

${readmeTexts}`;

  try {
    const llm = getClaude();
    const response = await llm.chat.completions.create({
      model: CLAUDE_MODEL,
      max_tokens: 512,
      messages: [
        { role: 'system', content: README_QUALITY_SYSTEM_PROMPT },
        { role: 'user', content: batchPrompt },
      ],
    });

    const responseText = response.choices[0]?.message?.content || '';
    const cleaned = responseText.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
    const ratings = JSON.parse(cleaned);

    const ratingsArray = Array.isArray(ratings) ? ratings : [ratings];

    let totalAvg = 0;
    let count = 0;

    for (const r of ratingsArray) {
      if (r.purpose && r.setup && r.stack && r.understanding && r.visuals) {
        const avg = (r.purpose + r.setup + r.stack + r.understanding + r.visuals) / 5;
        totalAvg += avg;
        count++;
      }
    }

    if (count === 0) {
      return { score: 0, details: 'README assessment returned invalid data', readmes_reviewed: 0 };
    }

    const overallAvg = totalAvg / count;
    // Normalize to 0-10 scale
    const score = Math.round(((overallAvg - 1) / 4) * 10);

    return {
      score: Math.max(0, Math.min(10, score)),
      details: `Average README quality: ${overallAvg.toFixed(1)}/5 across ${count} repos`,
      readmes_reviewed: count,
    };
  } catch (error: any) {
    console.error('README scoring failed:', error.message);
    return { score: 0, details: `README assessment failed: ${error.message}`, readmes_reviewed: 0 };
  }
}
