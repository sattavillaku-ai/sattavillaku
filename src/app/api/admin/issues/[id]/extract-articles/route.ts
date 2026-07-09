import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
const pdfParse = require('pdf-parse');

function textToTiptap(text: string) {
  const paragraphs = text
    .split('\n')
    .map(p => p.trim())
    .filter(p => p.length > 0);
    
  return {
    type: "doc",
    content: paragraphs.map(p => {
      if (p.startsWith('###')) {
        return {
          type: "heading",
          attrs: { level: 3 },
          content: [{ type: "text", text: p.replace(/^###\s*/, '') }]
        };
      }
      if (p.startsWith('##')) {
        return {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: p.replace(/^##\s*/, '') }]
        };
      }
      return {
        type: "paragraph",
        content: [{ type: "text", text: p }]
      };
    })
  };
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createServerClient();
    
    // Auth Check
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    // 1. Fetch Issue
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: 'இதழ் கிடைக்கவில்லை (Issue not found)' }, { status: 404 });
    }

    if (!issue.pdf_url) {
      return NextResponse.json({ 
        error: 'இதழின் PDF கோப்பு இன்னும் பதிவேற்றப்படவில்லை. தயவுசெய்து முதலில் PDF ஐப் பதிவேற்றவும்.' 
      }, { status: 400 });
    }

    // 2. Download PDF file from Supabase Storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('premium-pdfs')
      .download(issue.pdf_url);

    if (downloadError || !fileData) {
      return NextResponse.json({ 
        error: 'PDF கோப்பை பதிவிறக்குவதில் பிழை: ' + (downloadError?.message || 'கோப்பு காலியாக உள்ளது') 
      }, { status: 500 });
    }

    // 3. Extract text from PDF using pdf-parse
    const buffer = Buffer.from(await fileData.arrayBuffer());
    let pdfText = '';
    try {
      const parsedPdf = await pdfParse(buffer);
      pdfText = parsedPdf.text;
    } catch (parseError: any) {
      return NextResponse.json({ 
        error: 'PDF கோப்பை வாசிப்பதில் பிழை (PDF Parse Error): ' + parseError.message 
      }, { status: 500 });
    }

    if (!pdfText || pdfText.trim().length === 0) {
      return NextResponse.json({ 
        error: 'PDF இலிருந்து எந்த உரையையும் பிரித்தெடுக்க முடியவில்லை. தயவுசெய்து உரை வடிவம் கொண்ட PDF ஐப் பயன்படுத்தவும்.' 
      }, { status: 400 });
    }

    // 4. Send to Google Gemini API
    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ 
        error: 'AI Extractor-ஐ இயக்க GEMINI_API_KEY தேவை. தயவுசெய்து உங்கள் .env.local கோப்பில் இதைச் சேர்க்கவும்.' 
      }, { status: 400 });
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;

    const systemPrompt = `You are a professional Tamil magazine editor. Analyze the provided text from a Tamil magazine issue PDF. Identify separate articles, editorials, poems, stories, and interviews.
For each separate item, extract the title, author name (or "ஆசிரியர் குழு" if unknown), content type (one of: 'article', 'poem', 'editorial', 'story', 'interview'), and its text body.
Return the output strictly in the requested JSON structure.`;

    const payload = {
      contents: [
        {
          parts: [
            {
              text: `Here is the raw text from the magazine:\n\n${pdfText}\n\nPlease identify all the articles and format them.`
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemPrompt
          }
        ]
      },
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          items: {
            type: "OBJECT",
            properties: {
              title: { type: "STRING" },
              author_name: { type: "STRING" },
              content_type: { 
                type: "STRING", 
                enum: ["article", "poem", "editorial", "story", "interview"] 
              },
              plain_text: { type: "STRING" }
            },
            required: ["title", "author_name", "content_type", "plain_text"]
          }
        }
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Gemini API Error');
    }

    const result = await response.json();
    const textResponse = result.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      return NextResponse.json({ error: 'AI இலிருந்து எந்த பதிலும் கிடைக்கவில்லை.' }, { status: 500 });
    }

    const extractedArticles = JSON.parse(textResponse);

    if (!Array.isArray(extractedArticles) || extractedArticles.length === 0) {
      return NextResponse.json({ error: 'AI கட்டுரைகளை அடையாளம் காணவில்லை.' }, { status: 500 });
    }

    // 5. Delete existing content & Save newly extracted articles
    const { error: deleteError } = await supabase
      .from('issue_content')
      .delete()
      .eq('issue_id', issue.id);

    if (deleteError) throw deleteError;

    const insertPayload = extractedArticles.map((art: any, index: number) => ({
      issue_id: issue.id,
      title: art.title,
      author_name: art.author_name || 'ஆசிரியர் குழு',
      content_type: art.content_type || 'article',
      body: textToTiptap(art.plain_text),
      position: index + 1,
      is_preview: index === 0 // First article is preview by default
    }));

    const { error: insertError } = await supabase
      .from('issue_content')
      .insert(insertPayload);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, count: insertPayload.length });
  } catch (error: any) {
    console.error('AI Extraction Error:', error);
    return NextResponse.json({ error: 'கட்டுரைகளைப் பிரித்தெடுப்பதில் பிழை: ' + error.message }, { status: 500 });
  }
}
