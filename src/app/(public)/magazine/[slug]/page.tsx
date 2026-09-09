'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { BookOpen, Calendar, ArrowLeft, Share2, ListOrdered, Sparkles } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue, Article } from '@/types';
import { PDFReader } from '@/components/pdf-reader';
import { ArticleCard } from '@/components/article-card';
import { ShareButtons } from '@/components/share-buttons';
import { EmptyState } from '@/components/empty-state';
import { formatDateTamil } from '@/lib/utils';

export default function IssueReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (slug) {
      const found = dataService.getIssueBySlug(slug) || dataService.getCurrentIssue();
      setIssue(found || null);

      if (found) {
        const allArticles = dataService.getPublishedArticles();
        setArticles(allArticles.filter((a) => a.issueId === found.id));
      }
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center text-muted-foreground font-tamil">
        இதழ் ஏற்றப்படுகிறது...
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <EmptyState
          title="இதழ் கிடைக்கவில்லை"
          description="நீங்கள் தேடிய இதழ் முகவரி தவறானது அல்லது நீக்கப்பட்டுள்ளது."
          actionText="அனைத்து இதழ்களுக்கும் திரும்புக"
          actionHref="/magazine"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/magazine"
            className="p-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            title="இதழ்கள் பட்டியலுக்குத் திரும்ப"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-xs text-primary font-bold uppercase">
              இதழ் {issue.issueNumber} • {issue.month} {issue.year}
            </div>
            <h1 className="text-xl sm:text-2xl font-bold font-tamil text-foreground">
              {issue.title}
            </h1>
          </div>
        </div>

        <ShareButtons title={`சட்டவிளக்கு இதழ் ${issue.issueNumber} - ${issue.title}`} />
      </div>

      {/* Embedded High-Fidelity Interactive PDF Reader */}
      <section id="reader">
        <PDFReader issue={issue} />
      </section>

      {/* Articles inside this issue */}
      {articles.length > 0 && (
        <section className="pt-8 border-t border-border space-y-4">
          <div className="flex items-center gap-2 border-b-2 border-primary pb-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl sm:text-2xl font-bold font-tamil text-foreground">
              இவ்விதழில் வெளியான கட்டுரைகள் (Articles in this Issue)
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {articles.map((art) => (
              <ArticleCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
