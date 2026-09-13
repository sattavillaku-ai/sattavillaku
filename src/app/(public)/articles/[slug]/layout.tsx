import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { stripHtmlToText } from '@/lib/sanitize';

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
    const { data: article } = await supabase
      .from('articles')
      .select('title, excerpt, content, hero_image_url, published_at, updated_at, authors(name), categories(name, slug)')
      .eq('slug', slug)
      .maybeSingle();

    if (article) {
      const title = `${article.title} | சட்டவிளக்கு`;
      const description = article.excerpt || stripHtmlToText(article.content).slice(0, 160);
      const imageUrl = article.hero_image_url || `${siteUrl}/logo.jpg`;
      const authorName = (article.authors as any)?.name || 'சட்டவிளக்கு ஆசிரியர் குழு';

      return {
        title,
        description,
        alternates: {
          canonical: `${siteUrl}/articles/${slug}`,
        },
        openGraph: {
          type: 'article',
          locale: 'ta_IN',
          url: `${siteUrl}/articles/${slug}`,
          title,
          description,
          siteName: 'சட்டவிளக்கு (Sattavilakku)',
          publishedTime: article.published_at || undefined,
          modifiedTime: article.updated_at || undefined,
          authors: [authorName],
          images: [
            {
              url: imageUrl,
              width: 1200,
              height: 630,
              alt: article.title,
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
    console.warn('Could not generate dynamic article metadata:', e);
  }

  return {
    title: 'கட்டுரை | சட்டவிளக்கு (Sattavilakku)',
    description: 'சட்டவிளக்கு ஆய்வுக் கட்டுரை மற்றும் பகுப்பாய்வு.',
  };
}

export default async function ArticleLayout({ params, children }: Props) {
  const { slug } = await params;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sattavilakku.com';
  let jsonLd = null;
  let breadcrumbsLd = null;

  try {
    const supabase = await createClient();
    const { data: article } = await supabase
      .from('articles')
      .select('title, excerpt, content, hero_image_url, published_at, updated_at, authors(name), categories(name, slug)')
      .eq('slug', slug)
      .maybeSingle();

    if (article) {
      const authorName = (article.authors as any)?.name || 'சட்டவிளக்கு ஆசிரியர் குழு';
      const categoryName = (article.categories as any)?.name || 'சட்டம்';
      const categorySlug = (article.categories as any)?.slug || 'law';

      jsonLd = {
        '@context': 'https://schema.org',
        '@type': 'NewsArticle',
        headline: article.title,
        description: article.excerpt || stripHtmlToText(article.content).slice(0, 160),
        image: [article.hero_image_url || `${siteUrl}/logo.jpg`],
        datePublished: article.published_at || new Date().toISOString(),
        dateModified: article.updated_at || article.published_at || new Date().toISOString(),
        author: [
          {
            '@type': 'Person',
            name: authorName,
          },
        ],
        publisher: {
          '@type': 'Organization',
          name: 'சட்டவிளக்கு',
          logo: {
            '@type': 'ImageObject',
            url: `${siteUrl}/logo.jpg`,
          },
        },
        mainEntityOfPage: {
          '@type': 'WebPage',
          '@id': `${siteUrl}/articles/${slug}`,
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
            name: 'கட்டுரைகள்',
            item: `${siteUrl}/articles`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: categoryName,
            item: `${siteUrl}/articles/${categorySlug}`,
          },
          {
            '@type': 'ListItem',
            position: 4,
            name: article.title,
            item: `${siteUrl}/articles/${slug}`,
          },
        ],
      };
    }
  } catch {
    // Continue without structured data on error
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
