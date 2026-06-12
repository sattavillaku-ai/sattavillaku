import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'உள்நுழைய வேண்டும்' }, { status: 401 });
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } = await req.json();

    // 1. கையொப்பத்தை சரிபார்க்கவும் (Verify Signature)
    const secret = process.env.RAZORPAY_KEY_SECRET!;
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', secret)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      return NextResponse.json({ error: 'தவறான கையொப்பம்' }, { status: 400 });
    }

    // 2. கட்டணப் பதிவை புதுப்பிக்கவும் (Update payment record)
    await supabase
      .from('payments')
      .update({
        status: 'captured',
        razorpay_payment_id,
        razorpay_signature,
      })
      .eq('razorpay_order_id', razorpay_order_id);

    // 3. சந்தாவை உருவாக்கவும் அல்லது புதுப்பிக்கவும் (Upsert subscription)
    const duration = planId === 'monthly' ? 30 : 365;
    const periodEnd = new Date();
    periodEnd.setDate(periodEnd.getDate() + duration);

    await supabase.from('subscriptions').upsert({
      user_id: session.user.id,
      status: 'active',
      plan_type: planId,
      current_period_start: new Date().toISOString(),
      current_period_end: periodEnd.toISOString(),
      updated_at: new Date().toISOString(),
    });

    // 4. பயனர் பங்கினைப் புதுப்பிக்கவும் (Update user role)
    await supabase
      .from('users')
      .update({ role: 'subscriber' })
      .eq('id', session.user.id);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Verification error:', error);
    return NextResponse.json({ error: 'சரிபார்ப்பில் பிழை ஏற்பட்டது' }, { status: 500 });
  }
}
