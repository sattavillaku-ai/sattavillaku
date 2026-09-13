import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const BOT_USER_AGENTS = [
  'bot',
  'spider',
  'crawler',
  'facebookexternalhit',
  'slurp',
  'bingbot',
  'googlebot',
  'yandex',
  'duckduckbot',
  'baiduspider',
  'twitterbot',
  'rogerbot',
  'linkedinbot',
  'embedly',
  'quora link preview',
  'showyoubot',
  'outbrain',
  'pinterest',
];

export async function POST(request: Request) {
  try {
    const userAgent = request.headers.get('user-agent')?.toLowerCase() || '';

    // Filter automated bots and crawlers from artificially inflating view counts
    if (BOT_USER_AGENTS.some((bot) => userAgent.includes(bot))) {
      return NextResponse.json({ success: false, message: 'Bot request ignored' }, { status: 200 });
    }

    const body = await request.json().catch(() => ({}));
    const { articleId, slug } = body;

    if (!articleId && !slug) {
      return NextResponse.json({ error: 'articleId or slug is required' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Database credentials not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Fetch current article views and ensure article is published
    let query = supabase.from('articles').select('id, views, status');
    if (articleId) {
      query = query.eq('id', articleId);
    } else if (slug) {
      query = query.eq('slug', slug);
    }

    const { data: article, error: fetchError } = await query.maybeSingle();

    if (fetchError || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Only count views on published articles
    if (article.status !== 'published') {
      return NextResponse.json({ success: false, message: 'Draft views not counted' }, { status: 200 });
    }

    const nextViews = (article.views || 0) + 1;

    // 2. Increment view count
    const { error: updateError } = await supabase
      .from('articles')
      .update({ views: nextViews })
      .eq('id', article.id);

    if (updateError) {
      console.warn('View tracking update error:', updateError.message);
      return NextResponse.json({ error: 'Could not update view count' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      views: nextViews,
    });
  } catch (err: any) {
    console.error('Track view error:', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
