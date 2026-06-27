import { createServerClient, createAdminClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const resolvedParams = await params;
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    // 1. இதழ் விவரங்களைப் பெறவும்
    const { data: issue, error: issueError } = await supabase
      .from('issues')
      .select('id, pdf_url, published_at')
      .eq('slug', resolvedParams.slug)
      .single();

    if (issueError || !issue?.pdf_url) {
      return NextResponse.json({ error: 'PDF இன்னும் தயாரில்லை', message: 'இந்த இதழுக்கான PDF இன்னும் உருவாக்கப்படவில்லை.' }, { status: 404 });
    }

    // 2. நடப்பு மாத இதழா எனச் சரிபார்க்கவும் (Check if current month's issue)
    const pubDate = issue.published_at ? new Date(issue.published_at) : null;
    const now = new Date();
    const isCurrentMonth = pubDate 
      ? (pubDate.getFullYear() === now.getFullYear() && pubDate.getMonth() === now.getMonth())
      : false;

    if (isCurrentMonth) {
      if (!session) {
        return NextResponse.json({ error: 'உள்நுழைய வேண்டும்', message: 'இத்தற்போதைய இதழைப் பார்க்க முதலில் உள்நுழையவும்.' }, { status: 401 });
      }

      // Check if user is admin
      const { data: userData } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();
      
      const isAdmin = userData?.role === 'admin';

      if (!isAdmin) {
        // Subscription check
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status, current_period_end')
          .eq('user_id', session.user.id)
          .single();

        const isSubscribed = sub?.status === 'active' && new Date(sub.current_period_end) > new Date();

        if (!isSubscribed) {
          return NextResponse.json({ error: 'சந்தா தேவை', message: 'இந்த மாத இதழைப் படிக்க சந்தா தேவை.' }, { status: 403 });
        }
      }
    }

    // 3. சைய்ன் செய்யப்பட்ட URL உருவாக்கவும் (Signed URL) using Admin Client
    const adminSupabase = createAdminClient();
    const { data: signedData, error: signError } = await adminSupabase.storage
      .from('premium-pdfs')
      .createSignedUrl(issue.pdf_url, 7200); // 2 மணிநேரம்

    if (signError) throw signError;

    // 4. பதிவிறக்கத்தைப் பதிவு செய்யவும் (Log Download)
    if (session) {
      await supabase.from('pdf_downloads').insert({
        user_id: session.user.id,
        issue_id: issue.id,
      });
    }

    return NextResponse.json({ signedUrl: signedData.signedUrl });
  } catch (error: any) {
    console.error('Download Error:', error);
    return NextResponse.json({ error: 'பதிவிறக்குவதில் பிழை ஏற்பட்டது' }, { status: 500 });
  }
}

