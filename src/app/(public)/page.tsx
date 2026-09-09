'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  ArrowRight,
  Scale,
  Sparkles,
  Flame,
  Calendar,
  Layers,
  MessageCircle,
  Share2,
  CheckCircle2,
  ChevronRight
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue, Article, NewsItem } from '@/types';
import { IssueCard } from '@/components/issue-card';
import { ArticleCard } from '@/components/article-card';
import { FeaturedArticle } from '@/components/featured-article';
import { NewsCard } from '@/components/news-card';
import { CategoryBadge } from '@/components/category-badge';

export default function HomePage() {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [previousIssues, setPreviousIssues] = useState<Issue[]>([]);
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [selectedNewsCategory, setSelectedNewsCategory] = useState<string>('all');

  useEffect(() => {
    const issues = dataService.getIssues();
    const curr = dataService.getCurrentIssue();
    setCurrentIssue(curr);
    setPreviousIssues(issues.filter((i) => i.id !== curr.id));

    const allArticles = dataService.getPublishedArticles();
    setArticles(allArticles);

    const allNews = dataService.getPublishedNews();
    setNews(allNews);
  }, []);

  const featuredArticle = articles.find((a) => a.featured) || articles[0];
  const supportingArticles = articles.filter((a) => a.id !== featuredArticle?.id).slice(0, 3);
  const latestArticles = articles.slice(0, 6);

  const filteredNews =
    selectedNewsCategory === 'all'
      ? news
      : news.filter((n) => n.category.toLowerCase() === selectedNewsCategory.toLowerCase());

  const leadNews = filteredNews[0];
  const otherNews = filteredNews.slice(1, 5);

  return (
    <div className="space-y-12 sm:space-y-16 pb-12">
      {/* 1. HERO SECTION: Current Issue Spotlight */}
      <section className="bg-linear-to-b from-primary/5 via-transparent to-transparent pt-6 sm:pt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4 border-b border-border/60 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-primary" />
              <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-primary font-tamil">
                நடப்பு மாத இதழ் (Current Edition)
              </h2>
            </div>
            <Link
              href="/magazine"
              className="text-xs text-muted-foreground hover:text-primary font-semibold flex items-center gap-1"
            >
              <span>அனைத்து இதழ்கள்</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {currentIssue && <IssueCard issue={currentIssue} featured />}
        </div>
      </section>

      {/* 2. TODAY'S NEWS (இன்றைய செய்திகள்) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b-2 border-primary pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Flame className="w-5 h-5 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-extrabold font-tamil text-foreground">
                இன்றைய முக்கிய செய்திகள்
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-tamil">
              சட்டம், அரசியல், தமிழ்நாடு மற்றும் இந்திய நடப்புகளின் நேரடி நிலவரங்கள்
            </p>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
            {[
              { id: 'all', label: 'அனைத்தும்' },
              { id: 'law', label: 'சட்டம்' },
              { id: 'politics', label: 'அரசியல்' },
              { id: 'tamil-nadu', label: 'தமிழ்நாடு' },
              { id: 'india', label: 'இந்தியா' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedNewsCategory(tab.id)}
                className={`px-3 py-1.5 rounded-xs text-xs font-bold whitespace-nowrap transition-all ${
                  selectedNewsCategory === tab.id
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Lead Story + Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {leadNews && (
            <div className="lg:col-span-7">
              <NewsCard news={leadNews} variant="lead" />
            </div>
          )}

          <div className="lg:col-span-5 space-y-3 bg-card border border-border rounded-lg p-4 divide-y divide-border/60">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground pb-2 flex items-center justify-between">
              <span>சமீபத்திய நிகழ்வுகள்</span>
              <Link href="/news" className="text-primary hover:underline font-semibold lowercase text-[11px]">
                அனைத்தும் &rarr;
              </Link>
            </div>
            {otherNews.map((item) => (
              <NewsCard key={item.id} news={item} variant="list" />
            ))}
          </div>
        </div>
      </section>

      {/* 3. FEATURED ARTICLES (சிறப்புக் கட்டுரைகள்) */}
      <section className="bg-muted/30 py-12 border-y border-border/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8 border-b-2 border-primary pb-3">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h2 className="text-2xl sm:text-3xl font-extrabold font-tamil text-foreground">
                  சிறப்புக் கட்டுரைகள்
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-tamil">
                நீதித்துறை, அரசியல் சாசனம் மற்றும் சமூகப் பிரச்னைகள் குறித்த விரிவான ஆய்வுகள்
              </p>
            </div>

            <Link
              href="/articles"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
            >
              <span>அனைத்துக் கட்டுரைகள்</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {featuredArticle && <FeaturedArticle article={featuredArticle} className="mb-8" />}

          {/* 3 supporting articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {supportingArticles.map((art) => (
              <ArticleCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        </div>
      </section>

      {/* 4. LATEST ARTICLES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold font-tamil text-foreground">
              சமீபத்திய கட்டுரைகள் & ஆய்வுகள்
            </h2>
          </div>

          <Link
            href="/articles"
            className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
          >
            <span>மேலும் வாசிக்க</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {latestArticles.map((art) => (
            <ArticleCard key={art.id} article={art} layout="standard" />
          ))}
        </div>
      </section>

      {/* 5. PREVIOUS ISSUES (முந்தைய இதழ்கள்) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6 border-b-2 border-primary pb-3">
          <div>
            <div className="flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" />
              <h2 className="text-2xl sm:text-3xl font-extrabold font-tamil text-foreground">
                முந்தைய இதழ்கள் (Magazine Archive)
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-1 font-tamil">
              சட்டவிளக்கு மாத இதழின் முந்தைய வெளியீடுகள் மற்றும் டிஜிட்டல் பதிப்புகள்
            </p>
          </div>

          <Link
            href="/magazine"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-primary hover:underline"
          >
            <span>முழு காப்பகம்</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {previousIssues.slice(0, 4).map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      </section>

      {/* 6. EDITORIAL INVITATION / SOCIAL CONNECT (No email newsletter) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-linear-to-r from-primary/15 via-muted/60 to-primary/10 border border-primary/20 p-6 sm:p-10 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-xs bg-primary/20 text-primary text-xs font-bold">
                <Scale className="w-3.5 h-3.5" />
                <span>சட்டவிளக்கு சமூக முன்னெடுப்பு</span>
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold font-tamil text-foreground">
                சட்டவிளக்குடன் தொடர்ந்து இணைந்திருங்கள்
              </h3>
              <p className="text-muted-foreground text-sm sm:text-base font-tamil leading-relaxed max-w-2xl">
                சட்ட விழிப்புணர்வு, நீதிமன்றத் தீர்ப்புகள் மற்றும் மக்கள் நலன் சார்ந்த முக்கிய செய்திகளை உடனுக்குடன் தெரிந்து கொள்ள சட்டவிளக்கு அதிகாரப்பூர்வ சமூக ஊடகக் குழுமங்களில் இணையுங்கள்.
              </p>
            </div>

            <div className="lg:col-span-4 flex flex-col sm:flex-row lg:flex-col gap-3 justify-center">
              <a
                href="https://chat.whatsapp.com/sattavilakku"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md bg-[#25D366] text-white font-bold text-sm hover:opacity-90 transition-all shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp குழுவில் இணைய</span>
              </a>

              <Link
                href="/contact"
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-md border border-border bg-card text-foreground font-bold text-sm hover:bg-muted transition-all"
              >
                <span>ஆசிரியர் குழுவைத் தொடர்புகொள்ள</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
