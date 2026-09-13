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
  Layers,
  CheckCircle2,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Article, Issue } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { formatDateTamil } from '@/lib/utils';
import { fetchDashboardStats, DashboardStats, fetchTopArticlesByViews } from '@/lib/cms-service';

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topArticles, setTopArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        setError(null);
        const [data, top] = await Promise.all([
          fetchDashboardStats(),
          fetchTopArticlesByViews(5).catch(() => []),
        ]);
        setStats(data);
        setTopArticles(top);
      } catch (err: any) {
        setError(err.message || 'கட்டுப்பாட்டக புள்ளிவிவரங்களை ஏற்றுவதில் பிழை.');
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const currentIssue = stats?.currentIssue;

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-tamil">
      {/* Welcome Banner */}
      <div className="rounded-lg bg-card border border-border p-6 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 font-sans">
              Supabase Database Active • நேரலை
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            வணக்கம், ஆசிரியர் குழு! (Editorial Desk)
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
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
            href="/admin/issues"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-colors shadow-xs"
          >
            <BookOpen className="w-4 h-4 text-primary" />
            <span>மாத இதழ்கள்</span>
          </Link>
        </div>
      </div>

      {error && (
        <div className="p-4 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Card 1: Total Articles */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">மொத்தக் கட்டுரைகள்</span>
            <FileText className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-primary" /> : stats?.totalArticles ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground">களஞ்சியத்தில்</div>
        </div>

        {/* Card 2: Published Articles */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">வெளியானவை</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-emerald-600" /> : stats?.publishedArticlesCount ?? 0}
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
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-600" /> : stats?.draftArticlesCount ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground">தயாராக உள்ளவை</div>
        </div>

        {/* Card 4: Magazine Issues */}
        <div className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">மாத இதழ்கள்</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-blue-600" /> : stats?.totalIssuesCount ?? 0}
          </div>
          <div className="text-[11px] text-blue-600 dark:text-blue-400 font-medium">
            {stats?.publishedIssuesCount ?? 0} வெளியானவை
          </div>
        </div>

        {/* Card 5: News Under Review */}
        <Link
          href="/admin/news"
          className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs border-amber-500/40 hover:border-amber-500 transition-colors block"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil font-bold text-amber-600 dark:text-amber-400">
              செய்தி சேகரிப்பு
            </span>
            <Sparkles className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-amber-600 dark:text-amber-400">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-600" /> : (stats?.collectedNewsCount ?? 0) + (stats?.newsReviewCount ?? 0)}
          </div>
          <div className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
            {stats?.collectedNewsCount ?? 0} சேகரிப்பு • {stats?.newsSourcesCount ?? 0} மூலங்கள்
          </div>
        </Link>

        {/* Card 6: Published News */}
        <Link
          href="/admin/news"
          className="p-4 rounded-lg bg-card border border-border space-y-1 shadow-2xs hover:border-primary transition-colors block"
        >
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-tamil">வெளியான செய்திகள்</span>
            <Newspaper className="w-4 h-4 text-teal-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-foreground">
            {loading ? <Loader2 className="w-5 h-5 animate-spin text-teal-600" /> : stats?.publishedNewsCount ?? 0}
          </div>
          <div className="text-[11px] text-muted-foreground">செய்தி ஓடையில்</div>
        </Link>
      </div>

      {/* QUICK ACTIONS ROW */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 sm:gap-4">
        <Link
          href="/admin/articles/new"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <FileText className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary">
              புதிய கட்டுரை
            </div>
            <div className="text-[10px] text-muted-foreground truncate">எழுத & பதிவேற்ற</div>
          </div>
        </Link>

        <Link
          href="/admin/issues"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <BookOpen className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary">
              மாத இதழ்கள்
            </div>
            <div className="text-[10px] text-muted-foreground truncate">இதழ்கள் & PDF</div>
          </div>
        </Link>

        <Link
          href="/admin/news"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
            <Newspaper className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary">
              செய்தி சேகரிப்பு
            </div>
            <div className="text-[10px] text-muted-foreground truncate">RSS & மூலங்கள்</div>
          </div>
        </Link>

        <Link
          href="/admin/categories"
          className="p-4 rounded-md border border-border bg-card hover:border-primary/50 hover:bg-muted/40 transition-all flex items-center gap-3 group"
        >
          <div className="w-9 h-9 rounded-md bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary">
              பிரிவுகள்
            </div>
            <div className="text-[10px] text-muted-foreground truncate">சட்டம், அரசியல்</div>
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
            <div className="text-xs sm:text-sm font-bold text-foreground group-hover:text-primary">
              மீடியா நூலகம்
            </div>
            <div className="text-[10px] text-muted-foreground truncate">படங்கள் & கோப்புகள்</div>
          </div>
        </Link>
      </div>

      {/* EDITORIAL WORKFLOW STATUS */}
      <div className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <h2 className="text-base font-bold text-foreground flex items-center gap-2">
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
            <div className="text-emerald-600 font-bold text-[10px]">இணைப்பில்</div>
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
            <div className="text-amber-600 font-bold text-[10px]">{stats?.newsReviewCount ?? 0} நிலுவை</div>
          </div>
          <div className="p-3 rounded-md bg-muted/60 border border-border text-center space-y-1">
            <div className="font-bold text-foreground">5. வெளியீடு (Publish)</div>
            <div className="text-[11px] text-muted-foreground">இணையதளம் & சமூக ஊடகம்</div>
            <div className="text-emerald-600 font-bold text-[10px]">நேரலை</div>
          </div>
        </div>
      </div>

      {/* RECENT ARTICLES FROM DATABASE */}
      {/* TWO COLUMN EDITORIAL ACTIVITY: ARTICLES & ISSUES */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* RECENT ARTICLES FROM DATABASE */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>சமீபத்திய கட்டுரைகள் (Recent Articles)</span>
            </h3>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-primary hover:underline"
            >
              அனைத்தும் பார்க்க &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span>கட்டுரைகள் ஏற்றப்படுகின்றன...</span>
            </div>
          ) : !stats?.recentArticles || stats.recentArticles.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              தரவுத்தளத்தில் கட்டுரைகள் எதுவும் இல்லை. &quot;புதிய கட்டுரை&quot; பொத்தானைப் பயன்படுத்தி முதல் கட்டுரையை உருவாக்கவும்.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {stats.recentArticles.map((art) => (
                <div key={art.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-foreground truncate">{art.title}</div>
                    <div className="text-muted-foreground mt-0.5 flex items-center gap-2 text-[11px]">
                      <span>{art.author?.name || 'ஆசிரியர் குழு'}</span>
                      <span>•</span>
                      <span>{formatDateTamil(art.published_at || art.created_at || '')}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={art.status} />
                    <Link
                      href={`/admin/articles/${art.id}`}
                      className="p-1 px-2 rounded-xs border border-border text-muted-foreground hover:text-foreground text-[11px] font-semibold hover:bg-muted"
                    >
                      திருத்து
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RECENT ISSUES FROM DATABASE */}
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>சமீபத்திய மாத இதழ்கள் (Recent Issues)</span>
            </h3>
            <Link
              href="/admin/issues"
              className="text-xs font-semibold text-primary hover:underline"
            >
              அனைத்தும் பார்க்க &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="p-6 text-center text-muted-foreground text-xs flex items-center justify-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>இதழ்கள் ஏற்றப்படுகின்றன...</span>
            </div>
          ) : !stats?.recentIssues || stats.recentIssues.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground text-xs">
              மாத இதழ்கள் எதுவும் பதிவு செய்யப்படவில்லை.
            </div>
          ) : (
            <div className="divide-y divide-border/60">
              {stats.recentIssues.map((issue) => (
                <div key={issue.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3 min-w-0 flex-1">
                    {issue.cover_image_url || issue.coverUrl ? (
                      <img
                        src={issue.cover_image_url || issue.coverUrl}
                        alt={issue.title}
                        className="w-8 h-10 object-cover rounded-xs border border-border shrink-0"
                      />
                    ) : (
                      <div className="w-8 h-10 rounded-xs bg-muted border border-border flex items-center justify-center shrink-0">
                        <BookOpen className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-foreground truncate">
                        {issue.title || `இதழ் ${issue.issue_number || issue.issueNumber}`}
                      </div>
                      <div className="text-muted-foreground mt-0.5 text-[11px]">
                        {issue.month || ''} {issue.year || ''}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={issue.status} />
                    <Link
                      href={`/admin/issues/${issue.id}`}
                      className="p-1 px-2 rounded-xs border border-border text-muted-foreground hover:text-foreground text-[11px] font-semibold hover:bg-muted"
                    >
                      விவரம்
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* CONTENT PERFORMANCE / VIEWS METRIC TABLE */}
      {topArticles.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-primary" />
                <span>வாசகர்களின் பார்வை நிலவரம் (Content Performance & Views)</span>
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                தனியுரிமைக்கு மதிப்பளித்து (Privacy-Conscious) கணக்கிடப்படும் கட்டுரைகளின் நேரலைப் பார்வைகள்.
              </p>
            </div>
            <Link
              href="/admin/articles"
              className="text-xs font-semibold text-primary hover:underline"
            >
              கட்டுரைகள் மேலாண்மை &rarr;
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-border text-muted-foreground">
                  <th className="pb-2 font-semibold">வரிசை</th>
                  <th className="pb-2 font-semibold">கட்டுரைத் தலைப்பு</th>
                  <th className="pb-2 font-semibold">பிரிவு</th>
                  <th className="pb-2 font-semibold">ஆசிரியர்</th>
                  <th className="pb-2 font-semibold text-right">பார்வைகள் (Views)</th>
                  <th className="pb-2 font-semibold text-right">நடவடிக்கை</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {topArticles.map((art, idx) => (
                  <tr key={art.id} className="hover:bg-muted/40">
                    <td className="py-2.5 font-mono text-muted-foreground">#{idx + 1}</td>
                    <td className="py-2.5 font-bold text-foreground max-w-xs truncate">
                      <Link href={`/admin/articles/${art.id}`} className="hover:text-primary">
                        {art.title}
                      </Link>
                    </td>
                    <td className="py-2.5 text-muted-foreground">{art.categoryNameTamil || art.category}</td>
                    <td className="py-2.5 text-muted-foreground">{art.author?.name || 'சட்டவிளக்கு'}</td>
                    <td className="py-2.5 text-right font-mono font-bold text-primary">
                      {art.views || 0}
                    </td>
                    <td className="py-2.5 text-right">
                      <Link
                        href={`/admin/articles/${art.id}`}
                        className="p-1 px-2 rounded-xs border border-border text-muted-foreground hover:text-foreground text-[11px] font-semibold hover:bg-muted"
                      >
                        திருத்து
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
