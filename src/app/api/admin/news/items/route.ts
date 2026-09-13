import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchNewsItems } from '@/lib/cms-service';

export async function GET(request: Request) {
  try {
    const supabase = await createClient();

    // Verify admin session
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (profile?.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const category = searchParams.get('category') || undefined;
    const sourceId = searchParams.get('sourceId') || undefined;
    const search = searchParams.get('search') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;

    const result = await fetchNewsItems(
      { status, category, sourceId, search, limit, offset },
      supabase
    );

    return NextResponse.json({
      success: true,
      items: result.items,
      total: result.total,
    });
  } catch (err: any) {
    console.error('Fetch news items error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
