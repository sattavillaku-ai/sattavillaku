import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { IssueCard } from '@/components/magazine/IssueCard';
import { Metadata } from 'next';
import { BookOpen, Crown, ArrowRight, ShieldCheck, Zap, Globe, Scale } from 'lucide-react';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'சட்டவிளக்கு — தமிழகத்தின் உன்னத தமிழ் இதழ்',
  description: 'சட்டம், அரசியல் மற்றும் சமூக விழிப்புணர்வுக்கான தமிழ் இணைய இதழ். நீதியின் குரலாக ஒலிக்கிறோம்.',
};

export default async function HomePage() {
  const supabase = createServerClient();

  const { data: issues } = await supabase
    .from('issues')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(7);

  const latestIssue = issues?.[0];
  const otherIssues = issues?.slice(1) || [];

  return (
    <div className="flex flex-col gap-16 md:gap-24 pb-20 md:pb-32 overflow-hidden">
      {/* 1. பிரீமியம் ஹீரோ பகுதி (Premium Hero Section) */}
      {latestIssue && (
        <section className="relative w-full min-h-[100svh] md:min-h-[85vh] flex items-center pt-16 md:pt-20 bg-navy">
          {/* Background Elements */}
          <div className="absolute top-0 right-0 w-full md:w-1/2 h-full bg-gradient-to-b md:bg-gradient-to-l from-secondary/10 to-transparent pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-64 md:w-96 h-64 md:h-96 bg-accent/20 rounded-full blur-[80px] md:blur-[120px] pointer-events-none" />
          
          <div className="container mx-auto px-4 md:px-6 relative z-10 py-10 md:py-0">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 md:gap-16 items-center">
              {/* Text Content */}
              <div className="lg:col-span-7 space-y-6 md:space-y-10">
                <div className="inline-flex items-center gap-2 md:gap-3 bg-white/5 border border-white/10 px-3 md:px-4 py-1.5 md:py-2 rounded-full backdrop-blur-xl">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-secondary rounded-full animate-pulse" />
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-[0.2em] md:tracking-[0.3em] text-secondary">இந்த மாத இதழ் வெளியீடு</span>
                </div>

                <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-8xl font-serif font-black text-white leading-[1.1] tracking-tighter">
                  {latestIssue.title}
                </h1>

                <p className="text-base sm:text-lg md:text-2xl text-white/60 font-medium max-w-2xl leading-relaxed italic border-l-2 md:border-l-4 border-secondary pl-4 md:pl-6">
                  {latestIssue.description}
                </p>

                <div className="flex flex-col sm:flex-row gap-4 md:gap-6 pt-2 md:pt-4">
                  <Link
                    href={`/issues/${latestIssue.slug}`}
                    className="group flex items-center justify-center sm:justify-start gap-3 md:gap-4 bg-secondary text-primary px-6 md:px-10 py-4 md:py-5 rounded-[1rem] md:rounded-[1.5rem] font-black text-base md:text-lg transition-all hover:shadow-[0_20px_50px_-10px_rgba(201,168,76,0.4)] hover:scale-105 active:scale-95"
                  >
                    இப்போதே படிக்க
                    <ArrowRight className="group-hover:translate-x-2 transition-transform" />
                  </Link>
                  <Link
                    href="/subscribe"
                    className="flex items-center justify-center sm:justify-start gap-3 bg-white/5 border border-white/20 text-white px-6 md:px-10 py-4 md:py-5 rounded-[1rem] md:rounded-[1.5rem] font-black text-base md:text-lg hover:bg-white/10 transition-all backdrop-blur-sm"
                  >
                    <Crown className="text-secondary" />
                    சந்தா பெற
                  </Link>
                </div>
                
                <div className="flex flex-wrap items-center gap-6 md:gap-10 pt-8 md:pt-12 border-t border-white/5">
                   <div className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-black text-white">12k+</span>
                      <span className="text-[9px] md:text-[10px] uppercase font-bold text-white/40 tracking-widest">வாசகர்கள்</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-black text-white">500+</span>
                      <span className="text-[9px] md:text-[10px] uppercase font-bold text-white/40 tracking-widest">கட்டுரைகள்</span>
                   </div>
                   <div className="flex flex-col">
                      <span className="text-2xl md:text-3xl font-black text-white">100%</span>
                      <span className="text-[9px] md:text-[10px] uppercase font-bold text-white/40 tracking-widest">உண்மைத் தகவல்</span>
                   </div>
                </div>
              </div>

              {/* Visual Content (Book Preview) - Shown on all screens now but optimized */}
              <div className="lg:col-span-5 relative mt-8 lg:mt-0">
                 <div className="relative aspect-[3/4.2] w-full max-w-[280px] sm:max-w-[350px] md:max-w-[450px] mx-auto group">
                    {/* Shadow Decor */}
                    <div className="absolute inset-4 bg-secondary/20 rounded-[2rem] md:rounded-[3rem] blur-[40px] md:blur-[60px] -z-10 group-hover:bg-secondary/40 transition-all duration-700" />
                    
                    <div className="relative h-full w-full rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border-[6px] md:border-[12px] border-white/5 shadow-2xl shadow-black/50 transition-transform duration-700 group-hover:rotate-2 group-hover:scale-105">
                       <Image
                        src={latestIssue.cover_image_url || '/placeholder-cover.jpg'}
                        alt={latestIssue.title}
                        fill
                        priority
                        className="object-cover"
                      />
                      {/* Gloss Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. சமீபத்திய இதழ்கள் (Recent Issues Grid) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 md:gap-8 mb-10 md:mb-16">
          <div className="space-y-2 md:space-y-4 text-center sm:text-left">
            <h2 className="text-xs md:text-sm font-black uppercase tracking-[0.3em] md:tracking-[0.4em] text-secondary">இதழ் காப்பகம்</h2>
            <h3 className="text-3xl sm:text-4xl md:text-6xl font-serif font-black text-primary tracking-tighter">கடந்த கால பதிப்புகள்</h3>
          </div>
          <Link href="/issues" className="flex items-center justify-center sm:justify-end gap-2 md:gap-3 font-black text-xs md:text-sm uppercase tracking-widest text-primary hover:text-secondary transition-colors group">
            அனைத்து இதழ்களையும் காண்க
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full border border-primary/10 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
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
      <section className="bg-white py-16 md:py-24 border-y border-slate-100 relative overflow-hidden">
         <div className="container mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-10 md:gap-16">
            {[
              { icon: ShieldCheck, title: 'உறுதிப்படுத்தப்பட்ட செய்தி', desc: 'ஒவ்வொரு செய்தியும் சட்ட வல்லுநர்களால் சரிபார்க்கப்பட்ட பின்னரே வெளியிடப்படுகிறது.' },
              { icon: Zap, title: 'உடனடி அணுகல்', desc: 'சந்தாதாரர்கள் புதிய இதழ்களை வெளியான சில நிமிடங்களில் டிஜிட்டல் வடிவில் வாசிக்கலாம்.' },
              { icon: Globe, title: 'எங்கும் எப்போதும்', desc: 'மொபைல், டேப்லெட் அல்லது கணினி என எதில் வேண்டுமானாலும் தடையின்றி வாசியுங்கள்.' }
            ].map((feature, i) => (
              <div key={i} className="space-y-4 md:space-y-6 group text-center md:text-left flex flex-col items-center md:items-start">
                <div className="w-14 h-14 md:w-16 md:h-16 bg-cream rounded-2xl flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-secondary transition-all shadow-xl shadow-primary/5">
                  <feature.icon size={28} className="md:w-8 md:h-8" />
                </div>
                <h4 className="text-xl md:text-2xl font-black text-primary">{feature.title}</h4>
                <p className="text-sm md:text-base text-slate-500 font-medium leading-relaxed max-w-sm">{feature.desc}</p>
              </div>
            ))}
         </div>
      </section>

      {/* 4. சந்தா அழைப்பு (Subscription CTA) */}
      <section className="container mx-auto px-4 md:px-6">
        <div className="bg-primary rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-24 text-center text-white relative overflow-hidden shadow-2xl">
          {/* Decor */}
          <div className="absolute top-0 right-0 w-64 md:w-96 h-64 md:h-96 bg-secondary/10 rounded-full blur-[60px] md:blur-[100px] -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 md:w-64 h-48 md:h-64 bg-accent/10 rounded-full blur-[50px] md:blur-[80px] translate-y-1/2 -translate-x-1/2" />

          <div className="relative z-10 space-y-6 md:space-y-10 max-w-4xl mx-auto">
            <Crown size={48} className="md:w-16 md:h-16 text-secondary mx-auto mb-4 md:mb-8 animate-bounce" />
            <h2 className="text-3xl sm:text-4xl md:text-7xl font-serif font-black leading-tight tracking-tighter">
              நீதியின் குரலாக <br className="hidden sm:block" /> <span className="text-secondary">எங்களுடன் இணையுங்கள்</span>
            </h2>
            <p className="text-base sm:text-lg md:text-2xl text-white/60 font-medium leading-relaxed px-2">
              மாதம் வெறும் ₹30-க்கு தமிழகத்தின் மிகச்சிறந்த சட்டக் கட்டுரைகள் மற்றும் அரசியல் அலசல்களை உங்கள் விரல் நுனியில் பெற்றிடுங்கள்.
            </p>
            <div className="pt-4 md:pt-6">
              <Link
                href="/subscribe"
                className="bg-secondary text-primary px-8 md:px-16 py-4 md:py-6 rounded-[1.5rem] md:rounded-[2rem] font-black text-lg md:text-2xl hover:shadow-[0_20px_60px_-10px_rgba(201,168,76,0.6)] transition-all hover:scale-105 active:scale-95 inline-block w-full sm:w-auto"
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
