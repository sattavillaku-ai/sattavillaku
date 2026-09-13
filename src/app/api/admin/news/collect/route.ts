import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runNewsCollection } from '@/lib/news-collector';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Check authorization: Either authenticated admin session OR valid Cron secret
    let isAuthorized = false;

    // 1. Check Cron / Scheduler Secret Header
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.NEWS_COLLECTOR_SECRET || process.env.CRON_SECRET;
    if (cronSecret && authHeader && authHeader.replace(/^Bearer\s+/i, '') === cronSecret) {
      isAuthorized = true;
    }

    // 2. If not cron, check authenticated admin user session
    if (!isAuthorized) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (user && !userError) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .maybeSingle();

        if (profile?.role === 'admin') {
          isAuthorized = true;
        }
      }
    }

    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'அங்கீகரிக்கப்படாத கோரிக்கை (Unauthorized)' },
        { status: 401 }
      );
    }

    // Optional options from JSON body
    let sourceId: string | undefined;
    let maxAgeHours: number | undefined;

    try {
      const body = await request.json();
      sourceId = body.sourceId;
      maxAgeHours = body.maxAgeHours;
    } catch {
      // Body may be empty on simple POST
    }

    // Execute collection
    const summary = await runNewsCollection(supabase, { sourceId, maxAgeHours });

    return NextResponse.json({
      success: true,
      summary,
      result: summary,
    });
  } catch (err: any) {
    console.error('News collection endpoint error:', err);
    return NextResponse.json(
      { error: err.message || 'செய்தி சேகரிப்பில் எதிர்பாராத பிழை ஏற்பட்டது.' },
      { status: 500 }
    );
  }
}
