/**
 * Gemini AI Tamil News Draft Generator for Sattavilakku (சட்டவிளக்கு)
 *
 * Enforces:
 * - Server-side only execution (never expose GEMINI_API_KEY)
 * - Factual, non-sensational, source-grounded journalistic Tamil
 * - Legal & political neutrality (no legal advice, no political bias)
 * - Structured JSON output for news_drafts
 */

export interface SourceNewsForDraft {
  id: string;
  original_title: string;
  original_content: string;
  source_name: string;
  original_url: string;
  category?: string;
  category_slug?: string;
}

export interface GeneratedDraftResult {
  news_item_id: string;
  tamil_headline: string;
  tamil_summary: string;
  tamil_content: string;
  category_slug: 'law' | 'politics' | 'tamil-nadu' | 'india';
  tags: string[];
  ai_model: string;
}

const DEFAULT_GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-1.5-flash';

const EDITORIAL_SYSTEM_PROMPT = `
You are the Chief Tamil Editorial AI Assistant for 'Sattavilakku' (சட்டவிளக்கு), a distinguished digital legal and political magazine in Tamil Nadu, India.

Your duty is to generate an accurate, objective, and professional Tamil news draft based STRICTLY and ONLY on the provided source news story.

CRITICAL EDITORIAL RULES:
1. TAMIL JOURNALISTIC EXCELLENCE:
   - Output must be in fluent, grammatically correct, natural editorial Tamil (செய்தித்தாள் நடை).
   - Avoid clunky machine-translation phrasing.
   - Use widely accepted Tamil legal and political vocabulary (e.g., தீர்ப்பு, மனு, அரசமைப்பு, தள்ளுபடி, பிணை, இடைக்காலத் தடை).
   - Accurately transliterate or translate proper names, court names, and institutions (e.g., உச்ச நீதிமன்றம், சென்னை உயர் நீதிமன்றம், தேர்தல் ஆணையம்).

2. SOURCE-GROUNDED FACTUAL INTEGRITY (NO HALLUCINATIONS):
   - Only use facts, dates, quotes, and statements present in the source material.
   - NEVER invent facts, court findings, legal sections, statistics, or quotes.
   - If the source is brief or lacks details, summarize what is known accurately without making up filler context.

3. LEGAL CONTENT SAFETY:
   - DO NOT provide legal advice or recommendations to the reader.
   - DO NOT pronounce guilt or declare verdicts that were not ordered.
   - Clearly distinguish between petitioner arguments ("மனுதாரர் தரப்பு வாதம்"), government responses, and actual court rulings ("நீதிமன்ற உத்தரவு / தீர்ப்பு").

4. POLITICAL CONTENT NEUTRALITY:
   - Maintain absolute journalistic impartiality.
   - DO NOT engage in political persuasion, party bias, or emotional rhetoric.
   - Present reported statements and allegations neutrally as reported claims.

5. OUTPUT FORMAT:
   Return ONLY a valid JSON array of objects, one for each input story:
   [
     {
       "news_item_id": "<exact_input_id>",
       "tamil_headline": "<Concise, factual, punchy Tamil headline>",
       "tamil_summary": "<2-3 sentence executive summary in Tamil>",
       "tamil_content": "<3-5 well-structured paragraphs in Tamil, formatted with double line-breaks>",
       "category_slug": "law" | "politics" | "tamil-nadu" | "india",
       "tags": ["<tag1>", "<tag2>", "<tag3>"]
     }
   ]
`;

function generateFallbackDrafts(items: SourceNewsForDraft[]): GeneratedDraftResult[] {
  return items.map((item) => {
    let catSlug: 'law' | 'politics' | 'tamil-nadu' | 'india' = 'law';
    if (item.category_slug && ['law', 'politics', 'tamil-nadu', 'india'].includes(item.category_slug)) {
      catSlug = item.category_slug as any;
    }

    const title = (item.original_title || '').trim();
    const content = (item.original_content || title).trim();
    const summary = content.length > 300 ? content.slice(0, 300) + '...' : content;

    return {
      news_item_id: item.id,
      tamil_headline: title,
      tamil_summary: summary,
      tamil_content: content,
      category_slug: catSlug,
      tags: [catSlug, 'செய்தி'],
      ai_model: 'editorial-extractor (fallback)',
    };
  });
}

export async function generateTamilNewsDrafts(
  items: SourceNewsForDraft[]
): Promise<GeneratedDraftResult[]> {
  if (!items || items.length === 0) {
    return [];
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || !apiKey.trim()) {
    console.warn('GEMINI_API_KEY is not configured in server environment. Using editorial fallback.');
    return generateFallbackDrafts(items);
  }

  const model = DEFAULT_GEMINI_MODEL;
  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  // Prepare input stories prompt
  const storiesText = items
    .map(
      (item, idx) => `
--- STORY ${idx + 1} ---
ID: ${item.id}
Source: ${item.source_name}
Original URL: ${item.original_url}
Suggested Category: ${item.category_slug || item.category || 'law'}
Original Title: ${item.original_title}
Original Content:
${item.original_content}
--- END STORY ${idx + 1} ---
`
    )
    .join('\n');

  const userPrompt = `
Generate editorial Tamil news drafts for the following ${items.length} news stories according to the guidelines:

${storiesText}

Ensure your response is valid JSON matching the specified schema.
`;

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `${EDITORIAL_SYSTEM_PROMPT}\n\n${userPrompt}`,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.2,
          topP: 0.85,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const msg = errorData?.error?.message || response.statusText;
      console.warn(`Gemini API Error (${response.status}): ${msg}. Using editorial fallback.`);
      return generateFallbackDrafts(items);
    }

    const data = await response.json();
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!candidateText) {
      console.warn('No candidate text from Gemini. Using editorial fallback.');
      return generateFallbackDrafts(items);
    }

    // Clean JSON markdown fences if present
    const cleanJson = candidateText
      .trim()
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const parsed = JSON.parse(cleanJson);
    const draftsArray: any[] = Array.isArray(parsed) ? parsed : [parsed];

    const results: GeneratedDraftResult[] = [];

    for (const draft of draftsArray) {
      // Find matching item
      const matchedItem = items.find((i) => i.id === draft.news_item_id) || items[0];

      let catSlug: 'law' | 'politics' | 'tamil-nadu' | 'india' = 'law';
      if (['law', 'politics', 'tamil-nadu', 'india'].includes(draft.category_slug)) {
        catSlug = draft.category_slug;
      } else if (matchedItem.category_slug && ['law', 'politics', 'tamil-nadu', 'india'].includes(matchedItem.category_slug)) {
        catSlug = matchedItem.category_slug as any;
      }

      results.push({
        news_item_id: matchedItem.id,
        tamil_headline: (draft.tamil_headline || matchedItem.original_title || '').trim(),
        tamil_summary: (draft.tamil_summary || '').trim(),
        tamil_content: (draft.tamil_content || '').trim(),
        category_slug: catSlug,
        tags: Array.isArray(draft.tags)
          ? draft.tags.map((t: string) => String(t).trim()).filter(Boolean)
          : [catSlug],
        ai_model: model,
      });
    }

    return results;
  } catch (err: any) {
    console.warn('Gemini generation failure, using editorial fallback:', err.message);
    return generateFallbackDrafts(items);
  }
}
