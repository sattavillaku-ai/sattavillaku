import { createServerClient } from '@/lib/supabase/server';
import { razorpayClient } from '@/lib/razorpay/client';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const supabase = createServerClient();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json({ error: 'உள்நுழைய வேண்டும்' }, { status: 401 });
    }

    const { planId } = await req.json();
    const amount = planId === 'monthly' ? 3000 : 30000;

    // 1. ஏற்கனவே சந்தா உள்ளதா என சரிபார்க்கவும்
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', session.user.id)
      .single();

    if (sub?.status === 'active' && new Date(sub.current_period_end) > new Date()) {
      return NextResponse.json({ error: 'உங்களுக்கு ஏற்கனவே ஒரு செயலில் உள்ள சந்தா உள்ளது' }, { status: 400 });
    }

    // 2. Razorpay ஆர்டர் உருவாக்கவும்
    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpayClient.orders.create(options);

    // 3. நிலுவையில் உள்ள கட்டணப் பதிவைச் சேர்க்கவும் (Pending payment record)
    await supabase.from('payments').insert({
      user_id: session.user.id,
      razorpay_order_id: order.id,
      amount,
      status: 'pending',
    });

    return NextResponse.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    });
  } catch (error: any) {
    console.error('Order creation error:', error);
    return NextResponse.json({ error: 'ஆர்டர் உருவாக்குவதில் பிழை ஏற்பட்டது' }, { status: 500 });
  }
}
