import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = (await headers()).get('x-razorpay-signature');
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET!;

  // 1. வெப்ஹூக் கையொப்பத்தை சரிபார்க்கவும்
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(body)
    .digest('hex');

  if (expectedSignature !== signature) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabase = createServerClient();

  // 2. நிகழ்வுகளைக் கையாளவும் (Handle events)
  switch (event.event) {
    case 'payment.captured':
      // கட்டணம் வெற்றிகரமாக முடிந்தது
      const paymentId = event.payload.payment.entity.id;
      const orderId = event.payload.payment.entity.order_id;
      
      await supabase
        .from('payments')
        .update({ status: 'captured', razorpay_payment_id: paymentId })
        .eq('razorpay_order_id', orderId);
      break;

    case 'payment.failed':
      // கட்டணம் தோல்வியடைந்தது
      const failedOrderId = event.payload.payment.entity.order_id;
      await supabase
        .from('payments')
        .update({ status: 'failed' })
        .eq('razorpay_order_id', failedOrderId);
      break;

    case 'subscription.cancelled':
      // சந்தா ரத்து செய்யப்பட்டது
      const subId = event.payload.subscription.entity.id;
      await supabase
        .from('subscriptions')
        .update({ status: 'cancelled' })
        .eq('razorpay_subscription_id', subId);
      break;
  }

  return NextResponse.json({ received: true }, { status: 200 });
}
