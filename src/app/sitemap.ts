import { MetadataRoute } from 'next';
import { createServerClient } from '@/lib/supabase/server';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createServerClient();
  const baseUrl = 'https://sattavilakku.com';

  // இதழ் இணைப்புகள் (Issue links)
  const { data: issues } = await supabase
    .from('issues')
    .select('slug, updated_at')
    .eq('status', 'published');

  const issueEntries: MetadataRoute.Sitemap = (issues || []).map((issue) => ({
    url: `${baseUrl}/issues/${issue.slug}`,
    lastModified: new Date(issue.updated_at),
    changeFrequency: 'monthly',
    priority: 0.8,
  }));

  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/issues`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/subscribe`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [...staticPages, ...issueEntries];
}
