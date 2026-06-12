import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'உள்நுழைய வேண்டும்' }, { status: 401 });
    }

    // சந்தாவை ரத்து செய்யுவும் (Set cancel_at_period_end to true)
    const { error } = await supabase
      .from('subscriptions')
      .update({ cancel_at_period_end: true })
      .eq('user_id', session.user.id);

    if (error) throw error;

    // இங்கே Resend மூலம் மின்னஞ்சல் அனுப்பலாம் (Email via Resend here)

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Cancellation error:', error);
    return NextResponse.json({ error: 'ரத்து செய்வதில் பிழை ஏற்பட்டது' }, { status: 500 });
  }
}
