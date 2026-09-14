import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    const id = searchParams.get('id');
    const path = searchParams.get('path');

    const supabase = await createClient();

    // Check if current user is admin
    let isAdmin = false;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();
      if (profile?.role === 'admin') {
        isAdmin = true;
      }
    }

    let targetPath = path || '';
    let issueTitle = 'சட்டவிளக்கு இதழ்';
    let issuePageCount = 64;

    // If slug or id is provided, fetch issue from Supabase
    if (slug || id) {
      let query = supabase.from('issues').select('id, title, slug, status, pdf_url, page_count');
      if (slug) {
        query = query.eq('slug', slug);
      } else if (id) {
        query = query.eq('id', id);
      }

      const { data: issue, error: issueError } = await query.maybeSingle();

      if (issueError || !issue) {
        return NextResponse.json(
          { error: 'கோரப்பட்ட இதழ் கிடைக்கவில்லை (Issue not found).' },
          { status: 404 }
        );
      }

      // Security Check: Draft issues must NEVER be accessible to public visitors
      if (issue.status !== 'published' && !isAdmin) {
        return NextResponse.json(
          { error: 'இந்த இதழ் இன்னும் வெளியிடப்படவில்லை (Draft issue is private).' },
          { status: 403 }
        );
      }

      targetPath = issue.pdf_url || '';
      issueTitle = issue.title || issueTitle;
      issuePageCount = issue.page_count || issuePageCount;
    }

    if (!targetPath || !targetPath.trim()) {
      return NextResponse.json(
        { error: 'இந்த இதழுக்கான PDF ஆவணம் பதிவேற்றப்படவில்லை.' },
        { status: 404 }
      );
    }

    // Direct HTTP(S) URL or local sample file
    if (targetPath.startsWith('http://') || targetPath.startsWith('https://') || targetPath.startsWith('/')) {
      return NextResponse.json({
        url: targetPath,
        title: issueTitle,
        pageCount: issuePageCount,
      });
    }

    // Storage path in private Supabase Storage
    const cleanPath = targetPath.replace(/^(magazines|premium-pdfs|magazine-assets)\//, '');
    const candidateBuckets = [
      process.env.SUPABASE_MAGAZINE_BUCKET,
      'premium-pdfs',
      'magazines',
      'magazine-assets',
    ].filter(Boolean) as string[];

    for (const bName of candidateBuckets) {
      const { data: signedData } = await supabase.storage
        .from(bName)
        .createSignedUrl(cleanPath, 3600); // 1 hour temporary access

      if (signedData?.signedUrl) {
        return NextResponse.json({
          url: signedData.signedUrl,
          title: issueTitle,
          pageCount: issuePageCount,
        });
      }
    }

    console.warn('Could not generate signed URL for path across buckets:', cleanPath);
    return NextResponse.json(
      { error: 'PDF கோப்பைப் பெற முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.' },
      { status: 404 }
    );
  } catch (err: any) {
    console.error('PDF signed URL error:', err);
    return NextResponse.json(
      { error: 'PDF ஆவணத்தைப் பெறுவதில் எதிர்பாராத பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
