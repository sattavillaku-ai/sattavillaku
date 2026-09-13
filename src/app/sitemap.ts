import { MetadataRoute } from 'next';
import { createClient } from '@supabase/supabase-js';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://sattavilakku.com';
  const now = new Date();

  // Static core routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${siteUrl}`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 1.0,
    },
    {
      url: `${siteUrl}/articles`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/magazine`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/magazine/current`,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/magazine/archive`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${siteUrl}/archive`,
      lastModified: now,
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${siteUrl}/news`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.95,
    },
    {
      url: `${siteUrl}/news/law`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.9,
    },
    {
      url: `${siteUrl}/news/politics`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/news/tamil-nadu`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/news/india`,
      lastModified: now,
      changeFrequency: 'hourly',
      priority: 0.85,
    },
    {
      url: `${siteUrl}/about`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${siteUrl}/contact`,
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];

  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      return staticRoutes;
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // 1. Published Articles
    const { data: articles } = await supabase
      .from('articles')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(500);

    const articleRoutes: MetadataRoute.Sitemap = (articles || []).map((art) => ({
      url: `${siteUrl}/articles/${art.slug}`,
      lastModified: art.updated_at ? new Date(art.updated_at) : art.published_at ? new Date(art.published_at) : now,
      changeFrequency: 'weekly',
      priority: 0.8,
    }));

    // 2. Published Issues
    const { data: issues } = await supabase
      .from('issues')
      .select('slug, updated_at, published_at')
      .eq('status', 'published')
      .order('published_at', { ascending: false })
      .limit(100);

    const issueRoutes: MetadataRoute.Sitemap = (issues || []).map((issue) => ({
      url: `${siteUrl}/magazine/${issue.slug}`,
      lastModified: issue.updated_at ? new Date(issue.updated_at) : issue.published_at ? new Date(issue.published_at) : now,
      changeFrequency: 'monthly',
      priority: 0.8,
    }));

    return [...staticRoutes, ...articleRoutes, ...issueRoutes];
  } catch (err) {
    console.warn('Could not generate dynamic sitemap entries, returning static:', err);
    return staticRoutes;
  }
}
