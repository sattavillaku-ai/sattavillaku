'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  FileText,
  Newspaper,
  Sparkles,
  PlusCircle,
  Image as ImageIcon,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue, Article, NewsItem } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTamil } from '@/lib/utils';

export default function AdminDashboardPage() {
  const [currentIssue, setCurrentIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [reviewItems, setReviewItems] = useState<NewsItem[]>([]);

  useEffect(() => {
    setCurrentIssue(dataService.getCurrentIssue());
    setArticles(dataService.getArticles());
    setNews(dataService.getNews());
    setReviewItems(dataService.getNewsReviewItems());
  }, []);

  const publishedArticles = articles.filter((a) => a.status === 'published');
  const draftArticles = articles.filter((a) => a.status === 'draft');
  const publishedNews = news.filter((n) => n.status === 'published');

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="rounded-lg bg-card border border-border p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400">
              பதிப்பகத் தளம் நேரலை
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold font-tamil text-foreground">
            வணக்கம், ஆசிரியர் குழு! (Editorial Desk)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground font-tamil">
            சட்டவிளக்கு மாத இதழ் மற்றும் நாளிதழ் டிஜிட்டல் செய்தி மேலாண்மை அறை.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
          >
            <PlusCircle className="w-4 h-4" />
            <span>புதிய கட்டுரை</span>
          </Link>

          <Link
            href="/admin/news/review"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4" />
            <span>செய்தி ஆய்வு ({reviewItems.length})</span>
          </Link>
        </div>
      </div>

      {/* KPI METRIC CARDS (Section 24) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Current Issue */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">நடப்பு இதழ்</span>
            <BookOpen className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            இதழ் {currentIssue?.issueNumber || '48'}
          </div>
          <div className="text-[11px] text-muted-foreground truncate">
            {currentIssue?.month} {currentIssue?.year}
          </div>
        </div>

        {/* Card 2: Published Articles */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">வெளியானவை</span>
            <FileText className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {publishedArticles.length}
          </div>
          <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium">
            கட்டுரைகள் நேரலை
          </div>
        </div>

        {/* Card 3: Draft Articles */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">வரைவுகள்</span>
            <Layers className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {draftArticles.length}
          </div>
          <div className="text-[11px] text-muted-foreground">தயாராக உள்ளவை</div>
        </div>

        {/* Card 4: News Found Today */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">இன்றைய செய்திகள்</span>
            <Newspaper className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            18
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            மூலங்களிலிருந்து
          </div>
        </div>

        {/* Card 5: Pending Review */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs border-amber-500/40">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil font-bold text-amber-600 dark:text-amber-400">
              ஆய்வில் உள்ளவை
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {reviewItems.length}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            ஆசிரியர் ஒப்புதல் தேவை
          </div>
        </div>

        {/* Card 6: Published News */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">வெளியான செய்திகள்</span>
            <CheckCircle2 className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {publishedNews.length}
          </div>
          <div className="text-[11px] text-muted-foreground">இணையதளத்தில்</div>
        </div>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <Link
          href="/admin/articles/new"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold font-tamil text-foreground group-hover:text-primary">
              புதிய கட்டுரை
            </div>
            <div className="text-[10px] text-muted-foreground truncate">எழுத & பதிவேற்ற</div>
          </div>
        </Link>

        <Link
          href="/admin/issues/new"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold font-tamil text-foreground group-hover:text-primary">
              புதிய இதழ்
            </div>
            <div className="text-[10px] text-muted-foreground truncate">அட்டைப்படம் & PDF</div>
          </div>
        </Link>

        <Link
          href="/admin/news/review"
          className="p-4 rounded-md border border-border bg-card hover:border-amber-500/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold font-tamil text-foreground group-hover:text-amber-600">
              செய்தி சரிபார்ப்பு
            </div>
            <div className="text-[10px] text-muted-foreground truncate">{reviewItems.length} புதிய வரைவுகள்</div>
          </div>
        </Link>

        <Link
          href="/admin/media"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <ImageIcon className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold font-tamil text-foreground group-hover:text-primary">
              மீடியா நூலகம்
            </div>
            <div className="text-[10px] text-muted-foreground truncate">படங்கள் பதிவேற்ற</div>
          </div>
        </Link>
      </div>

      {/* EDITORIAL WORKFLOW PIPELINE STATUS (Section 47) */}
      <div className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold font-tamil text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span>AI செய்தி சேகரிப்பு & சரிபார்ப்பு ஓட்டம் (Editorial Pipeline)</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              விசாரணை மற்றும் சட்ட நடுநிலைமையைப் பேண AI வரைவுகள் ஆசிரியர் ஒப்புதலுக்குப் பின்னரே பிரசுரிக்கப்படும்.
            </p>
          </div>

          <Link
            href="/admin/news/review"
            className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
          >
            <span>சரிபார்ப்புக் கூடம் &rarr;</span>
          </Link>
        </div>

        {/* Pipeline steps */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs">
          <div className="p-3 rounded-md bg-muted/60 border border-border text-center space-y-1">
            <div className="font-bold text-foreground">1. மூலங்கள் (Sources)</div>
            <div className="text-[11px] text-muted-foreground">உயர்/உச்ச நீதிமன்றம், PIB, PTI</div>
            <div className="text-emerald-600 font-bold text-[10px]">இயங்குகிறது</div>
          </div>
          <div className="p-3 rounded-md bg-muted/60 border border-border text-center space-y-1">
            <div className="font-bold text-foreground">2. வடிகட்டல் (Filter)</div>
            <div className="text-[11px] text-muted-foreground">சட்டம்/அரசியல் பொருத்தம்</div>
            <div className="text-emerald-600 font-bold text-[10px]">தானியங்கி</div>
          </div>
          <div className="p-3 rounded-md bg-muted/60 border border-border text-center space-y-1">
            <div className="font-bold text-foreground">3. Gemini AI வரைவு</div>
            <div className="text-[11px] text-muted-foreground">தமிழ் மொழிபெயர்ப்பு & சுருக்கம்</div>
            <div className="text-emerald-600 font-bold text-[10px]">பாதுகாப்பானது</div>
          </div>
          <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
            <div className="font-bold text-amber-600 dark:text-amber-400">4. ஆசிரியர் சரிபார்ப்பு</div>
            <div className="text-[11px] text-amber-700 dark:text-amber-300">ஒப்புதல் / திருத்தம்</div>
            <div className="text-amber-600 font-bold text-[10px]">{reviewItems.length} நிலுவை</div>
          </div>
          <div className="p-3 rounded-md bg-muted/60 border border-border text-center space-y-1">
            <div className="font-bold text-foreground">5. வெளியீடு (Publish)</div>
            <div className="text-[11px] text-muted-foreground">இணையதளம் & சமூக ஊடகம்</div>
            <div className="text-emerald-600 font-bold text-[10px]">நேரலை</div>
          </div>
        </div>
      </div>

      {/* RECENT ARTICLES & RECENT NEWS TWO-COLUMN */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Column 1: Recent Articles */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold font-tamil text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>கட்டுரைகள் நிலை (Articles CMS)</span>
            </h3>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-primary hover:underline"
            >
              அனைத்தும் &rarr;
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {articles.slice(0, 4).map((art) => (
              <div key={art.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-bold font-tamil text-foreground truncate">{art.title}</div>
                  <div className="text-muted-foreground mt-0.5 flex items-center gap-2">
                    <span>{art.author.name}</span>
                    <span>•</span>
                    <span>{formatDateTamil(art.publishedAt)}</span>
                  </div>
                </div>
                <StatusBadge status={art.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Items Waiting For Review */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold font-tamil text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>சரிபார்ப்புக்குக் காத்திருக்கும் செய்திகள்</span>
            </h3>
            <Link
              href="/admin/news/review"
              className="text-xs font-semibold text-amber-600 hover:underline"
            >
              சரிபார்க்க &rarr;
            </Link>
          </div>

          <div className="divide-y divide-border/60">
            {reviewItems.map((item) => (
              <div key={item.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0 flex-1">
                  <div className="font-bold font-tamil text-foreground truncate">{item.headline}</div>
                  <div className="text-muted-foreground mt-0.5">
                    ஆதாரம்: <span className="font-medium text-foreground">{item.source}</span>
                  </div>
                </div>
                <Link
                  href="/admin/news/review"
                  className="shrink-0 px-2.5 py-1 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20 text-[11px]"
                >
                  ஆய்வு செய் &rarr;
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
