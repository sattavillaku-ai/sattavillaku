'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function RevenuePage() {
  const supabase = createClient();
  const [payments, setPayments] = useState<any[]>([]);
  const [activeSubscribers, setActiveSubscribers] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const { data: payData } = await supabase
        .from('payments')
        .select('*, users(email)')
        .order('created_at', { ascending: false });
      setPayments(payData || []);

      const { count } = await supabase
        .from('subscriptions')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');
      setActiveSubscribers(count || 0);
    };
    fetchData();
  }, [supabase]);

  // எளிமையான மாதாந்திர வருவாய் கணக்கீடு (Simple monthly revenue calculation)
  const monthlyRevenue = activeSubscribers * 99; // Assuming monthly plan avg

  const chartData = [
    { name: 'ஜனவரி', total: 0 },
    { name: 'பிப்ரவரி', total: 0 },
    { name: 'மார்ச்', total: 0 },
    { name: 'ஏப்ரல்', total: 0 },
    { name: 'மே', total: 0 },
    { name: 'ஜூன்', total: monthlyRevenue }, // Current month mock
  ];

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold font-serif">வருவாய் (Revenue)</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">மதிப்பிடப்பட்ட மாதாந்திர வருவாய் (MRR)</h3>
          <p className="text-4xl font-bold text-green-600">₹{monthlyRevenue.toLocaleString('en-IN')}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">மொத்த பரிவர்த்தனைகள்</h3>
          <p className="text-4xl font-bold">{payments.length}</p>
        </div>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm h-96">
        <h3 className="text-lg font-bold font-serif mb-6">மாதாந்திர வளர்ச்சி (Monthly Growth)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="name" axisLine={false} tickLine={false} />
            <YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `₹${value}`} />
            <Tooltip formatter={(value) => `₹${value}`} cursor={{fill: 'transparent'}} />
            <Bar dataKey="total" fill="#16a34a" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden mt-8">
         <div className="p-6 border-b">
            <h3 className="text-lg font-bold font-serif">சமீபத்திய பரிவர்த்தனைகள் (Recent Transactions)</h3>
         </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="p-4 font-medium">தேதி</th>
                <th className="p-4 font-medium">பயனர்</th>
                <th className="p-4 font-medium">தொகை</th>
                <th className="p-4 font-medium">பரிவர்த்தனை எண்</th>
                <th className="p-4 font-medium">நிலை</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {payments.slice(0, 10).map((p) => (
                <tr key={p.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">{new Date(p.created_at).toLocaleDateString('ta-IN')}</td>
                  <td className="p-4">{(p.users as any)?.email}</td>
                  <td className="p-4 font-medium">₹{p.amount / 100}</td>
                  <td className="p-4 text-xs text-muted-foreground font-mono">{p.razorpay_payment_id || p.razorpay_order_id}</td>
                  <td className="p-4">
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
        </div>
      </div>
    </div>
  );
}
