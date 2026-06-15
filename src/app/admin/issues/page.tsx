import { createServerClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { Edit, FileText, Trash2, PlusCircle, CheckCircle2, Clock, Archive } from 'lucide-react';
import { cn } from '@/lib/utils';

export default async function AdminIssuesPage() {
  const supabase = createServerClient();

  const { data: issues } = await supabase
    .from('issues')
    .select('*, issue_content(count)')
    .order('created_at', { ascending: false });

  // சுருக்கம் (Summary Stats)
  const totalIssues = issues?.length || 0;
  
  const { count: totalSubscribers } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const { data: recentPayments } = await supabase
    .from('payments')
    .select('amount')
    .eq('status', 'captured')
    .gte('created_at', startOfMonth.toISOString());
    
  const thisMonthRevenue = (recentPayments?.reduce((sum, p) => sum + p.amount, 0) || 0) / 100;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="flex items-center gap-1 text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold"><CheckCircle2 className="w-3 h-3"/> வெளியிடப்பட்டது</span>;
      case 'archived':
        return <span className="flex items-center gap-1 text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full font-bold"><Archive className="w-3 h-3"/> காப்பகம்</span>;
      default:
        return <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-1 rounded-full font-bold"><Clock className="w-3 h-3"/> வரைவு</span>;
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold font-serif">இதழ்கள் (Issues)</h1>
        <Link href="/admin/issues/new" className="bg-primary text-primary-foreground px-4 py-2 rounded-lg font-medium flex items-center gap-2 hover:bg-primary/90">
          <PlusCircle className="h-5 w-5" />
          புதிய இதழ் உருவாக்கு
        </Link>
      </div>

      {/* சுருக்கம் (Summary Stats) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">மொத்த இதழ்கள்</h3>
          <p className="text-3xl font-bold">{totalIssues}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">செயலில் உள்ள சந்தாதாரர்கள்</h3>
          <p className="text-3xl font-bold">{totalSubscribers}</p>
        </div>
        <div className="bg-card border rounded-xl p-6 shadow-sm">
          <h3 className="text-sm font-medium text-muted-foreground mb-2">இந்த மாத வருவாய்</h3>
          <p className="text-3xl font-bold text-green-600">₹{thisMonthRevenue.toLocaleString('en-IN')}</p>
        </div>
      </div>

      {/* இதழ்கள் அட்டவணை (Issues Table) */}
      <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 text-muted-foreground border-b">
              <tr>
                <th className="p-4 font-medium">தலைப்பு</th>
                <th className="p-4 font-medium">தொகுதி/எண்</th>
                <th className="p-4 font-medium">நிலை</th>
                <th className="p-4 font-medium">கட்டுரைகள்</th>
                <th className="p-4 font-medium">வெளியீடு</th>
                <th className="p-4 font-medium text-right">செயல்கள்</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {issues?.map((issue) => (
                <tr key={issue.id} className="hover:bg-muted/50 transition-colors">
                  <td className="p-4 font-serif font-medium">{issue.title}</td>
                  <td className="p-4 text-muted-foreground">தொகுதி {issue.volume_number}, இதழ் {issue.issue_number}</td>
                  <td className="p-4">{getStatusBadge(issue.status)}</td>
                  <td className="p-4">{(issue.issue_content as unknown as [{count: number}])?.[0]?.count || 0}</td>
                  <td className="p-4 text-muted-foreground">
                    {issue.published_at ? new Date(issue.published_at).toLocaleDateString('ta-IN') : '-'}
                  </td>
                  <td className="p-4 flex items-center justify-end gap-2">
                    <Link href={`/admin/issues/${issue.id}/edit`} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg" title="திருத்து (Edit)">
                      <Edit className="h-4 w-4" />
                    </Link>
                    <button className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg" title="PDF உருவாக்கு (Generate PDF)">
                      <FileText className="h-4 w-4" />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg" title="நீக்கு (Delete)">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {issues?.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              இதழ்கள் ஏதுமில்லை. புதிய ஒன்றை உருவாக்கவும்.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
