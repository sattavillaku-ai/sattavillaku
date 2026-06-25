import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArticleBody } from '@/components/magazine/ArticleBody';
import { PaywallOverlay } from '@/components/magazine/PaywallOverlay';
import { Metadata } from 'next';
import { ChevronDown, ArrowUp } from 'lucide-react';

// SEO Metadata
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();
  const { data: issue } = await supabase.from('issues').select('*').eq('slug', resolvedParams.slug).single();

  if (!issue) return {};

  return {
    title: `${issue.title} | சட்டவிளக்கு`,
    description: issue.description || '',
    openGraph: {
      title: issue.title,
      description: issue.description || '',
      images: [{ url: issue.cover_image_url || '/og-image.jpg' }],
    },
  };
}

// Static params for ISR
export async function generateStaticParams() {
  const { createAdminClient } = await import('@/lib/supabase/server');
  const supabase = createAdminClient();
  const { data: issues } = await supabase
    .from('issues')
    .select('slug')
    .eq('status', 'published');

  return issues?.map((issue) => ({
    slug: issue.slug,
  })) || [];
}

export default async function IssuePage({ params }: { params: Promise<{ slug: string }> }) {
  const resolvedParams = await params;
  const supabase = createServerClient();

  // இதழ் விவரங்கள் (Issue details)
  const { data: issue } = await supabase
    .from('issues')
    .select('*')
    .eq('slug', resolvedParams.slug)
    .single();

  if (!issue) notFound();

  // இதழ் உள்ளடக்கங்கள் (Issue contents)
  const { data: contents } = await supabase
    .from('issue_content')
    .select('*')
    .eq('issue_id', issue.id)
    .order('position', { ascending: true });

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

  const canAccessFull = isSubscribed || issue.is_free;

  // NewsArticle Schema
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: issue.title,
    description: issue.description,
    image: [issue.cover_image_url || ''],
    datePublished: issue.published_at || new Date().toISOString(),
  };

  return (
    <div className="flex flex-col gap-12 pb-24 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* ஹெடர் (Header) */}
      <section className="relative w-full h-[60vh]">
        <Image
          src={issue.cover_image_url || '/placeholder-cover.jpg'}
          alt={issue.title}
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-end p-6 md:p-16 text-white">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-6xl font-bold font-serif mb-4 leading-tight">{issue.title}</h1>
            <p className="text-lg md:text-xl opacity-90 max-w-2xl">{issue.description}</p>
          </div>
        </div>
      </section>

      {/* பொருளடக்கம் (Table of Contents) - Accordion on mobile */}
      <section className="container mx-auto px-4 max-w-4xl">
        <details className="group border rounded-xl bg-card overflow-hidden" open>
          <summary className="flex items-center justify-between p-4 cursor-pointer font-bold font-serif text-xl bg-muted/50 list-none">
            <span>இதழ் உள்ளடக்கம் (Table of Contents)</span>
            <ChevronDown className="h-5 w-5 transition-transform group-open:rotate-180" />
          </summary>
          <div className="divide-y p-2">
            {contents?.map((item) => (
              <a 
                key={item.id} 
                href={`#article-${item.id}`}
                className="flex justify-between items-center p-4 hover:bg-accent transition-colors rounded-lg group"
              >
                <div>
                  <h3 className="font-bold group-hover:text-primary transition-colors">{item.title}</h3>
                  <p className="text-xs text-muted-foreground mt-1">{item.author_name} • {item.content_type}</p>
                </div>
                {!canAccessFull && !item.is_preview && (
                  <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-1 rounded font-bold uppercase">சந்தா</span>
                )}
              </a>
            ))}
          </div>
        </details>
      </section>

      {/* கட்டுரைகள் (Articles) */}
      <section className="container mx-auto px-4">
        {contents?.map((item) => {
          const showFull = canAccessFull || item.is_preview;
          
          return (
            <div key={item.id} id={`article-${item.id}`} className="mb-24 last:mb-0 relative scroll-mt-24">
              <ArticleBody
                articleId={item.id}
                title={item.title}
                author={item.author_name || ''}
                content={showFull ? item.body : {
                  ...item.body,
                  content: item.body.content?.slice(0, 2)
                }}
              />
              
              {!showFull && (
                <div className="max-w-3xl mx-auto px-4">
                  <PaywallOverlay price="₹30/மாதம்" />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Back to top button */}
      <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-8 right-8 p-4 bg-primary text-primary-foreground rounded-full shadow-lg opacity-0 hover:opacity-100 transition-opacity z-50 md:hidden"
        id="back-to-top"
      >
        <ArrowUp className="h-6 w-6" />
      </button>
    </div>
  );
}
