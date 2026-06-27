import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import chromium from '@sparticuz/chromium-min';
import puppeteer from 'puppeteer-core';
import fs from 'fs';
import path from 'path';

// PDF உருவாக்க உதவும் செயல்பாடு (PDF Generation helper)
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createServerClient();

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const { data: user } = await supabase.from('users').select('role').eq('id', session.user.id).single();
    if (user?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    
    // 1. இதழ் மற்றும் கட்டுரை விவரங்களைப் பெறவும்
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('*')
      .eq('id', resolvedParams.id)
      .single();

    if (issueError || !issue) return NextResponse.json({ error: 'இதழ் கிடைக்கவில்லை' }, { status: 404 });

    const { data: articles, error: contentError } = await supabase
      .from('issue_content')
      .select('*')
      .eq('issue_id', issue.id)
      .order('position', { ascending: true });

    if (contentError) throw contentError;

    // 2. HTML டெம்ப்ளேட்டைத் தயார் செய்யவும்
    const templatePath = path.join(process.cwd(), 'src/lib/pdf/issue-template.html');
    let html = fs.readFileSync(templatePath, 'utf8');

    // எளிய டேட்டா ரீப்ளேஸ்மென்ட் (Simple replacement)
    html = html.replace('{{cover_image_url}}', issue.cover_image_url || '');
    html = html.replace('{{volume}}', issue.volume_number.toString());
    html = html.replace('{{issue_number}}', issue.issue_number.toString());
    html = html.replace('{{published_month}}', new Date(issue.published_at || new Date().toISOString()).toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' }));

    // கட்டுரைகளைச் சேர்க்கவும்
    const articlesHtml = articles.map(art => {
      // Tiptap JSON to HTML (Simplified for PDF)
      const bodyHtml = art.body.content.map((node: any) => {
        if (node.type === 'paragraph') return `<p>${node.content?.map((c: any) => c.text).join('') || ''}</p>`;
        if (node.type === 'heading') return `<h3 style="font-family: Noto Sans Tamil; font-weight: bold;">${node.content?.map((c: any) => c.text).join('') || ''}</h3>`;
        if (node.type === 'blockquote') return `<div class="blockquote">${node.content?.map((n: any) => n.content?.map((c: any) => c.text).join('')).join('<br>')}</div>`;
        return '';
      }).join('');

      return `
        <div class="article">
          <h2 class="article-title">${art.title}</h2>
          <div class="article-meta">
            <span class="content-type-badge">${art.content_type}</span>
            <span>${art.author_name}</span>
          </div>
          <div class="article-body">${bodyHtml}</div>
        </div>
      `;
    }).join('');

    // TOC மற்றும் ஆர்டிகிள் செக்ஷன்களை ரீப்ளேஸ் செய்யவும்
    const tocHtml = articles.map(art => `<div class="toc-item"><span>${art.title}</span><span>${art.author_name}</span></div>`).join('');
    
    // Note: This is a manual way to handle the block helpers in the template since we are not using a real parser here
    // In a real scenario, use Handlebars or EJS.
    html = html.replace(/{{#articles}}[\s\S]*?{{\/articles}}/, tocHtml); // For TOC
    html = html.replace(/{{#articles}}[\s\S]*?{{\/articles}}/, articlesHtml); // For Articles

    // 3. Puppeteer மூலம் PDF உருவாக்கவும்
    const executablePath = await chromium.executablePath(
      'https://github.com/Sparticuz/chromium/releases/download/v123.0.1/chromium-v123.0.1-pack.tar'
    );

    const browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: (chromium as any).defaultViewport,
      executablePath,
      headless: (chromium as any).headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0' as any });
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      displayHeaderFooter: false,
      margin: { top: '20mm', bottom: '20mm', left: '15mm', right: '15mm' }
    });

    await browser.close();

    // 4. Supabase Storage-க்கு பதிவேற்றவும் (Upload to Storage)
    const storagePath = `issues/${issue.id}/sattavillaku-vol${issue.volume_number}-issue${issue.issue_number}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('premium-pdfs')
      .upload(storagePath, pdfBuffer, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) throw uploadError;

    // 5. டேட்டாபேஸில் தகவலைப் புதுப்பிக்கவும்
    const { error: updateError } = await supabase
      .from('issues')
      .update({
        pdf_url: storagePath,
        pdf_generated_at: new Date().toISOString()
      })
      .eq('id', issue.id);

    if (updateError) throw updateError;

    return NextResponse.json({ success: true, pdfUrl: storagePath });
  } catch (error: any) {
    console.error('PDF Generation Error:', error);
    return NextResponse.json({ error: 'PDF உருவாக்குவதில் பிழை: ' + error.message }, { status: 500 });
  }
}
