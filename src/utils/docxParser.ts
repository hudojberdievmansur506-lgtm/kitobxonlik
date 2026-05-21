import mammoth from 'mammoth';
import { Question } from '../types';

/**
 * Utility to parse questions list from Word DOCX file array buffer
 */
export async function parseDocxQuestions(arrayBuffer: ArrayBuffer): Promise<Question[]> {
  try {
    const result = await mammoth.convertToHtml({ arrayBuffer });
    const html = result.value;
    
    // Parse using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Find all table elements or cells
    const tdElements = Array.from(doc.querySelectorAll('td'));
    let texts: string[] = [];
    
    if (tdElements.length > 0) {
      // Map cell texts
      texts = tdElements
        .map(td => td.textContent?.trim() || '')
        .filter(t => t.length > 0);
    } else {
      // Fallback: No table found, split pure paragraphs
      const pElements = Array.from(doc.querySelectorAll('p'));
      texts = pElements
        .map(p => p.textContent?.trim() || '')
        .filter(t => t.length > 0);
    }
    
    return groupTextsIntoQuestions(texts);
  } catch (error) {
    console.error('Error parsing DOCX file:', error);
    throw new Error('Word faylini o‘qishda xato yuz berdi. Jadval ko‘rinishida kiritilganiga va fayl buzilmaganiga ishonch hosil qiling.');
  }
}

/**
 * Groups raw sequential texts into Question objects
 */
export function groupTextsIntoQuestions(texts: string[]): Question[] {
  const questions: Question[] = [];
  
  // We expect chunks of 5:
  // indices:
  // 0: Savol (Question)
  // 1: Togri javob (Correct Option)
  // 2: Variant B
  // 3: Variant C
  // 4: Variant D
  for (let i = 0; i < texts.length; i += 5) {
    if (i + 4 < texts.length) {
      const savol = texts[i];
      const togriJavob = texts[i + 1];
      const j2 = texts[i + 2];
      const j3 = texts[i + 3];
      const j4 = texts[i + 4];
      
      questions.push({
        id: `q-${Date.now()}-${i}-${Math.random().toString(36).substring(2, 6)}`,
        savol,
        togriJavob,
        javoblar: [togriJavob, j2, j3, j4]
      });
    }
  }
  
  return questions;
}

/**
 * Parses raw text copied and pasted from tables/lists
 */
export function parseTextQuestions(rawText: string): Question[] {
  const lines = rawText
    .split('\n')
    .map(line => line.trim())
    .filter(line => line.length > 0);
    
  return groupTextsIntoQuestions(lines);
}
