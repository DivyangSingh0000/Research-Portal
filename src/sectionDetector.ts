import { GoogleGenAI } from '@google/genai';
import { SectionInfo, PaperTopicMap } from './types.js';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize Gemini Client:', err);
    return null;
  }
}

export async function refineSections(inputSections: SectionInfo[]): Promise<SectionInfo[]> {
  if (!inputSections || inputSections.length === 0) {
    return [];
  }

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `You are a precise data processor.
I will give you a JSON list of sections from a research paper. Each item may have:
- "section" (string)
- optional "subsection" (string)
- "start" (integer)

Some entries are unnecessary and must be **removed completely**:
1. Figure or Table captions (any "section" starting with "Figure" or "Table").
2. Incomplete, meaningless, or fragment sections (e.g., "making", "length nis smaller...").
3. Any other irrelevant entries that are not proper sections or subsections.

Your task is to **refine this list**:
- Keep only meaningful main sections and their subsections.
- Main sections should be in the format: {"section": "Section Name", "start": number}
- Subsections should be in the format: {"section": "Parent Section", "subsection": "Subsection Name", "start": number}
- The output must be **strictly a JSON array of dictionaries**.
- Do **not** include any markdown fences, explanations, notes, extra text, or commentary.
- If a section is unnecessary, exclude it completely.

Here is the input JSON:
${JSON.stringify(inputSections, null, 2)}

Return ONLY valid JSON array.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      const responseText = response.text?.trim() || '';
      const cleanJson = responseText.replace(/```json\s*|```/g, '').trim();
      const parsed = JSON.parse(cleanJson);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (err) {
      console.warn('LLM section refinement failed or returned invalid JSON. Using rule-based refinement.', err);
    }
  }

  // Fallback rule-based filter
  return inputSections.filter((item) => {
    const title = (item.subsection || item.section || '').trim();
    if (/^(figure|table|eq\.|equation|caption|fig\.)/i.test(title)) return false;
    if (title.length < 3) return false;
    if (/^[0-9.]+$/.test(title)) return false;
    return true;
  });
}

export function splitSectionsWithContent(text: string, detectedSections: SectionInfo[]): PaperTopicMap {
  if (!detectedSections || detectedSections.length === 0) {
    return { 'Full Paper': text.trim() };
  }

  // Sort by start index
  const sorted = [...detectedSections].sort((a, b) => a.start - b.start);
  const results: PaperTopicMap = {};

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const start = current.start;
    const end = i + 1 < sorted.length ? sorted[i + 1].start : text.length;

    const key = (current.subsection || current.section || `Section ${i + 1}`).trim();
    const content = text.slice(start, end).trim();

    if (content.length > 0) {
      results[key] = content;
    }
  }

  if (Object.keys(results).length === 0) {
    results['Full Paper'] = text.trim();
  }

  return results;
}
