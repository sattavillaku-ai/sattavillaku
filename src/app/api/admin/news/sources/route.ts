import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { fetchNewsSources, createNewsSource, seedDefaultSources } from '@/lib/cms-service';

export async function GET() {
  try {
    const supabase = await createClient();

    // Verify admin
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

    const sources = await fetchNewsSources(supabase);
    return NextResponse.json({ sources });
  } catch (err: any) {
    console.error('Fetch news sources error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
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

    const body = await request.json();

    // Support seeding default sources
    if (body.action === 'seed') {
      const seeded = await seedDefaultSources(supabase);
      return NextResponse.json({ success: true, sources: seeded });
    }

    const created = await createNewsSource(body, supabase);
    return NextResponse.json({ success: true, source: created });
  } catch (err: any) {
    console.error('Create news source error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
