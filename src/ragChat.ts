import { GoogleGenAI } from '@google/genai';
import { TextChunk } from './types.js';

function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  try {
    return new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('Failed to initialize Gemini Client for chat:', err);
    return null;
  }
}

export class RAGVectorStore {
  private chunks: TextChunk[] = [];

  constructor(text: string) {
    this.buildChunks(text);
  }

  private buildChunks(text: string, chunkSize = 500, chunkOverlap = 100) {
    this.chunks = [];
    if (!text) return;

    let startIndex = 0;
    let index = 0;
    while (startIndex < text.length) {
      const endIndex = Math.min(startIndex + chunkSize, text.length);
      const chunkText = text.slice(startIndex, endIndex).trim();
      if (chunkText.length > 0) {
        this.chunks.push({
          content: chunkText,
          index: index++,
        });
      }
      startIndex += chunkSize - chunkOverlap;
    }
  }

  public retrieveTopChunks(query: string, topK = 4): string[] {
    if (this.chunks.length === 0) return [];

    const queryTerms = query
      .toLowerCase()
      .split(/[\s,.;:?!()]+/)
      .filter((t) => t.length > 2);

    if (queryTerms.length === 0) {
      return this.chunks.slice(0, topK).map((c) => c.content);
    }

    const scoredChunks = this.chunks.map((chunk) => {
      const lower = chunk.content.toLowerCase();
      let score = 0;
      for (const term of queryTerms) {
        if (lower.includes(term)) {
          // Increase score with exact matches and repetitions
          const count = (lower.match(new RegExp(term, 'g')) || []).length;
          score += count;
        }
      }
      return { chunk, score };
    });

    scoredChunks.sort((a, b) => b.score - a.score);

    // Pick top K with score > 0, or fallback to first chunks if none match
    const topScored = scoredChunks.filter((item) => item.score > 0).slice(0, topK);
    if (topScored.length > 0) {
      return topScored.map((item) => item.chunk.content);
    }

    return this.chunks.slice(0, topK).map((c) => c.content);
  }
}

export async function askQuestion(
  fullText: string,
  vectorStore: RAGVectorStore | null,
  question: string
): Promise<string> {
  if (!fullText || fullText.trim().length === 0) {
    return 'Please upload a research paper first before asking questions.';
  }

  const store = vectorStore || new RAGVectorStore(fullText);
  const relevantChunks = store.retrieveTopChunks(question, 4);
  const context = relevantChunks.join('\n\n---\n\n');

  const ai = getGeminiClient();
  if (ai) {
    try {
      const prompt = `You are an academic research tutor dedicated to helping students and young researchers understand academic papers.
Answer the user's question clearly, pedagogically, and **strictly grounded on the provided paper context**. Do not invent facts outside this context.

Context: 
${context}

Question: 
${question}

Instructions:  
- If the answer can be found in the context, provide a clear, well-structured, student-friendly explanation. Use bullet points or short paragraphs where helpful.
- If the answer is not present in the context, reply: "The provided manuscript does not contain details regarding this question."`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.6-flash',
        contents: prompt,
      });

      return response.text?.trim() || "I don't know.";
    } catch (err) {
      console.warn('Gemini chat invoke failed. Using extractive fallback:', err);
    }
  }

  // Local fallback response
  if (relevantChunks.length > 0) {
    return `Based on the paper context:\n\n"${relevantChunks[0].slice(0, 300)}..."`;
  }

  return "I don't know.";
}
