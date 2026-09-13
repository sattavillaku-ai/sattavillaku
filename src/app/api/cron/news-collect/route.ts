import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { runNewsCollection } from '@/lib/news-collector';

export async function GET(request: Request) {
  return handleCronCollection(request);
}

export async function POST(request: Request) {
  return handleCronCollection(request);
}

async function handleCronCollection(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.NEWS_COLLECTOR_SECRET || process.env.CRON_SECRET;

    // Security Verification: Secret required for cron execution
    if (!cronSecret || !authHeader || authHeader.replace(/^Bearer\s+/i, '') !== cronSecret) {
      return NextResponse.json(
        { error: 'அங்கீகரிக்கப்படாத தானியங்கி அழைப்பு (Unauthorized cron request).' },
        { status: 401 }
      );
    }

    const supabase = await createClient();
    const summary = await runNewsCollection(supabase);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      summary,
    });
  } catch (err: any) {
    console.error('Automated cron news collection error:', err);
    return NextResponse.json(
      { error: err.message || 'செய்தி சேகரிப்பு தோல்வியடைந்தது.' },
      { status: 500 }
    );
  }
}
