'use client';

import { useUser } from '@/hooks/useUser';
import { createClient } from '@/lib/supabase/client';
import { useState, useEffect } from 'react';
import { CreditCard, Calendar, History, Loader2, XCircle } from 'lucide-react';

export default function BillingPage() {
  const { user, subscription, isSubscribed, isLoading } = useUser();
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    if (user) {
      const fetchPayments = async () => {
        const { data } = await supabase
          .from('payments')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        setPayments(data ?? []);
      };
      fetchPayments();
    }
  }, [user, supabase]);

  const handleCancel = async () => {
    if (!confirm('உங்கள் சந்தாவை ரத்து செய்ய விரும்புகிறீர்களா?')) return;
    
    setIsCancelling(true);
    try {
      const res = await fetch('/api/subscription/cancel', { method: 'POST' });
      if (res.ok) {
        alert('உங்கள் சந்தா ரத்து செய்யப்பட்டது.');
        window.location.reload();
      } else {
        alert('பிழை ஏற்பட்டது.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoading) return <div className="flex h-96 items-center justify-center"><Loader2 className="animate-spin" /></div>;

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold font-serif mb-8">பில்லிங் (Billing)</h1>

      <div className="grid gap-6 mb-12">
        {/* தற்போதைய சந்தா (Current Subscription) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">தற்போதைய சந்தா</h2>
              <p className="text-sm text-muted-foreground">உங்கள் திட்ட விவரங்கள்</p>
            </div>
          </div>

          {isSubscribed ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span>திட்டம் (Plan)</span>
                <span className="font-bold">{subscription?.plan_type === 'monthly' ? 'மாத திட்டம்' : 'ஆண்டு திட்டம்'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>நிலை (Status)</span>
                <span className="text-green-600 font-bold">செயல்பாட்டில் உள்ளது (Active)</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span>அடுத்த பில்லிங் தேதி</span>
                <span className="font-medium">{new Date(subscription!.current_period_end).toLocaleDateString('ta-IN')}</span>
              </div>
              
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="mt-4 flex items-center gap-2 text-destructive hover:underline text-sm font-medium"
              >
                <XCircle className="h-4 w-4" />
                சந்தாவை ரத்து செய்
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-muted-foreground mb-4">உங்களிடம் தற்போது செயலில் உள்ள சந்தா ஏதுமில்லை.</p>
              <button className="bg-primary text-primary-foreground px-6 py-2 rounded-md font-medium">திட்டத்தைத் தேர்வு செய்</button>
            </div>
          )}
        </div>

        {/* கட்டண வரலாறு (Payment History) */}
        <div className="rounded-xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-primary/10 p-3 rounded-full">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">கட்டண வரலாறு</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="p-3 font-medium">தேதி</th>
                  <th className="p-3 font-medium">தொகை</th>
                  <th className="p-3 font-medium">நிலை</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {payments.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                    <td className="p-3">{new Date(p.created_at).toLocaleDateString('ta-IN')}</td>
                    <td className="p-3">₹{p.amount / 100}</td>
                    <td className="p-3">
                      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        p.status === 'captured' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.status === 'captured' ? 'வெற்றி' : 'நிலுவையில்'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {payments.length === 0 && (
              <p className="text-center py-8 text-muted-foreground">கட்டணப் பதிவுகள் ஏதுமில்லை.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
