import { createServerClient } from '@/lib/supabase/server';
import { Download } from 'lucide-react';

export default async function SubscribersPage() {
  const supabase = createServerClient();

  const { data: subscribers } = await supabase
    .from('subscriptions')
    .select('*, users(email, display_name)')
    .order('created_at', { ascending: false });

  const activeCount = subscribers?.filter(s => s.status === 'active').length || 0;

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif">சந்தாதாரர்கள் (Subscribers)</h1>
        <button className="bg-outline border px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-accent">
          <Download className="h-4 w-4" />
          CSV பதிவிறக்கு
        </button>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm max-w-sm">
        <h3 className="text-sm font-medium text-muted-foreground mb-2">செயலில் உள்ள சந்தாதாரர்கள்</h3>
        <p className="text-4xl font-bold text-primary">{activeCount}</p>
      </div>

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="p-4 font-medium">பெயர் & மின்னஞ்சல்</th>
                <th className="p-4 font-medium">திட்டம்</th>
                <th className="p-4 font-medium">தொடங்கிய தேதி</th>
                <th className="p-4 font-medium">அடுத்த பில்லிங்</th>
                <th className="p-4 font-medium">நிலை</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {subscribers?.map((sub) => (
                <tr key={sub.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4">
                    <div className="font-medium">{(sub.users as any)?.display_name || 'பயனர்'}</div>
                    <div className="text-xs text-muted-foreground">{(sub.users as any)?.email}</div>
                  </td>
                  <td className="p-4">{sub.plan_type === 'monthly' ? 'மாதம்' : 'ஆண்டு'}</td>
                  <td className="p-4">{new Date(sub.current_period_start).toLocaleDateString('ta-IN')}</td>
                  <td className="p-4">{new Date(sub.current_period_end).toLocaleDateString('ta-IN')}</td>
                  <td className="p-4">
                     <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                        sub.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                      }`}>
                        {sub.status === 'active' ? 'செயலில்' : 'ரத்து செய்யப்பட்டது'}
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
