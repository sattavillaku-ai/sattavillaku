'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  BookOpen,
  Calendar,
  Clock,
  ListOrdered,
  ArrowRight,
  Sparkles,
  Loader2,
  FileText,
} from 'lucide-react';
import { Issue, Article } from '@/types';
import { fetchCurrentIssue, fetchArticles } from '@/lib/cms-service';
import { ArticleCard } from '@/components/article-card';
import { ShareButtons } from '@/components/share-buttons';
import { EmptyState } from '@/components/empty-state';
import { formatDateTamil } from '@/lib/utils';

export default function CurrentMagazinePage() {
  const [issue, setIssue] = useState<Issue | null>(null);
  const [issueArticles, setIssueArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const curr = await fetchCurrentIssue();
        if (isMounted) {
          setIssue(curr);
          if (curr) {
            // Load published articles related to this issue
            const allArticles = await fetchArticles({ status: 'published', limit: 6 });
            const matched = allArticles.filter((a) => a.issue_id === curr.id || a.issueId === curr.id);
            setIssueArticles(matched);
          }
        }
      } catch (err) {
        console.error('Error fetching current issue:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground font-tamil">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm">தற்போதைய இதழ் ஏற்றப்படுகிறது...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          title="தற்போதைய இதழ் எதுவும் கிடைக்கவில்லை"
          description="புதிய இதழ் விரைவில் பதிவேற்றப்பட்டு வெளியிடப்படும்."
          actionText="அனைத்து இதழ்களையும் பார்க்க"
          actionHref="/magazine"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-primary">முகப்பு</Link>
        <span>/</span>
        <Link href="/magazine" className="hover:text-primary">இதழ்கள்</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">தற்போதைய இதழ் (இதழ் {issue.issueNumber})</span>
      </nav>

      {/* Main Issue Header Hero */}
      <div className="bg-card border border-border rounded-lg p-6 sm:p-10 shadow-xs">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
          {/* Cover */}
          <div className="md:col-span-5 lg:col-span-4 flex justify-center">
            <div className="relative w-64 sm:w-72 aspect-3/4 rounded-md overflow-hidden shadow-2xl border border-border">
              <img
                src={issue.coverUrl}
                alt={issue.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-xs shadow-md">
                இதழ் {issue.issueNumber}
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-7 lg:col-span-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-xs bg-primary/10 text-primary text-xs font-bold">
              <Calendar className="w-3.5 h-3.5" />
              <span>{issue.month} {issue.year} • தொகுதி {issue.volume_number || 1} • இதழ் எண்: {issue.issueNumber}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold font-tamil text-foreground leading-tight">
              {issue.title}
            </h1>

            {issue.description && (
              <p className="text-muted-foreground text-sm sm:text-base leading-relaxed font-tamil">
                {issue.description}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
              <span>மொத்த பக்கங்கள்: <strong className="text-foreground font-mono">{issue.pageCount}</strong></span>
              <span>•</span>
              <span>வெளியீட்டுத் தேதி: <strong className="text-foreground">{formatDateTamil(issue.published_at || issue.publicationDate)}</strong></span>
              <span>•</span>
              <span>அணுகல்: <strong className="text-emerald-700 dark:text-emerald-400 font-semibold">{issue.is_free !== false ? 'இலவச இதழ்' : 'பதிப்புரிமை பெற்றது'}</strong></span>
            </div>

            <div className="pt-4 flex flex-wrap items-center gap-3">
              <Link
                href={`/magazine/${issue.slug}/read`}
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-primary text-primary-foreground font-bold text-sm hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
              >
                <BookOpen className="w-4 h-4" />
                <span>டிஜிட்டல் இதழைப் படிக்க (Read Full Magazine)</span>
              </Link>

              <ShareButtons title={`சட்டவிளக்கு இதழ் ${issue.issueNumber} - ${issue.title}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Table of Contents & Articles */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={issueArticles.length > 0 ? 'lg:col-span-7 space-y-4' : 'lg:col-span-12 space-y-4'}>
          <div className="border-b-2 border-primary pb-2 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold font-tamil text-foreground">
              இதழின் பொருளடக்கம் (Table of Contents)
            </h2>
          </div>

          {issue.tableOfContents && issue.tableOfContents.length > 0 ? (
            <div className="bg-card border border-border rounded-lg divide-y divide-border/70 overflow-hidden">
              {issue.tableOfContents.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 flex items-start justify-between hover:bg-muted/40 transition-colors group"
                >
                  <div className="space-y-1">
                    {item.category && (
                      <span className="text-[11px] font-bold text-primary uppercase">{item.category}</span>
                    )}
                    <h3 className="text-base font-bold font-tamil text-foreground group-hover:text-primary transition-colors">
                      {item.title}
                    </h3>
                    {item.author && (
                      <div className="text-xs text-muted-foreground font-tamil">
                        கட்டுரையாளர்: <span className="text-foreground font-medium">{item.author}</span>
                      </div>
                    )}
                  </div>

                  <Link
                    href={`/magazine/${issue.slug}/read`}
                    className="shrink-0 ml-4 inline-flex items-center gap-1 text-xs font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-xs hover:bg-primary hover:text-primary-foreground transition-colors cursor-pointer font-mono"
                  >
                    <span>பக். {item.page}</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-6 text-center text-xs text-muted-foreground">
              இவ்விதழுக்கு பொருளடக்கம் தனியாக வழங்கப்படவில்லை. முழு இதழையும் படிக்க &quot;டிஜிட்டல் இதழைப் படிக்க&quot; பொத்தானை அழுத்தவும்.
            </div>
          )}
        </div>

        {/* Articles Published in This Issue */}
        {issueArticles.length > 0 && (
          <div className="lg:col-span-5 space-y-4">
            <div className="border-b-2 border-primary pb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl sm:text-2xl font-bold font-tamil text-foreground">
                இவ்விதழின் சிறப்புக் கட்டுரைகள்
              </h2>
            </div>

            <div className="space-y-4">
              {issueArticles.map((art) => (
                <ArticleCard key={art.id} article={art} layout="compact" />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
