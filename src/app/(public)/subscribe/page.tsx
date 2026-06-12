'use client';

import { useUser } from '@/hooks/useUser';
import { Check, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import Link from 'next/link';

export default function SubscribePage() {
  const { user, isSubscribed, isLoading } = useUser();
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const plans = [
    {
      id: 'monthly',
      name: 'மாத திட்டம்',
      price: '₹30',
      duration: 'மாதம்',
      amount: 3000,
      features: ['அனைத்து இதழ்களும்', 'பழைய இதழ்கள்', 'புதிய இதழ்கள் உடனுக்குடன்'],
    },
    {
      id: 'annual',
      name: 'ஆண்டு திட்டம்',
      price: '₹300',
      duration: 'ஆண்டு',
      amount: 30000,
      features: ['அனைத்து இதழ்களும்', 'பழைய இதழ்கள்', 'PDF பதிவிறக்கம்', '2 மாதங்கள் இலவசம்'],
      isPopular: true,
    },
  ];

  const handleCheckout = async (planId: string) => {
    if (!user) {
      router.push(`/login?redirect=/subscribe`);
      return;
    }

    setIsProcessing(planId);
    try {
      // 1. Razorpay ஸ்கிரிப்டை ஏற்றவும் (Load Razorpay script)
      const res = await loadRazorpayScript();
      if (!res) {
        alert('Razorpay SDK failed to load. Are you online?');
        return;
      }

      // 2. ஆர்டர் உருவாக்கவும் (Create order)
      const orderRes = await fetch('/api/subscription/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });
      const orderData = await orderRes.json();

      if (!orderRes.ok) throw new Error(orderData.error || 'பிழை ஏற்பட்டது');

      // 3. Razorpay செக்அவுட் (Razorpay Checkout)
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'தமிழ் இதழ்',
        description: `${planId === 'monthly' ? 'மாத' : 'ஆண்டு'} சந்தா`,
        order_id: orderData.orderId,
        handler: async function (response: any) {
          // 4. சரிபார்க்கவும் (Verify)
          const verifyRes = await fetch('/api/subscription/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              planId,
            }),
          });
          const verifyData = await verifyRes.json();
          if (verifyData.success) {
            router.push('/profile?message=சந்தா வெற்றிகரமாக முடிந்தது!');
          } else {
            alert('சரிபார்ப்பில் பிழை ஏற்பட்டது.');
          }
        },
        prefill: {
          email: user.email,
        },
        theme: {
          color: '#000000',
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setIsProcessing(null);
    }
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  if (isLoading) {
    return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;
  }

  if (isSubscribed) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold font-serif mb-4">நீங்கள் ஏற்கனவே சந்தாதாரர்</h1>
        <p className="mb-8">உங்கள் சந்தா விவரங்களை நிர்வகிக்க பில்லிங் பகுதிக்குச் செல்லவும்.</p>
        <Link href="/billing" className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium">பில்லிங் பகுதிக்குச் செல்க</Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-5xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-bold font-serif mb-4 text-primary">சந்தா பெறுங்கள்</h1>
        <p className="text-xl text-muted-foreground">சிறந்த தமிழ் படைப்புகளைத் தொடர்ந்து வாசிக்க உங்கள் திட்டத்தைத் தேர்வு செய்யவும்.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        {plans.map((plan) => (
          <div 
            key={plan.id}
            className={`relative rounded-2xl border-2 p-8 flex flex-col ${plan.isPopular ? 'border-primary shadow-lg' : 'border-border'}`}
          >
            {plan.isPopular && (
              <span className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-bold">
                சிறந்த மதிப்பு (Best Value)
              </span>
            )}
            
            <h2 className="text-2xl font-bold font-serif mb-2">{plan.name}</h2>
            <div className="flex items-baseline gap-1 mb-6">
              <span className="text-4xl font-bold">{plan.price}</span>
              <span className="text-muted-foreground">/{plan.duration}</span>
            </div>

            <ul className="space-y-4 mb-8 flex-grow">
              {plan.features.map((feature, idx) => (
                <li key={idx} className="flex items-center gap-2">
                  <Check className="h-5 w-5 text-green-500" />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            <button
              onClick={() => handleCheckout(plan.id)}
              disabled={!!isProcessing}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                plan.isPopular ? 'bg-primary text-primary-foreground hover:bg-primary/90' : 'bg-background border-2 hover:bg-accent'
              } disabled:opacity-50`}
            >
              {isProcessing === plan.id ? <Loader2 className="h-6 w-6 animate-spin mx-auto" /> : 'இப்போதே தொடங்கு'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
