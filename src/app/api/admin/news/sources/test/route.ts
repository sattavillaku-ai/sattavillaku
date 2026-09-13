import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { testFeedUrl } from '@/lib/news-collector';

export async function POST(request: Request) {
  try {
    const supabase = await createClient();

    // Verify authenticated admin
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
    const feedUrl = body.feedUrl;

    if (!feedUrl || typeof feedUrl !== 'string' || !feedUrl.trim()) {
      return NextResponse.json(
        { error: 'பரிசோதிக்க வேண்டிய Feed URL முகவரியை உள்ளிடவும்.' },
        { status: 400 }
      );
    }

    const result = await testFeedUrl(feedUrl);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Test feed route error:', err);
    return NextResponse.json(
      { error: err.message || 'செய்தி ஓடையைப் பரிசோதிக்க முடியவில்லை.' },
      { status: 500 }
    );
  }
}
