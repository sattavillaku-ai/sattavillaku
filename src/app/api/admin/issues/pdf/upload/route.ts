import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Helper to count pages in a PDF buffer without heavy dependencies
function detectPdfPageCount(buffer: Buffer): number {
  try {
    const text = buffer.toString('latin1');
    // Match /Type /Page (excluding /Pages)
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) {
      return matches.length;
    }
    // Secondary attempt: /Count in Pages dictionary
    const countMatch = text.match(/\/Type\s*\/Pages[\s\S]*?\/Count\s+(\d+)/);
    if (countMatch && countMatch[1]) {
      const parsed = parseInt(countMatch[1], 10);
      if (parsed > 0) return parsed;
    }
  } catch (err) {
    console.warn('Could not detect page count from PDF buffer:', err);
  }
  return 0;
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // 1. Verify authenticated admin user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'அங்கீகரிக்கப்படாத கோரிக்கை (Unauthorized)' },
        { status: 401 }
      );
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json(
        { error: 'நிர்வாக அனுமதி இல்லை (Forbidden)' },
        { status: 403 }
      );
    }

    // 2. Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const issueId = (formData.get('issue_id') as string) || '';
    const issueNumber = (formData.get('issue_number') as string) || 'draft';
    const year = (formData.get('year') as string) || new Date().getFullYear().toString();
    const oldPdfUrl = (formData.get('old_pdf_url') as string) || '';

    if (!file || file.size === 0) {
      return NextResponse.json(
        { error: 'பதிவேற்ற ஒரு PDF கோப்பைத் தேர்ந்தெடுக்கவும்.' },
        { status: 400 }
      );
    }

    // 3. Validate file type and size (up to 100MB)
    const isPdfMime = file.type === 'application/pdf';
    const isPdfExt = file.name.toLowerCase().endsWith('.pdf');
    if (!isPdfMime && !isPdfExt) {
      return NextResponse.json(
        { error: 'PDF வடிவிலான கோப்புகளை மட்டுமே பதிவேற்ற முடியும்.' },
        { status: 400 }
      );
    }

    const maxSizeBytes = 100 * 1024 * 1024; // 100 MB
    if (file.size > maxSizeBytes) {
      return NextResponse.json(
        { error: 'கோப்பின் அளவு 100MB-க்குள் இருக்க வேண்டும்.' },
        { status: 400 }
      );
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const detectedPages = detectPdfPageCount(buffer);

    // 4. Construct safe private storage path in 'magazines' bucket
    const cleanFilename = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_+/g, '_');

    // Architecture: magazines/{year}/issue-{issueNumber}/{timestamp}-{filename}
    const storagePath = `${year}/issue-${issueNumber}/${Date.now()}-${cleanFilename}`;

    // 5. Upload to Supabase Storage private bucket ('premium-pdfs' or 'magazines')
    const primaryBucket = process.env.SUPABASE_MAGAZINE_BUCKET || 'premium-pdfs';
    let chosenBucket = primaryBucket;

    let { data: uploadData, error: uploadError } = await supabase.storage
      .from(primaryBucket)
      .upload(storagePath, buffer, {
        contentType: 'application/pdf',
        upsert: true,
      });

    // Fallback if primary bucket not found
    if (uploadError && uploadError.message?.toLowerCase().includes('bucket not found')) {
      const fallbackBucket = primaryBucket === 'premium-pdfs' ? 'magazines' : 'premium-pdfs';
      const fallbackResult = await supabase.storage
        .from(fallbackBucket)
        .upload(storagePath, buffer, {
          contentType: 'application/pdf',
          upsert: true,
        });

      if (!fallbackResult.error) {
        uploadError = null;
        chosenBucket = fallbackBucket;
      }
    }

    if (uploadError) {
      console.error('Supabase Storage PDF upload error:', uploadError.message);
      return NextResponse.json(
        { error: `PDF பதிவேற்றத்தில் பிழை: ${uploadError.message}` },
        { status: 502 }
      );
    }

    // 6. Safe replacement cleanup: only after successful upload, delete old file if it was in storage
    if (oldPdfUrl && !oldPdfUrl.startsWith('http') && oldPdfUrl !== storagePath) {
      try {
        const cleanOldPath = oldPdfUrl.replace(/^(magazines|premium-pdfs)\//, '');
        await supabase.storage.from(chosenBucket).remove([cleanOldPath]);
      } catch (cleanErr) {
        console.warn('Could not delete superseded PDF from storage:', cleanErr);
      }
    }

    return NextResponse.json({
      success: true,
      pdfUrl: storagePath,
      fileName: file.name,
      fileSize: file.size,
      pageCount: detectedPages > 0 ? detectedPages : undefined,
    });
  } catch (err: any) {
    console.error('PDF upload handler unexpected error:', err);
    return NextResponse.json(
      { error: err.message || 'PDF பதிவேற்றத்தில் எதிர்பாராத பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
