import { createServerClient } from '@/lib/supabase/server';
import { IssueCard } from '@/components/magazine/IssueCard';
import { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'இதழ் காப்பகம்',
  description: 'சட்டவிளக்கு இதழின் பழைய மற்றும் புதிய பதிப்புகளை இங்கே காணலாம்.',
};

export default async function ArchivePage({ 
  searchParams 
}: { 
  searchParams: { category?: string, year?: string, page?: string } 
}) {
  const supabase = createServerClient();
  const page = parseInt(searchParams.page || '1');
  const limit = 12;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  let query = supabase
    .from('issues')
    .select('*, issue_content(content_type)', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false });

  // ஆண்டு வாரியாக வடிகட்டுதல் (Year filter)
  if (searchParams.year) {
    const startOfYear = `${searchParams.year}-01-01T00:00:00Z`;
    const endOfYear = `${searchParams.year}-12-31T23:59:59Z`;
    query = query.gte('published_at', startOfYear).lte('published_at', endOfYear);
  }

  // பின்தொடர்ச்சி (Pagination)
  const { data: issues, count } = await query.range(from, to);

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-12 border-b pb-8">
        <div>
          <h1 className="text-4xl font-bold font-serif mb-2">இதழ் காப்பகம் (Archive)</h1>
          <p className="text-muted-foreground">சட்டவிளக்கு இதழின் அனைத்து தொகுப்புகளும் இங்கே.</p>
        </div>
        
        <div className="flex gap-4">
          <select 
            className="p-2 rounded-md border bg-background text-sm"
            defaultValue={searchParams.year || ""}
            // In a real app, use a client component for navigation
          >
            <option value="">அனைத்து ஆண்டுகளும்</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {issues?.map((issue) => (
          <IssueCard key={issue.id} issue={issue as any} />
        ))}
      </div>

      {count && count > limit && (
        <div className="mt-16 flex justify-center gap-4">
          {page > 1 && (
            <a href={`/issues?page=${page - 1}`} className="px-4 py-2 border rounded hover:bg-accent">முந்தைய</a>
          )}
          {count > to + 1 && (
            <a href={`/issues?page=${page + 1}`} className="px-4 py-2 border rounded hover:bg-accent">அடுத்தது</a>
          )}
        </div>
      )}
    </div>
  );
}
