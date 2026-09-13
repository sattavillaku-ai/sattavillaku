import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchNewsDrafts, fetchNewsItemById, saveNewsDraft } from '@/lib/cms-service';
import { generateTamilNewsDrafts } from '@/lib/gemini';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'அங்கீகரிக்கப்படாத கோரிக்கை (Unauthorized)' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'நிர்வாக அனுமதி இல்லை (Forbidden)' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const review_status = searchParams.get('status') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await fetchNewsDrafts({ review_status, search, limit, offset }, supabase);

    return NextResponse.json({
      success: true,
      drafts: result.drafts,
      total: result.total,
    });
  } catch (err: any) {
    console.error('Fetch drafts error:', err);
    return NextResponse.json({ error: err.message || 'செய்தி வரைவுகளைப் பெறுவதில் பிழை.' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify admin
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'அங்கீகரிக்கப்படாத கோரிக்கை (Unauthorized)' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'நிர்வாக அனுமதி இல்லை (Forbidden)' }, { status: 403 });
    }

    const body = await request.json();
    const itemIds: string[] = Array.isArray(body.itemIds)
      ? body.itemIds
      : body.itemId
      ? [body.itemId]
      : [];

    const force: boolean = Boolean(body.force);

    if (itemIds.length === 0) {
      return NextResponse.json(
        { error: 'வரைவு உருவாக்க குறைந்தபட்சம் ஒரு செய்தியைத் தேர்ந்தெடுக்கவும்.' },
        { status: 400 }
      );
    }

    // Fetch news items
    const itemsToProcess: any[] = [];
    for (const id of itemIds) {
      const item = await fetchNewsItemById(id, supabase);
      if (item) {
        // If not force, check if draft already exists
        if (!force) {
          const { data: existingDraft } = await supabase
            .from('news_drafts')
            .select('id')
            .eq('news_item_id', id)
            .maybeSingle();

          if (existingDraft) {
            continue; // Skip already generated drafts
          }
        }
        itemsToProcess.push(item);
      }
    }

    if (itemsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'தேர்ந்தெடுக்கப்பட்ட செய்திகளுக்கு ஏற்கனவே வரைவுகள் உள்ளன.',
        count: 0,
        drafts: [],
      });
    }

    // Query categories to map category_slug to category_id
    const { data: categories } = await supabase.from('categories').select('id, slug');
    const categoryMap = new Map<string, string>();
    (categories || []).forEach((c) => categoryMap.set(c.slug, c.id));

    // Generate drafts with Gemini in batches of up to 5 items
    const generatedResults = await generateTamilNewsDrafts(
      itemsToProcess.map((item) => ({
        id: item.id,
        original_title: item.original_title || item.headline || '',
        original_content: item.original_content || item.content || item.summary || '',
        source_name: item.source_name || item.source || '',
        original_url: item.original_url || item.source_url || '',
        category: item.category,
        category_slug: item.category_slug,
      }))
    );

    const savedDrafts = [];

    for (const res of generatedResults) {
      const catId = categoryMap.get(res.category_slug) || null;

      // Check if updating existing draft (force regeneration)
      const { data: existing } = await supabase
        .from('news_drafts')
        .select('id')
        .eq('news_item_id', res.news_item_id)
        .maybeSingle();

      const saved = await saveNewsDraft(
        {
          id: existing?.id,
          news_item_id: res.news_item_id,
          tamil_headline: res.tamil_headline,
          tamil_summary: res.tamil_summary,
          tamil_content: res.tamil_content,
          category_id: catId,
          tags: res.tags,
          ai_model: res.ai_model,
          review_status: 'pending',
          reviewed_by: null,
          review_notes: null,
          reviewed_at: null,
        },
        supabase
      );

      // Update news_item status to 'review'
      await supabase
        .from('news_items')
        .update({
          status: 'review',
          updated_at: new Date().toISOString(),
        })
        .eq('id', res.news_item_id);

      savedDrafts.push(saved);
    }

    return NextResponse.json({
      success: true,
      count: savedDrafts.length,
      drafts: savedDrafts,
    });
  } catch (err: any) {
    console.error('Draft generation error:', err);
    return NextResponse.json(
      { error: err.message || 'Gemini வரைவு உருவாக்குவதில் பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
