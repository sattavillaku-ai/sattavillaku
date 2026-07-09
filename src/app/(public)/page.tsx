import Image from 'next/image';
import Link from 'next/link';
import { createAdminClient } from '@/lib/supabase/server';
import { IssueCard } from '@/components/magazine/IssueCard';
import { Metadata } from 'next';
import { BookOpen, Crown, ArrowRight, ShieldCheck, Zap, Globe, Scale } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'சட்டவிளக்கு — சட்டம், அரசியல் & சமூக விழிப்புணர்வு இணைய இதழ் | Sattavilakku',
  description: 'சட்டவிளக்கு (Sattavilakku) - சட்டம், சட்ட செய்திகள், சமகால அரசியல் மற்றும் சமூக விழிப்புணர்வுக்கான தமிழ் மாதாந்திர இணைய இதழ். நீதியின் குரலாக ஒலிக்கிறோம்.',
};

function getArticleImage(article: any, issueCoverUrl: string | null): string {
  // 1. Try to extract image from Tiptap body
  if (article.body) {
    let doc = article.body;
    if (typeof doc === 'string') {
      try {
        doc = JSON.parse(doc);
      } catch (e) {}
    }
    const findImageSrc = (node: any): string | null => {
      if (!node) return null;
      if (node.type === 'image' && node.attrs?.src) return node.attrs.src;
      if (Array.isArray(node.content)) {
        for (const child of node.content) {
          const src = findImageSrc(child);
          if (src) return src;
        }
      }
      return null;
    };
    const extracted = findImageSrc(doc);
    if (extracted) return extracted;
  }

  // 2. Use specific stock images for content types
  switch (article.content_type) {
    case 'editorial':
      return 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=600&auto=format&fit=crop&q=80';
    case 'article':
      return 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80';
    case 'poem':
      return 'https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?w=600&auto=format&fit=crop&q=80';
    case 'story':
      return 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=80';
    case 'interview':
      return 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80';
    default:
      return issueCoverUrl || 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80';
  }
}

export default async function HomePage() {
  const supabase = createAdminClient();

  const { data: issues } = await supabase
    .from('issues')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(7);

  const latestIssue = issues?.[0];
  const otherIssues = issues?.slice(1) || [];

  // Fetch issue content for latest issue to show them in partitions
  let latestArticles: any[] = [];
  if (latestIssue) {
    const { data: articles } = await supabase
      .from('issue_content')
      .select('*')
      .eq('issue_id', latestIssue.id)
      .order('position', { ascending: true });
    latestArticles = articles || [];
  }

  const centerArticle = latestArticles[0];
  const leftArticles = latestArticles.slice(1, 3);
  const rightArticles = latestArticles.slice(3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    'name': 'சட்டவிளக்கு (Sattavilakku)',
    'url': 'https://sattavilakku.com',
    'description': 'செய்தி, அரசியல் மற்றும் சட்ட விழிப்புணர்வுக்கான தமிழ் இணைய இதழ்.',
    'publisher': {
      '@type': 'NewsMediaOrganization',
      'name': 'சட்டவிளக்கு',
      'alternateName': 'Sattavilakku',
      'url': 'https://sattavilakku.com',
      'logo': {
        '@type': 'ImageObject',
        'url': 'https://sattavilakku.com/images/sattavillaku-logo.jpeg'
      }
    }
  };

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 md:pb-32 overflow-hidden">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      {/* 1. பிரதான நக்கீரன் பாணி ஹீரோ பகுதி (Premium 3-Column Hero Section) */}
      {latestIssue && (
        <section className="container mx-auto px-4 md:px-6 pt-24 md:pt-28 pb-12 border-b border-border">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">
            
            {/* இடது பகுதி: துணை கட்டுரைகள் (Left Column: Secondary Articles - 3/12 width) */}
            <div className="lg:col-span-3 order-2 lg:order-1 space-y-6">
              <div className="border-b border-primary/20 pb-3">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">முக்கியக் கட்டுரைகள் (Featured)</span>
              </div>
              
              <div className="space-y-6">
                {leftArticles.map((article) => {
                  const imageSrc = getArticleImage(article, latestIssue.cover_image_url);
                  return (
                    <div key={article.id} className="group flex flex-col gap-3 p-3 border border-border/50 rounded-2xl bg-card hover:border-primary/30 hover:shadow-lg transition-all duration-300">
                      <Link href={`/issues/${latestIssue.slug}#article-${article.id}`} className="relative aspect-[16/10] w-full rounded-xl overflow-hidden block">
                        <img
                          src={imageSrc}
                          alt={article.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-2 left-2 bg-secondary/80 backdrop-blur-md text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded">
                          {article.content_type}
                        </div>
                      </Link>
                      <div className="space-y-1 px-1">
                        <Link href={`/issues/${latestIssue.slug}#article-${article.id}`}>
                          <h4 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                            {article.title}
                          </h4>
                        </Link>
                        <p className="text-[10px] text-muted-foreground font-sans">
                          {article.author_name || 'ஆசிரியர் குழு'}
                        </p>
                      </div>
                    </div>
                  );
                })}
                {leftArticles.length === 0 && (
                  <p className="text-sm text-muted-foreground italic">துணைக் கட்டுரைகள் ஏதுமில்லை.</p>
                )}
              </div>
            </div>

            {/* நடுப்பகுதி: முதன்மைச் செய்தி (Center Column: Main Spotlight Article - 6/12 width) */}
            <div className="lg:col-span-6 order-1 lg:order-2 space-y-6">
              {centerArticle ? (() => {
                const imageSrc = getArticleImage(centerArticle, latestIssue.cover_image_url);
                return (
                  <div className="group flex flex-col h-full bg-card rounded-3xl overflow-hidden border border-border hover:shadow-2xl transition-all duration-500">
                    <Link href={`/issues/${latestIssue.slug}#article-${centerArticle.id}`} className="relative aspect-[16/9.5] w-full overflow-hidden block">
                      <img
                        src={imageSrc}
                        alt={centerArticle.title}
                        className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-4 left-4 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-2 rounded-xl shadow-lg">
                        முதன்மைச் செய்தி • {centerArticle.content_type}
                      </div>
                    </Link>
                    <div className="p-6 md:p-8 flex-grow flex flex-col justify-between space-y-4">
                      <div className="space-y-3">
                        <Link href={`/issues/${latestIssue.slug}#article-${centerArticle.id}`}>
                          <h3 className="text-2xl md:text-4xl font-serif font-black text-foreground group-hover:text-primary transition-colors leading-tight tracking-tight">
                            {centerArticle.title}
                          </h3>
                        </Link>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="font-bold text-foreground">{centerArticle.author_name || 'ஆசிரியர் குழு'}</span>
                          <span>•</span>
                          <span>{latestIssue.published_at ? new Date(latestIssue.published_at).toLocaleDateString('ta-IN', { month: 'long', year: 'numeric' }) : ''}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm md:text-base text-muted-foreground font-serif line-clamp-3 leading-relaxed">
                        {typeof centerArticle.body === 'object' && centerArticle.body?.content?.[0]?.content?.[0]?.text
                          ? centerArticle.body.content[0].content[0].text
                          : 'கட்டுரையை முழுமையாக வாசிக்க சொடுக்கவும்...'}
                      </p>
                      
                      <div className="pt-2">
                        <Link
                          href={`/issues/${latestIssue.slug}#article-${centerArticle.id}`}
                          className="inline-flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider hover:shadow-lg transition-all"
                        >
                          முழுமையாக வாசிக்க
                          <ArrowRight size={14} />
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })() : (
                <div className="flex items-center justify-center h-64 border rounded-3xl bg-muted/20">
                  <p className="text-muted-foreground">கட்டுரைகள் ஏதுமில்லை.</p>
                </div>
              )}
            </div>

            {/* வலது பகுதி: தற்போதைய இதழ் அட்டைப்படம் & சந்தா (Right Column: Issue Showcase & Actions - 3/12 width) */}
            <div className="lg:col-span-3 order-3 lg:order-3 space-y-6">
              <div className="border-b border-primary/20 pb-3">
                <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">புதிய இதழ் (Current Issue)</span>
              </div>
              
              <div className="bg-muted/40 border border-border/60 rounded-3xl p-5 text-center space-y-5">
                <Link href={`/issues/${latestIssue.slug}`} className="relative aspect-[3/4.2] w-full max-w-[180px] mx-auto rounded-2xl overflow-hidden border-4 border-background shadow-lg block hover:scale-105 transition-transform duration-500">
                  <Image
                    src={latestIssue.cover_image_url || '/placeholder-cover.jpg'}
                    alt={latestIssue.title}
                    fill
                    className="object-cover"
                  />
                </Link>
                
                <div className="space-y-1">
                  <h4 className="font-serif font-black text-lg text-foreground line-clamp-2 leading-tight">
                    {latestIssue.title}
                  </h4>
                  <p className="text-[10px] text-muted-foreground font-sans uppercase tracking-wider">
                    தொகுதி {latestIssue.volume_number} • இதழ் {latestIssue.issue_number}
                  </p>
                </div>

                <p className="text-xs text-muted-foreground font-serif line-clamp-3 leading-relaxed">
                  {latestIssue.description}
                </p>

                <div className="pt-2 flex flex-col gap-3">
                  <Link
                    href={`/issues/${latestIssue.slug}`}
                    className="flex items-center justify-center gap-2 bg-foreground text-background py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-foreground/90 transition-all"
                  >
                    இதழைக் காண்க
                    <BookOpen size={12} />
                  </Link>
                  <Link
                    href="/subscribe"
                    className="flex items-center justify-center gap-2 bg-primary text-white py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-primary/95 transition-all shadow-md shadow-primary/10"
                  >
                    சந்தா செலுத்தவும்
                    <Crown size={12} />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </section>
      )}

      {/* 2. இதழின் இதர கட்டுரைகள் (Secondary articles below the hero) */}
      {latestIssue && rightArticles.length > 0 && (
        <section className="container mx-auto px-4 md:px-6 py-8">
          <div className="border-b pb-4 mb-8">
            <h3 className="text-xl font-serif font-black text-foreground uppercase tracking-tight">இதர சுவாரசியமான கட்டுரைகள்</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rightArticles.map((article) => {
              const imageSrc = getArticleImage(article, latestIssue.cover_image_url);
              return (
                <div key={article.id} className="group border border-border/40 rounded-2xl overflow-hidden bg-card hover:shadow-lg transition-all duration-300 flex flex-col h-full justify-between">
                  <div>
                    <Link href={`/issues/${latestIssue.slug}#article-${article.id}`} className="relative aspect-[16/10] w-full overflow-hidden block">
                      <img
                        src={imageSrc}
                        alt={article.title}
                        className="object-cover w-full h-full group-hover:scale-102 transition-transform duration-500"
                      />
                      <div className="absolute top-2 left-2 bg-primary/90 text-white text-[8px] font-black uppercase tracking-wider px-2 py-1 rounded">
                        {article.content_type}
                      </div>
                    </Link>
                    <div className="p-4 space-y-2">
                      <Link href={`/issues/${latestIssue.slug}#article-${article.id}`}>
                        <h4 className="font-serif font-bold text-base text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                          {article.title}
                        </h4>
                      </Link>
                      <p className="text-[10px] text-muted-foreground font-sans">
                        {article.author_name || 'ஆசிரியர் குழு'}
                      </p>
                    </div>
                  </div>
                  <div className="p-4 pt-0">
                    <Link
                      href={`/issues/${latestIssue.slug}#article-${article.id}`}
                      className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-primary group/btn"
                    >
                      வாசிக்க
                      <ArrowRight size={10} className="group-hover/btn:translate-x-0.5 transition-transform" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 2. சமீபத்திய இதழ்கள் (Recent Issues Grid) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-16">
          <div className="space-y-2 md:space-y-4 text-center sm:text-left">
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-primary">இதழ் காப்பகம்</h2>
            <h3 className="text-3xl sm:text-4xl md:text-6xl font-serif font-black text-foreground tracking-tighter">கடந்த கால பதிப்புகள்</h3>
          </div>
          <Link href="/issues" className="flex items-center justify-center sm:justify-end gap-2 md:gap-3 font-black text-xs md:text-sm uppercase tracking-widest text-foreground hover:text-primary transition-colors group">
            அனைத்து இதழ்களையும் காண்க
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-foreground/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
              <ArrowRight size={16} className="md:w-[18px] md:h-[18px]" />
            </div>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
          {otherIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* 3. தனித்துவம் (Unique Features) */}
      <section className="bg-muted/50 py-16 md:py-24 border-y border-border relative overflow-hidden">
         <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
            {[
              { icon: ShieldCheck, title: 'உறுதிப்படுத்தப்பட்ட செய்தி', desc: 'ஒவ்வொரு செய்தியும் சட்ட வல்லுநர்களால் சரிபார்க்கப்பட்ட பின்னரே வெளியிடப்படுகிறது.' },
              { icon: Zap, title: 'உடனடி அணுகல்', desc: 'சந்தாதாரர்கள் புதிய இதழ்களை வெளியான சில நிமிடங்களில் டிஜிட்டல் வடிவில் வாசிக்கலாம்.' },
              { icon: Globe, title: 'எங்கும் எப்போதும்', desc: 'மொபைல், டேப்லெட் அல்லது கணினி என எதில் வேண்டுமானாலும் தடையின்றி வாசியுங்கள்.' }
            ].map((feature, i) => (
              <div key={i} className="space-y-4 md:space-y-6 group text-center md:text-left flex flex-col items-center md:items-start">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-card rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all shadow-xl shadow-primary/5">
                  <feature.icon size={28} className="md:w-8 md:h-8" />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-foreground">{feature.title}</h4>
                <p className="text-sm md:text-base text-muted-foreground font-medium leading-relaxed max-w-sm">{feature.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 5. சந்தா அழைப்பு (Subscription CTA) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="bg-secondary rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-primary/10 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-primary/10 rounded-full blur-[50px] md:blur-[80px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 space-y-6 md:space-y-10 max-w-4xl mx-auto">
            <Crown size={48} className="md:w-16 md:h-16 text-primary mx-auto mb-4 md:mb-8 animate-bounce" />
            <h2 className="text-3xl sm:text-4xl md:text-7xl font-serif font-black leading-tight tracking-tighter">
              நீதியின் குரலாக <br className="hidden sm:block" /> <span className="text-primary">எங்களுடன் இணையுங்கள்</span>
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-white/60 font-medium leading-relaxed px-2">
              மாதம் வெறும் ₹30-க்கு தமிழகத்தின் மிகச்சிறந்த சட்டக் கட்டுரைகள் மற்றும் அரசியல் அலசல்களை உங்கள் விரல் நுனியில் பெற்றிடுங்கள்.
            </p>
            <div className="pt-4 md:pt-6">
              <Link
                href="/subscribe"
                className="bg-primary text-white px-8 md:px-16 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-2xl hover:shadow-[0_20px_60px_-10px_rgba(220,38,38,0.6)] transition-all hover:scale-105 active:scale-95 inline-block w-full sm:w-auto"
              >
                இப்போதே சந்தா செலுத்துக
              </Link>
            </div>
            <div className="flex items-center justify-center gap-6 md:gap-8 pt-8 md:pt-10 opacity-40 grayscale group-hover:grayscale-0 transition-all">
               <Scale size={24} className="md:w-8 md:h-8" />
               <BookOpen size={24} className="md:w-8 md:h-8" />
               <Zap size={24} className="md:w-8 md:h-8" />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
