import Parser from 'rss-parser';
import crypto from 'crypto';
import { SupabaseClient } from '@supabase/supabase-js';
import { NewsSource, NewsItem, NewsCollectionResult } from '@/types';

// Initialize RSS Parser with custom User-Agent and timeout
const rssParser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (compatible; SattavilakkuNewsCollector/1.0; +https://sattavilakku.com)',
    Accept: 'application/rss+xml, application/xml, text/xml, application/atom+xml, */*',
  },
  timeout: 10000,
});

/* =========================================================
   1. URL NORMALIZATION & DEDUPLICATION HASH
   ========================================================= */

const TRACKING_PARAMS = new Set([
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_term',
  'utm_content',
  'fbclid',
  'gclid',
  'ref',
  'ocid',
  '_ga',
  'mc_cid',
  'mc_eid',
  'cmpid',
  'origin',
  'ved',
  'usg',
]);

export function normalizeUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl.trim());

    // Normalize protocol to https if feasible
    if (parsed.protocol === 'http:') {
      parsed.protocol = 'https:';
    }

    // Remove tracking query parameters
    const keysToDelete: string[] = [];
    parsed.searchParams.forEach((_, key) => {
      if (TRACKING_PARAMS.has(key.toLowerCase()) || key.startsWith('utm_')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach((k) => parsed.searchParams.delete(k));

    // Remove hash/fragment
    parsed.hash = '';

    // Remove trailing slash from pathname if path length > 1
    if (parsed.pathname.length > 1 && parsed.pathname.endsWith('/')) {
      parsed.pathname = parsed.pathname.slice(0, -1);
    }

    return parsed.toString();
  } catch {
    // Fallback: simple string cleanup
    return rawUrl.trim().split('#')[0].replace(/\?utm_.*$/, '');
  }
}

export function generateDuplicateHash(sourceName: string, title: string, url: string): string {
  const normSource = sourceName.toLowerCase().trim();
  const normTitle = title
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .replace(/\s+/g, ' ');
  const normUrl = normalizeUrl(url);

  return crypto
    .createHash('sha256')
    .update(`${normSource}|${normTitle}|${normUrl}`)
    .digest('hex');
}

/* =========================================================
   2. TEXT & CONTENT CLEANUP
   ========================================================= */

export function sanitizeHtmlText(html?: string | null): string {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/* =========================================================
   3. RELEVANCE SCORING & CATEGORY CLASSIFICATION
   ========================================================= */

// Editorial Keyword Banks
const LAW_KEYWORDS = [
  'supreme court',
  'high court',
  'chief justice',
  'madras high court',
  'bench',
  'judgement',
  'judgment',
  'ruling',
  'verdict',
  'petition',
  'writ',
  'pil',
  'bail',
  'fir',
  'advocate',
  'bar council',
  'constitution',
  'constitutional',
  'article 32',
  'article 226',
  'ipc',
  'bns',
  'bnss',
  'crpc',
  'statute',
  'ordinance',
  'tribunal',
  'quash',
  'stay order',
  'contempt',
  'magistrate',
  'session court',
  'judicial',
  'attorney general',
  'solicitor general',
  'ed custody',
  'cbi court',
  'posh',
  'pocso',
  'uapa',
  'sedition',
  'defamation case',
  'legal notice',
  'legal aid',
  'lawyer',
  'prosecution',
  'conviction',
  'acquittal',
  'cbi',
  'enforcement directorate',
  'nia',
];

const TAMIL_NADU_KEYWORDS = [
  'tamil nadu',
  'chennai',
  'madurai',
  'coimbatore',
  'trichy',
  'salem',
  'stalin',
  'm.k. stalin',
  'edappadi',
  'eps',
  'dmk',
  'aiadmk',
  'tvk',
  'vijay',
  'pattali makkal katchi',
  'pmk',
  'bjp tamil nadu',
  'state assembly',
  'fort st. george',
  'cauvery',
  'tamil nadu government',
  'secretariat chennai',
  'madras hc',
  'r.n. ravi',
  'governor ravi',
  'namakkal',
  'vellore',
  'tirunelveli',
  'thanjavur',
  'thoothukudi',
  'tuticorin',
  'kanyakumari',
  'tnpsc',
  'kalaignar',
  'annamalai',
  'udhayanidhi',
  'tangedco',
  'tasmac',
  'periyar',
  'dharani',
];

const POLITICS_KEYWORDS = [
  'parliament',
  'lok sabha',
  'rajya sabha',
  'election commission',
  'eci',
  'prime minister',
  'narendra modi',
  'cabinet',
  'union government',
  'bill passed',
  'act',
  'president of india',
  'governor',
  'opposition',
  'nda',
  'india bloc',
  'congress',
  'rahul gandhi',
  'bjp',
  'assembly election',
  'by-election',
  'census',
  'delimitation',
  'political party',
  'manifesto',
  'floor test',
  'no-confidence',
  'privilege motion',
  'minister',
  'ministry',
  'poll',
  'voter',
  'constituency',
];

const INDIA_KEYWORDS = [
  'india',
  'national',
  'center',
  'centre',
  'delhi',
  'new delhi',
  'finance ministry',
  'home ministry',
  'defence ministry',
  'external affairs',
  'mea',
  'rbi',
  'isro',
  'railways',
  'supreme commander',
  'union territory',
];

const IRRELEVANT_KEYWORDS = [
  'cricket',
  'ipl',
  'bcci',
  'bollywood',
  'hollywood',
  'box office',
  'horoscope',
  'astrology',
  'zodiac',
  'recipe',
  'fashion week',
  'tech review',
  'smartphone launch',
  'cryptocurrency',
  'bitcoin',
  'football',
  'premier league',
  'nba',
  'celebrity dating',
  'movie review',
  'trailer release',
  'ott release',
  'weight loss',
  'beauty tips',
  'k-pop',
  'big boss',
  'bigg boss',
];

export interface RelevanceAnalysis {
  score: number;
  isRelevant: boolean;
  category: string;
  categorySlug: string;
  matchedKeywords: string[];
}

export function analyzeRelevanceAndCategory(
  title: string,
  content: string,
  sourceDefaultCategory?: string
): RelevanceAnalysis {
  const normTitle = title.toLowerCase();
  const normContent = content.toLowerCase();
  const combined = `${normTitle} ${normContent}`;

  let score = 25; // Base starting confidence
  const matchedKeywords: string[] = [];

  // 1. Negative Filter
  let negativeHits = 0;
  for (const kw of IRRELEVANT_KEYWORDS) {
    if (normTitle.includes(kw)) {
      negativeHits += 2;
      score -= 40;
    } else if (normContent.includes(kw)) {
      negativeHits += 1;
      score -= 20;
    }
  }

  // 2. Positive Keyword Matching with Title Weighting (2.5x)
  let lawScore = 0;
  let tnScore = 0;
  let polScore = 0;
  let indScore = 0;

  // Law
  for (const kw of LAW_KEYWORDS) {
    if (normTitle.includes(kw)) {
      lawScore += 25;
      score += 25;
      matchedKeywords.push(`law:${kw}`);
    } else if (normContent.includes(kw)) {
      lawScore += 10;
      score += 10;
    }
  }

  // Tamil Nadu
  for (const kw of TAMIL_NADU_KEYWORDS) {
    if (normTitle.includes(kw)) {
      tnScore += 25;
      score += 25;
      matchedKeywords.push(`tn:${kw}`);
    } else if (normContent.includes(kw)) {
      tnScore += 10;
      score += 10;
    }
  }

  // Politics
  for (const kw of POLITICS_KEYWORDS) {
    if (normTitle.includes(kw)) {
      polScore += 20;
      score += 20;
      matchedKeywords.push(`pol:${kw}`);
    } else if (normContent.includes(kw)) {
      polScore += 8;
      score += 8;
    }
  }

  // India
  for (const kw of INDIA_KEYWORDS) {
    if (normTitle.includes(kw)) {
      indScore += 12;
      score += 12;
      matchedKeywords.push(`ind:${kw}`);
    } else if (normContent.includes(kw)) {
      indScore += 5;
      score += 5;
    }
  }

  // Clamp Score 0-100
  score = Math.max(0, Math.min(100, score));

  // Determine Category based on highest positive match
  let category = 'இந்தியா';
  let categorySlug = 'india';

  if (lawScore > 0 && lawScore >= tnScore && lawScore >= polScore) {
    category = 'சட்டம்';
    categorySlug = 'law';
  } else if (tnScore > 0 && tnScore >= polScore) {
    category = 'தமிழ்நாடு';
    categorySlug = 'tamil-nadu';
  } else if (polScore > 0) {
    category = 'அரசியல்';
    categorySlug = 'politics';
  } else if (sourceDefaultCategory) {
    // Inherit source category if applicable
    const cat = sourceDefaultCategory.toLowerCase();
    if (cat === 'law' || cat === 'சட்டம்') {
      category = 'சட்டம்';
      categorySlug = 'law';
    } else if (cat === 'tamil-nadu' || cat === 'தமிழ்நாடு') {
      category = 'தமிழ்நாடு';
      categorySlug = 'tamil-nadu';
    } else if (cat === 'politics' || cat === 'அரசியல்') {
      category = 'அரசியல்';
      categorySlug = 'politics';
    }
  }

  // Relevance Threshold: minimum 40 score to accept into news_items
  const isRelevant = score >= 40 && negativeHits === 0;

  return {
    score,
    isRelevant,
    category,
    categorySlug,
    matchedKeywords,
  };
}

/* =========================================================
   4. SINGLE SOURCE TESTER (DIAGNOSTIC - NO DB WRITES)
   ========================================================= */

export async function testFeedUrl(feedUrl: string) {
  try {
    const feed = await rssParser.parseURL(feedUrl.trim());
    const items = feed.items || [];

    const sampleItems = items.slice(0, 5).map((item) => {
      const cleanTitle = sanitizeHtmlText(item.title || '');
      const cleanSummary = sanitizeHtmlText(
        item.contentSnippet || item.summary || item.content || ''
      );
      const analysis = analyzeRelevanceAndCategory(cleanTitle, cleanSummary);

      return {
        title: cleanTitle,
        link: item.link || '',
        pubDate: item.pubDate || item.isoDate || new Date().toISOString(),
        score: analysis.score,
        isRelevant: analysis.isRelevant,
        category: analysis.category,
        categorySlug: analysis.categorySlug,
      };
    });

    return {
      success: true,
      feedTitle: feed.title || 'Unknown RSS Feed',
      feedDescription: feed.description || '',
      totalItems: items.length,
      sampleItems,
    };
  } catch (err: any) {
    console.error('Feed test error:', feedUrl, err.message);
    return {
      success: false,
      error: `RSS செய்தி ஓடையை இணைக்க முடியவில்லை: ${err.message}`,
    };
  }
}

/* =========================================================
   5. BATCH NEWS COLLECTION PIPELINE (SERVER-SIDE)
   ========================================================= */

export async function runNewsCollection(
  supabase: SupabaseClient,
  options?: { sourceId?: string; maxAgeHours?: number }
): Promise<NewsCollectionResult> {
  const result: NewsCollectionResult = {
    sourcesChecked: 0,
    storiesFound: 0,
    storiesInserted: 0,
    itemsAdded: 0,
    duplicatesSkipped: 0,
    irrelevantSkipped: 0,
    lowScoreFiltered: 0,
    errors: [],
  };

  // 1. Fetch active sources ordered by priority descending
  let query = supabase.from('news_sources').select('*').eq('active', true).order('priority', { ascending: false });

  if (options?.sourceId) {
    query = query.eq('id', options.sourceId);
  }

  const { data: sources, error: sourcesError } = await query;

  if (sourcesError) {
    console.error('Error querying news_sources:', sourcesError.message);
    result.errors.push({
      sourceName: 'Database',
      feedUrl: '',
      message: `செய்தி மூலங்களை வாசிக்க முடியவில்லை: ${sourcesError.message}`,
    });
    return result;
  }

  if (!sources || sources.length === 0) {
    return result;
  }

  result.sourcesChecked = sources.length;

  // Maximum story age cutoff (default 48 hours to avoid re-ingesting old archives)
  const maxAgeMs = (options?.maxAgeHours || 48) * 60 * 60 * 1000;
  const cutoffTime = Date.now() - maxAgeMs;

  // 2. Process each source sequentially with fault tolerance
  for (const source of sources) {
    try {
      if (!source.feed_url || !source.feed_url.trim()) {
        continue;
      }

      const feed = await rssParser.parseURL(source.feed_url.trim());
      const items = feed.items || [];
      result.storiesFound += items.length;

      for (const item of items) {
        const rawTitle = item.title || '';
        const rawLink = item.link || '';
        const rawContent = item.contentSnippet || item.summary || item.content || '';

        if (!rawTitle.trim() || !rawLink.trim()) {
          continue;
        }

        // Date check
        const pubDateStr = item.pubDate || item.isoDate;
        let publishedAt: string = new Date().toISOString();
        if (pubDateStr) {
          const parsedDate = new Date(pubDateStr);
          if (!isNaN(parsedDate.getTime())) {
            // Check if older than cutoff
            if (parsedDate.getTime() < cutoffTime) {
              continue;
            }
            publishedAt = parsedDate.toISOString();
          }
        }

        const cleanTitle = sanitizeHtmlText(rawTitle);
        const cleanContent = sanitizeHtmlText(rawContent);
        const normUrl = normalizeUrl(rawLink);
        const dupHash = generateDuplicateHash(source.name, cleanTitle, normUrl);

        // 3. Duplicate Detection: Check if hash or normalized URL already exists in news_items
        const { data: existingItem } = await supabase
          .from('news_items')
          .select('id')
          .or(`duplicate_hash.eq.${dupHash},original_url.eq."${normUrl}"`)
          .maybeSingle();

        if (existingItem) {
          result.duplicatesSkipped++;
          continue;
        }

        // 4. Relevance & Category Analysis
        const analysis = analyzeRelevanceAndCategory(cleanTitle, cleanContent, source.category);

        if (!analysis.isRelevant) {
          result.irrelevantSkipped++;
          result.lowScoreFiltered++;
          continue;
        }

        // 5. Insert Valid Collected Story into public.news_items
        const newRecord = {
          source_id: source.id,
          original_url: normUrl,
          original_title: cleanTitle,
          original_content: cleanContent.slice(0, 3000), // preserve summary/content without huge overflow
          source_name: source.name,
          category: analysis.category,
          category_slug: analysis.categorySlug,
          published_at: publishedAt,
          discovered_at: new Date().toISOString(),
          relevance_score: analysis.score,
          duplicate_hash: dupHash,
          status: 'collected',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        const { error: insertError } = await supabase.from('news_items').insert([newRecord]);

        if (insertError) {
          // If collision due to unique constraint, count as skipped duplicate
          if (insertError.message.includes('duplicate') || insertError.code === '23505') {
            result.duplicatesSkipped++;
          } else {
            console.error('Error inserting news_item:', insertError.message);
          }
        } else {
          result.storiesInserted++;
          result.itemsAdded++;
        }
      }
    } catch (sourceErr: any) {
      console.warn(`Failed collecting source "${source.name}" (${source.feed_url}):`, sourceErr.message);
      result.errors.push({
        sourceName: source.name,
        feedUrl: source.feed_url,
        message: sourceErr.message || 'செய்தி ஓடையைப் படிக்க முடியவில்லை.',
      });
      // Continue to next source!
    }
  }

  return result;
}

/* =========================================================
   6. DEFAULT APPROVED INDIAN SOURCES SEED LIST
   ========================================================= */

export const DEFAULT_APPROVED_SOURCES: Omit<NewsSource, 'id' | 'created_at' | 'updated_at'>[] = [
  {
    name: 'Bar & Bench (Legal News)',
    feed_url: 'https://www.barandbench.com/feed',
    source_type: 'rss',
    category: 'law',
    region: 'India',
    priority: 95,
    active: true,
  },
  {
    name: 'LiveLaw (Courts & Verdicts)',
    feed_url: 'https://www.livelaw.in/category/top-stories/feed',
    source_type: 'rss',
    category: 'law',
    region: 'India',
    priority: 90,
    active: true,
  },
  {
    name: 'The Hindu (Tamil Nadu)',
    feed_url: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss',
    source_type: 'rss',
    category: 'tamil-nadu',
    region: 'Tamil Nadu',
    priority: 85,
    active: true,
  },
  {
    name: 'The Hindu (National India)',
    feed_url: 'https://www.thehindu.com/news/national/feeder/default.rss',
    source_type: 'rss',
    category: 'india',
    region: 'India',
    priority: 80,
    active: true,
  },
  {
    name: 'Indian Express (Political Pulse)',
    feed_url: 'https://indianexpress.com/section/political-pulse/feed/',
    source_type: 'rss',
    category: 'politics',
    region: 'India',
    priority: 85,
    active: true,
  },
];
