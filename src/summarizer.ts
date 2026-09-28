import { GoogleGenAI } from '@google/genai';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize Gemini Client for summary:', err);
    return null;
  }
}

export async function generateDetailedSummary(inputText: string): Promise<string> {
  if (!inputText || inputText.trim().length === 0) {
    return 'No content available to summarize.';
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `You are a world-class academic mentor and research assistant dedicated to helping university students and early-career researchers understand complex academic papers.
Your task is to carefully read the following paper section and generate a comprehensive, engaging, and structured breakdown that makes dense ideas accessible without losing academic rigor. No conversational preamble.

Instructions:
1. Provide a structured breakdown including:
   - Core Idea & Objectives (What problem does this solve?)
   - Key Takeaways & Methodology (How does it work?)
   - Important Data, Formulas, or Experimental Results
   - Critical Nuances, Limitations, or Baseline Comparisons
2. Include a dedicated section: "🎓 Student & Layman Explanation" where you explain the core concepts using intuitive real-world analogies, step-by-step logic, and simple terms suitable for an undergraduate preparing for a seminar presentation.
3. Present the output in clean markdown with headings, bold keywords, and concise bullet points.

Input Text:
${inputText.slice(0, 30000)}

Output Format:
# Section Title / Core Theme
## Summary
(clear, well-structured paragraphs explaining the main argument)
## Key Insights & Findings
- (bullet points highlighting evidence, methodology, and key results)
## 🎓 Student & Layman Explanation
(intuitive real-world analogy and step-by-step breakdown)`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return response.text?.trim() || 'Summary could not be generated.';
    } catch (err) {
      console.warn('Gemini summary generation failed. Using extractive fallback:', err);
    }
  }

  // Extractive Fallback Summary
  return fallbackExtractiveSummary(inputText);
}

function fallbackExtractiveSummary(text: string): string {
  const sentences = text
    .split(/(?<=[.?!])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 20 && !s.startsWith('http') && !s.includes('---'));

  const leadSentences = sentences.slice(0, 4).join(' ');
  const middleSentences = sentences.slice(4, 9);

  return `# Section Summary

## Summary
${leadSentences || text.slice(0, 400)}

## Key Points
${
  middleSentences.length > 0
    ? middleSentences.map((s) => `- ${s}`).join('\n')
    : `- Core findings and discussion outlined in this section (${text.slice(0, 150)}...)`
}

## Explanation in Simple Terms
This section presents foundational research methodology and results. It details experimental setups, theoretical models, and key qualitative insights derived from the study.`;
}
