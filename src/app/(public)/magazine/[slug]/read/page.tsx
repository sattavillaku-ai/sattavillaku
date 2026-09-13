'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, BookOpen, Share2, Loader2, Calendar } from 'lucide-react';
import { Issue } from '@/types';
import { fetchIssueBySlug } from '@/lib/cms-service';
import { PDFReader } from '@/components/pdf-reader';
import { ShareButtons } from '@/components/share-buttons';
import { EmptyState } from '@/components/empty-state';

export default function DedicatedReaderPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!slug) return;
      try {
        setLoading(true);
        const found = await fetchIssueBySlug(slug);
        if (isMounted) {
          // Public visitor guard: only show published issues (admins can preview draft via admin preview)
          if (found && found.status !== 'published') {
            // Check if admin
            const res = await fetch('/api/magazine/pdf-url?slug=' + encodeURIComponent(slug));
            if (res.status === 403) {
              setIssue(null);
            } else {
              setIssue(found);
            }
          } else {
            setIssue(found);
          }
        }
      } catch (err) {
        console.error('Error loading issue for reader:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 flex flex-col items-center justify-center gap-3 text-muted-foreground font-tamil">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="text-sm">டிஜிட்டல் இதழ் ஏற்றப்படுகிறது...</span>
      </div>
    );
  }

  if (!issue) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <EmptyState
          title="இதழ் கிடைக்கவில்லை"
          description="நீங்கள் தேடிய இதழ் வெளியிடப்படவில்லை அல்லது தவறான முகவரியாகும்."
          actionText="அனைத்து இதழ்களுக்கும் திரும்புக"
          actionHref="/magazine"
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
      {/* Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border pb-3">
        <div className="flex items-center gap-3">
          <Link
            href={`/magazine/${issue.slug}`}
            className="p-2 rounded-md border border-border bg-card hover:bg-muted text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            title="இதழ் விவரங்களுக்குத் திரும்ப"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <div className="text-[11px] text-primary font-bold uppercase tracking-wider flex items-center gap-2">
              <span>இதழ் {issue.issueNumber}</span>
              <span>•</span>
              <span>{issue.month} {issue.year}</span>
              <span>•</span>
              <span>{issue.pageCount} பக்கங்கள்</span>
            </div>
            <h1 className="text-lg sm:text-xl font-bold font-tamil text-foreground line-clamp-1">
              {issue.title}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ShareButtons title={`சட்டவிளக்கு இதழ் ${issue.issueNumber} - ${issue.title}`} />
        </div>
      </div>

      {/* Embedded High-Fidelity PDF Reader */}
      <PDFReader issue={issue} />
    </div>
  );
}
