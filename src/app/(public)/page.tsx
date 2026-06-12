import Image from 'next/image';
import Link from 'next/link';
import { createServerClient } from '@/lib/supabase/server';
import { IssueCard } from '@/components/magazine/IssueCard';

import { Metadata } from 'next';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'சட்டவிளக்கு — சட்டமும் சமூகமும் | முகப்பு',
  description: 'சட்டம், அரசியல் மற்றும் சமூக நீதி குறித்த ஆழமான புரிதலை ஏற்படுத்தும் நோக்கில் தொடங்கப்பட்ட தமிழ் இணைய இதழ்.',
};

export default async function HomePage() {
  const supabase = createServerClient();

  // சமீபத்திய வெளியிடப்பட்ட இதழ்களைப் பெறவும் (Get latest published issues)
  const { data: issues } = await supabase
    .from('issues')
    .select('*')
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(7);

  const latestIssue = issues?.[0];
  const otherIssues = issues?.slice(1) || [];

  return (
    <div className="flex flex-col gap-12 pb-12">
      {/* ஹீரோ பகுதி (Hero Section) */}
      {latestIssue && (
        <section className="relative w-full h-[70vh] flex items-center justify-center overflow-hidden">
          <Image
            src={latestIssue.cover_image_url || '/placeholder-cover.jpg'}
            alt={latestIssue.title}
            fill
            priority
            className="object-cover brightness-50"
          />
          <div className="container relative z-10 px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl font-bold font-serif mb-4 leading-tight">
              {latestIssue.title}
            </h1>
            <p className="text-lg md:text-xl max-w-2xl mx-auto mb-8 text-gray-200">
              {latestIssue.description}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href={`/issues/${latestIssue.slug}`}
                className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 rounded-full font-bold text-lg transition-all"
              >
                இலவசமாக படிக்க (Read Free)
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* சமீபத்திய இதழ்கள் (Recent Issues) */}
      <section className="container mx-auto px-4">
        <h2 className="text-3xl font-bold font-serif mb-8 border-b pb-2">சமீபத்திய இதழ்கள் (Recent Issues)</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {otherIssues.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* சந்தா பேனர் (Subscription Banner) */}
      <section className="container mx-auto px-4">
        <div className="bg-primary/10 border-2 border-primary/20 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold font-serif text-primary mb-4">
            முழுமையான வாசிப்பு அனுபவம்
          </h2>
          <p className="text-xl mb-8">
            மாதம் <span className="font-bold text-2xl">₹30</span>-க்கு அனைத்தையும் படிங்க
          </p>
          <Link
            href="/subscribe"
            className="bg-primary text-primary-foreground px-10 py-4 rounded-full font-bold text-xl hover:scale-105 transition-transform inline-block"
          >
            இப்போதே சந்தா பெறு (Subscribe Now)
          </Link>
        </div>
      </section>
    </div>
  );
}
