'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, X, BookOpen, Newspaper, Calendar, ArrowRight, Filter, Scale } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Article, NewsItem, Issue } from '@/types';
import { CategoryBadge } from '@/components/category-badge';
import { EmptyState } from '@/components/empty-state';
import { formatDateTamil } from '@/lib/utils';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [isSearching, setIsSearching] = useState(false);

  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);

  useEffect(() => {
    setArticles(dataService.getPublishedArticles());
    setNews(dataService.getPublishedNews());
    setIssues(dataService.getIssues());
  }, []);

  const filters = [
    { id: 'all', label: 'அனைத்தும்' },
    { id: 'articles', label: 'கட்டுரைகள்' },
    { id: 'news', label: 'செய்திகள்' },
    { id: 'issues', label: 'மாத இதழ்கள்' },
    { id: 'law', label: 'சட்டம்' },
    { id: 'politics', label: 'அரசியல்' },
    { id: 'tamil-nadu', label: 'தமிழ்நாடு' },
    { id: 'india', label: 'இந்தியா' },
  ];

  const trimmed = query.trim().toLowerCase();

  // Filter matching articles
  const matchedArticles = articles.filter((art) => {
    if (activeFilter === 'issues' || activeFilter === 'news') return false;
    if (activeFilter !== 'all' && activeFilter !== 'articles' && art.category.toLowerCase() !== activeFilter) {
      return false;
    }
    if (!trimmed) return false;
    return (
      art.title.toLowerCase().includes(trimmed) ||
      art.excerpt.toLowerCase().includes(trimmed) ||
      art.author.name.toLowerCase().includes(trimmed) ||
      art.tags.some((t) => t.toLowerCase().includes(trimmed))
    );
  });

  // Filter matching news
  const matchedNews = news.filter((item) => {
    if (activeFilter === 'issues' || activeFilter === 'articles') return false;
    if (activeFilter !== 'all' && activeFilter !== 'news' && item.category.toLowerCase() !== activeFilter) {
      return false;
    }
    if (!trimmed) return false;
    return (
      item.headline.toLowerCase().includes(trimmed) ||
      item.summary.toLowerCase().includes(trimmed) ||
      item.source.toLowerCase().includes(trimmed) ||
      item.tags.some((t) => t.toLowerCase().includes(trimmed))
    );
  });

  // Filter matching issues
  const matchedIssues = issues.filter((iss) => {
    if (activeFilter !== 'all' && activeFilter !== 'issues') return false;
    if (!trimmed) return false;
    return (
      iss.title.toLowerCase().includes(trimmed) ||
      iss.description.toLowerCase().includes(trimmed) ||
      iss.month.toLowerCase().includes(trimmed) ||
      iss.issueNumber.toString().includes(trimmed)
    );
  });

  const totalResultsCount = matchedArticles.length + matchedNews.length + matchedIssues.length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          <span>சட்டவிளக்கு ஒருங்கிணைந்த தேடல்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          தேடல் (Search Articles, News & Issues)
        </h1>
        <p className="text-sm text-muted-foreground mt-1 font-tamil">
          கட்டுரைகள், நீதிமன்ற செய்திகள், அரசியல் நிலவரங்கள் மற்றும் மாத இதழ்களை ஒரே இடத்தில் தேடுங்கள்.
        </p>
      </div>

      {/* Search Input Box */}
      <div className="relative">
        <input
          type="text"
          placeholder="எ.கா: உச்ச நீதிமன்றம், அரசியல் சாசனம், சென்னை உயர் நீதிமன்றம், இதழ் 48..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          autoFocus
          className="w-full pl-12 pr-10 py-3.5 rounded-lg border-2 border-border focus:border-primary bg-card text-foreground font-tamil text-base sm:text-lg focus:outline-none transition-colors shadow-xs"
        />
        <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-full text-muted-foreground hover:text-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-border/70">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setActiveFilter(f.id)}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold whitespace-nowrap transition-colors ${
              activeFilter === f.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Initial Empty State (before typing) */}
      {!trimmed && (
        <div className="p-8 sm:p-12 text-center rounded-lg border border-dashed border-border bg-card/40 space-y-3">
          <Scale className="w-12 h-12 text-primary/40 mx-auto" />
          <h3 className="text-lg font-bold font-tamil text-foreground">
            தேட விரும்பும் சொல்லை உள்ளிடவும்
          </h3>
          <p className="text-sm text-muted-foreground max-w-md mx-auto font-tamil">
            சட்டவிளக்கு இதழ்கள், சிறப்புக் கட்டுரைகள், மற்றும் அன்றாடச் செய்திகளைத் தேட மேலே உள்ள கட்டத்தில் தட்டச்சு செய்யவும்.
          </p>
          <div className="pt-2 flex flex-wrap justify-center gap-2 text-xs">
            <span className="text-muted-foreground">பரிந்துரைகள்:</span>
            {['அரசியல் சாசனம்', 'சென்னை உயர் நீதிமன்றம்', 'ஜாமீன் சட்டம்', 'கிக் தொழிலாளர்கள்'].map((term) => (
              <button
                key={term}
                type="button"
                onClick={() => setQuery(term)}
                className="px-2.5 py-1 rounded-xs bg-muted text-foreground hover:text-primary border border-border"
              >
                {term}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Container */}
      {trimmed && (
        <div className="space-y-8">
          <div className="flex items-center justify-between text-xs text-muted-foreground border-b border-border pb-2">
            <span>
              &ldquo;<strong className="text-foreground">{query}</strong>&rdquo; தேடலுக்கான முடிவுகள்:
            </span>
            <span className="font-bold text-primary font-mono">{totalResultsCount} முடிவுகள்</span>
          </div>

          {totalResultsCount === 0 ? (
            <EmptyState
              title="தேடல் முடிவுகள் கிடைக்கவில்லை"
              description={`"${query}" என்ற சொல்லிற்கான முடிவுகள் எதுவும் இல்லை. தயவுசெய்து வேறு முக்கியச் சொற்களைப் பயன்படுத்தி தேடவும்.`}
              actionText="தேடலை அழிக்கவும்"
              onAction={() => setQuery('')}
            />
          ) : (
            <div className="space-y-8">
              {/* 1. Matched Issues */}
              {matchedIssues.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 font-tamil">
                    <BookOpen className="w-4 h-4" />
                    <span>பொருத்தமான இதழ்கள் ({matchedIssues.length})</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {matchedIssues.map((issue) => (
                      <Link
                        key={issue.id}
                        href={`/magazine/${issue.slug}`}
                        className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition-all flex gap-3 group"
                      >
                        <img
                          src={issue.coverUrl}
                          alt={issue.title}
                          className="w-16 h-20 object-cover rounded-xs shrink-0"
                        />
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-primary">
                            இதழ் {issue.issueNumber} ({issue.month} {issue.year})
                          </div>
                          <div className="text-sm font-bold font-tamil group-hover:text-primary transition-colors line-clamp-2 mt-0.5">
                            {issue.title}
                          </div>
                          <div className="text-xs text-muted-foreground line-clamp-1 mt-1 font-tamil">
                            {issue.description}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Matched Articles */}
              {matchedArticles.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 font-tamil">
                    <Newspaper className="w-4 h-4" />
                    <span>பொருத்தமான கட்டுரைகள் ({matchedArticles.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {matchedArticles.map((art) => (
                      <Link
                        key={art.id}
                        href={`/articles/${art.slug}`}
                        className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={art.category} nameTamil={art.categoryNameTamil} size="sm" />
                            <span className="text-xs text-muted-foreground">{art.author.name}</span>
                          </div>
                          <div className="text-base font-bold font-tamil text-foreground group-hover:text-primary transition-colors">
                            {art.title}
                          </div>
                          <p className="text-xs text-muted-foreground font-tamil line-clamp-1">
                            {art.excerpt}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0 sm:text-right">
                          <time dateTime={art.publishedAt}>{formatDateTamil(art.publishedAt)}</time>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Matched News */}
              {matchedNews.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-1.5 font-tamil">
                    <Scale className="w-4 h-4" />
                    <span>பொருத்தமான செய்திகள் ({matchedNews.length})</span>
                  </h3>
                  <div className="space-y-3">
                    {matchedNews.map((item) => (
                      <Link
                        key={item.id}
                        href={`/news/${item.category}`}
                        className="p-4 rounded-md border border-border bg-card hover:border-primary/50 transition-all flex flex-col sm:flex-row justify-between sm:items-center gap-3 group"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <CategoryBadge category={item.category} nameTamil={item.categoryNameTamil} size="sm" />
                            <span className="text-xs text-muted-foreground font-sans">
                              ஆதாரம்: {item.source}
                            </span>
                          </div>
                          <div className="text-base font-bold font-tamil text-foreground group-hover:text-primary transition-colors">
                            {item.headline}
                          </div>
                          <p className="text-xs text-muted-foreground font-tamil line-clamp-1">
                            {item.summary}
                          </p>
                        </div>
                        <div className="text-xs text-muted-foreground shrink-0 sm:text-right">
                          <time dateTime={item.publishedAt}>{formatDateTamil(item.publishedAt)}</time>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
