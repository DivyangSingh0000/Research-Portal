import pdfParse from 'pdf-parse';
import { SectionInfo } from './types.js';

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    return data.text || '';
  } catch (error) {
    console.error('Error parsing PDF buffer:', error);
    throw new Error('Failed to extract text from PDF.');
  }
}

export function extractParentTitle(fullText: string, parentNumber: string): string {
  const escapedNum = parentNumber.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`^${escapedNum}\\s+(.+)`, 'm');
  const match = fullText.match(regex);
  return match && match[1] ? match[1].trim() : '';
}

export function parseSections(text: string): SectionInfo[] {
  // Regex for headings like "1 Introduction", "3.2.1 Scaled Dot-Product Attention"
  const headingPattern = /^(\d+(?:\.\d+)*)\s+([A-Za-z].+)/gm;
  const sections: SectionInfo[] = [];
  let match: RegExpExecArray | null;

  while ((match = headingPattern.exec(text)) !== null) {
    const number = match[1];
    const title = match[2].trim();
    const startIndex = match.index;

    if (number.includes('.')) {
      const parent = number.split('.')[0];
      const parentTitle = extractParentTitle(text, parent);
      sections.push({
        section: parentTitle || title,
        subsection: `${number} ${title}`,
        start: startIndex,
      });
    } else {
      sections.push({
        section: `${number} ${title}`,
        start: startIndex,
      });
    }
  }

  return sections;
}

export function findAbstract(text: string): SectionInfo | null {
  const abstractMatch = text.match(/\bAbstract\b/i);
  if (abstractMatch && abstractMatch.index !== undefined) {
    return { section: 'Abstract', start: abstractMatch.index };
  }
  return null;
}

export function extractPdfSections(fullText: string): SectionInfo[] {
  const sections = parseSections(fullText);
  const abstract = findAbstract(fullText);
  if (abstract) {
    sections.unshift(abstract);
  }
  return sections;
}
