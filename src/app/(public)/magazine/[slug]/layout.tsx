import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';

interface Props {
  params: Promise<{ slug: string }>;
  children: React.ReactNode;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sattavilakku.com';

  try {
    const supabase = await createClient();
    const { data: issue } = await supabase
      .from('issues')
      .select('title, description, cover_image_url, issue_number, volume_number, month, year, published_at, updated_at')
      .eq('slug', slug)
      .maybeSingle();

    if (issue) {
      const title = `${issue.title} (இதழ் ${issue.issue_number}) | சட்டவிளக்கு மாத இதழ்`;
      const description =
        issue.description ||
        `சட்டவிளக்கு ${issue.month || ''} ${issue.year || ''} மாத இதழ் - சட்டம், அரசியல் ஆய்வுக் கட்டுரைகள்.`;
      const imageUrl = issue.cover_image_url || `${siteUrl}/logo.jpg`;

      return {
        title,
        description,
        alternates: {
          canonical: `${siteUrl}/magazine/${slug}`,
        },
        openGraph: {
          type: 'book',
          locale: 'ta_IN',
          url: `${siteUrl}/magazine/${slug}`,
          title,
          description,
          siteName: 'சட்டவிளக்கு (Sattavilakku)',
          images: [
            {
              url: imageUrl,
              width: 800,
              height: 1100,
              alt: issue.title,
            },
          ],
        },
        twitter: {
          card: 'summary_large_image',
          title,
          description,
          images: [imageUrl],
        },
      };
    }
  } catch (e) {
    console.warn('Could not generate dynamic magazine metadata:', e);
  }

  return {
    title: 'மாத இதழ் | சட்டவிளக்கு (Sattavilakku)',
    description: 'சட்டவிளக்கு டிஜிட்டல் மாத இதழ் மற்றும் சட்டக் கட்டுரைகள்.',
  };
}

export default async function MagazineIssueLayout({ params, children }: Props) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sattavilakku.com';
  let jsonLd = null;
  let breadcrumbsLd = null;

  try {
    const supabase = await createClient();
    const { data: issue } = await supabase
      .from('issues')
      .select('title, description, cover_image_url, issue_number, volume_number, month, year, published_at')
      .eq('slug', slug)
      .maybeSingle();

    if (issue) {
      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'PublicationIssue',
        name: issue.title,
        issueNumber: issue.issue_number?.toString(),
        volumeNumber: issue.volume_number?.toString(),
        description: issue.description || 'சட்டவிளக்கு மாத இதழ்',
        image: issue.cover_image_url || `${siteUrl}/logo.jpg`,
        datePublished: issue.published_at || new Date().toISOString(),
        isPartOf: {
          '@type': 'Periodical',
          name: 'சட்டவிளக்கு',
          issn: 'RNI No. TN/2026/01',
        },
      };

      breadcrumbsLd = {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'முகப்பு',
            item: siteUrl,
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'இதழ்கள்',
            item: `${siteUrl}/magazine`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: issue.title,
            item: `${siteUrl}/magazine/${slug}`,
          },
        ],
      };
    }
  } catch {
    // Continue without structured data
  }

  return (
    <>
      {jsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      {breadcrumbsLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsLd) }}
        />
      )}
      {children}
    </>
  );
}
