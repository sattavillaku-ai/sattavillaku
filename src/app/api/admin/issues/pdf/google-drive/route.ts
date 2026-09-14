import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

function detectPdfPageCount(buffer: Buffer): number {
  try {
    const text = buffer.toString('latin1');
    const matches = text.match(/\/Type\s*\/Page[^s]/g);
    if (matches && matches.length > 0) {
      return matches.length;
    }
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

    // 1. Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'அங்கீகரிக்கப்படாத கோரிக்கை. தயவுசெய்து உள்நுழையவும்.' },
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
        { error: 'நிர்வாக அனுமதி இல்லை (Forbidden).' },
        { status: 403 }
      );
    }

    // 2. Parse payload
    const body = await request.json();
    const { fileId, fileName, accessToken, issueNumber = 'draft', year = new Date().getFullYear().toString(), oldPdfUrl = '' } = body;

    if (!fileId || !accessToken) {
      return NextResponse.json(
        { error: 'கூகுள் டிரைவ் கோப்பு ஐடி அல்லது அனுமதி டோக்கன் விடுபட்டுள்ளது.' },
        { status: 400 }
      );
    }

    // 3. Fetch PDF from Google Drive API
    const driveRes = await fetch(
      `https://www.googleapis.com/drive/v3/files/${encodeURIComponent(fileId)}?alt=media`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!driveRes.ok) {
      console.error('Google Drive PDF download failed:', driveRes.status);
      return NextResponse.json(
        { error: 'கூகுள் டிரைவிலிருந்து PDF கோப்பைப் பதிவிறக்க இயலவில்லை.' },
        { status: 502 }
      );
    }

    const arrayBuffer = await driveRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Limit check (100MB)
    const maxSizeBytes = 100 * 1024 * 1024;
    if (buffer.length > maxSizeBytes) {
      return NextResponse.json(
        { error: 'PDF கோப்பின் அளவு 100MB-க்கு மிகாமல் இருக்க வேண்டும்.' },
        { status: 400 }
      );
    }

    const detectedPages = detectPdfPageCount(buffer);

    // 4. Save into Supabase Storage private bucket 'magazines'
    const cleanFilename = (fileName || 'drive-import.pdf')
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '_')
      .replace(/_+/g, '_');

    const storagePath = `${year}/issue-${issueNumber}/${Date.now()}-${cleanFilename}`;

    const primaryBucket = process.env.SUPABASE_MAGAZINE_BUCKET || 'premium-pdfs';
    let chosenBucket = primaryBucket;

    let { error: uploadError } = await supabase.storage
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
      console.error('Supabase Storage PDF upload error from Drive:', uploadError.message);
      return NextResponse.json(
        { error: `PDF சேமிப்பதில் பிழை: ${uploadError.message}` },
        { status: 502 }
      );
    }

    // Clean old superseded PDF if present
    if (oldPdfUrl && !oldPdfUrl.startsWith('http') && oldPdfUrl !== storagePath) {
      try {
        const cleanOldPath = oldPdfUrl.replace(/^(magazines|premium-pdfs)\//, '');
        await supabase.storage.from(chosenBucket).remove([cleanOldPath]);
      } catch (cleanErr) {
        console.warn('Could not delete old PDF from storage:', cleanErr);
      }
    }

    return NextResponse.json({
      success: true,
      pdfUrl: storagePath,
      fileName: fileName || 'magazine.pdf',
      fileSize: buffer.length,
      pageCount: detectedPages > 0 ? detectedPages : undefined,
    });
  } catch (err: any) {
    console.error('Google Drive PDF Import error:', err);
    return NextResponse.json(
      { error: err.message || 'கூகுள் டிரைவ் PDF பதிவிறக்கத்தில் எதிர்பாராத பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
