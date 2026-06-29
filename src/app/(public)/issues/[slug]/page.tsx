import { createServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { ArticleBody } from '@/components/magazine/ArticleBody';
import { PaywallOverlay } from '@/components/magazine/PaywallOverlay';
import { DownloadPDFButton } from '@/components/magazine/DownloadPDFButton';
import { Metadata } from 'next';
import { ChevronDown, ArrowUp, Calendar, Crown, BookOpen, FileText } from 'lucide-react';

export const dynamic = 'force-dynamic';

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

  // இதழின் முழு உள்ளடக்கத்தை அணுகக்கூடிய அனுமதி (எல்லோருக்கும் அனுமதி - Free access for all)
  const canAccessFull = true;
  const pdfAvailable = !!issue.pdf_url;
  const needsPay = false;

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
    <div className="flex flex-col gap-16 pb-24 relative">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* பிரதான இதழ் விவரங்கள் (Main Issue Detail Hero) */}
      <section className="container mx-auto px-4 pt-8 md:pt-16 max-w-6xl">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center bg-card border rounded-[2.5rem] p-6 md:p-12 shadow-xl relative overflow-hidden">
          {/* Decorative gradients */}
          <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary/5 to-transparent pointer-events-none" />
          
          {/* அட்டைப்படம் (Left - Cover Image Column) */}
          <div className="md:col-span-5 flex justify-center">
            <div className="relative aspect-[3/4.2] w-full max-w-[320px] md:max-w-[360px] group">
              <div className="absolute inset-4 bg-primary/10 rounded-[2rem] blur-[30px] group-hover:bg-primary/20 transition-all duration-700" />
              <div className="relative h-full w-full rounded-[2rem] overflow-hidden border-8 border-background shadow-2xl transition-transform duration-700 group-hover:scale-105">
                <Image
                  src={issue.cover_image_url || '/placeholder-cover.jpg'}
                  alt={issue.title}
                  fill
                  priority
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* இதழ் தகவல்கள் (Right - Info & Download Column) */}
          <div className="md:col-span-7 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                <span>தொகுதி {issue.volume_number}, இதழ் {issue.issue_number}</span>
              </span>
              <span className="bg-green-100 text-green-800 text-[10px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-lg flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5" />
                <span>முழு இதழ் (இலவசம்)</span>
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-serif font-black text-foreground leading-tight tracking-tight">
              {issue.title}
            </h1>

            <p className="text-sm text-muted-foreground font-sans">
              வெளியிடப்பட்ட நாள்: {issue.published_at ? new Date(issue.published_at).toLocaleDateString('ta-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
            </p>

            <div className="border-t border-border pt-6 space-y-4">
              <h3 className="font-bold text-lg">விளக்கம் (Description)</h3>
              <p className="text-muted-foreground leading-relaxed font-serif text-lg">
                {issue.description || 'இந்த இதழுக்கான சிறப்பு விளக்கம் ஏதுமில்லை.'}
              </p>
            </div>

            <div className="pt-6 border-t border-border flex flex-col sm:flex-row gap-4 items-center">
              <DownloadPDFButton 
                issueSlug={issue.slug} 
                hasAccess={canAccessFull} 
                pdfAvailable={pdfAvailable} 
              />
              
              {!canAccessFull && (
                <p className="text-sm text-amber-700 dark:text-amber-500 font-semibold flex items-center gap-1.5">
                  <Crown className="w-4 h-4 shrink-0" />
                  <span>தற்போதைய இதழைப் படிக்க சந்தா (Pay ₹30) தேவை.</span>
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* பொருளடக்கம் (Table of Contents) - Accordion on mobile */}
      {contents && contents.length > 0 && (
        <section className="container mx-auto px-4 max-w-4xl">
          <details className="group border rounded-xl bg-card overflow-hidden animate-in fade-in" open>
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
      )}

      {/* கட்டுரைகள் (Articles) */}
      {contents && contents.length > 0 && (
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
      )}

      {/* Back to top button */}
      <a 
        href="#"
        className="fixed bottom-8 right-8 p-4 bg-primary text-primary-foreground rounded-full shadow-lg hover:bg-primary/90 transition-all z-50 hidden md:flex items-center justify-center"
        id="back-to-top"
        title="மீண்டும் மேலே (Back to top)"
      >
        <ArrowUp className="h-6 w-6" />
      </a>
    </div>
  );
}
