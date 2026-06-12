import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ results: [] });
  }

  const supabase = createServerClient();

  // தமிழ் முழு உரை தேடல் மற்றும் ஒற்றுமை தேடல் (Full-text search and similarity)
  // Note: We use rpc for more complex logic if needed, but here's a standard query
  const { data, error } = await supabase
    .from('issue_content')
    .select('*, issues(title, slug)')
    .textSearch('title', query, {
      config: 'simple', // Simple for multilingual/trgm
      type: 'websearch'
    })
    .limit(20);

  if (error) {
    console.error('Search error:', error);
    return NextResponse.json({ results: [], error: error.message }, { status: 500 });
  }

  // பயனர் சந்தா சரிபார்ப்பு (User subscription check)
  const { data: { session } } = await supabase.auth.getSession();
  let isSubscribed = false;

  if (session) {
    const { data: sub } = await supabase
      .from('subscriptions')
      .select('status, current_period_end')
      .eq('user_id', session.user.id)
      .single();
    
    isSubscribed = sub?.status === 'active' && new Date(sub.current_period_end) > new Date();
  }

  // சந்தா இல்லாதவர்களுக்கு சுருக்கமான உள்ளடக்கத்தை மட்டும் காட்டு (Show snippets to non-subscribers)
  const results = data.map(item => ({
    id: item.id,
    title: item.title,
    author: item.author_name,
    issue_title: (item.issues as any).title,
    issue_slug: (item.issues as any).slug,
    snippet: isSubscribed || item.is_preview ? 'முழு உள்ளடக்கம் கிடைக்கிறது' : 'சந்தா தேவை'
  }));

  return NextResponse.json({ results });
}
