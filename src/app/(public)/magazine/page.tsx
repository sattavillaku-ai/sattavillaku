'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { BookOpen, Calendar, Filter, Search, ArrowRight } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue } from '@/types';
import { IssueCard } from '@/components/issue-card';
import { EmptyState } from '@/components/empty-state';

export default function MagazinePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  useEffect(() => {
    const all = dataService.getIssues();
    setIssues(all);
  }, []);

  const currentIssue = issues.find((i) => i.status === 'published') || issues[0];
  const previousIssues = issues.filter((i) => i.id !== currentIssue?.id);

  const availableYears = Array.from(new Set(issues.map((i) => i.year))).sort((a, b) => b - a);

  const filteredIssues = previousIssues.filter((issue) => {
    const matchesYear = selectedYear === 'all' || issue.year.toString() === selectedYear;
    const matchesSearch =
      searchQuery.trim() === '' ||
      issue.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.issueNumber.toString().includes(searchQuery);
    return matchesYear && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Page Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <BookOpen className="w-4 h-4" />
          <span>சட்டவிளக்கு மாத இதழ்கள்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          இதழ்கள் தொகுப்பு (Magazine Archive)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-2 font-tamil max-w-3xl leading-relaxed">
          சட்டம், அரசியல் மற்றும் சமூக விழிப்புணர்வு குறித்த சிறப்புக் கட்டுரைகளைத் தாங்கி வெளிவரும் சட்டவிளக்கு அச்சு மற்றும் டிஜிட்டல் மாத இதழ்களை வாசியுங்கள்.
        </p>
      </div>

      {/* Current Issue Hero */}
      {currentIssue && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold font-tamil text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary" />
              தற்போதைய இதழ் (Current Issue)
            </h2>
            <Link
              href="/magazine/current"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>முழு விவரம்</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <IssueCard issue={currentIssue} featured />
        </section>
      )}

      {/* Previous Issues & Filtering */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold font-tamil text-foreground">
              முந்தைய இதழ்கள் (Previous Editions)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              ஆண்டு வாரியாக இதழ்களைத் தேர்ந்தெடுக்கவும்
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search within issues */}
            <div className="relative">
              <input
                type="text"
                placeholder="இதழ் தலைப்பு / எண்..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 pr-3 py-1.5 rounded-md border border-border bg-card text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary w-48 sm:w-56"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>

            {/* Year selector */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-md border border-border text-xs">
              <button
                type="button"
                onClick={() => setSelectedYear('all')}
                className={`px-2.5 py-1 rounded-xs font-semibold transition-colors ${
                  selectedYear === 'all'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                அனைத்தும்
              </button>
              {availableYears.map((year) => (
                <button
                  key={year}
                  type="button"
                  onClick={() => setSelectedYear(year.toString())}
                  className={`px-2.5 py-1 rounded-xs font-semibold transition-colors ${
                    selectedYear === year.toString()
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {year}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Issue Cards Grid */}
        {filteredIssues.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredIssues.map((issue) => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="இதழ்கள் எதுவும் கிடைக்கவில்லை"
            description="நீங்கள் குறிப்பிட்ட ஆண்டு அல்லது தேடல் சொல்லிற்குரிய இதழ்கள் எதுவும் இல்லை."
            actionText="வடிகட்டலை மீட்டமை"
            onAction={() => {
              setSelectedYear('all');
              setSearchQuery('');
            }}
          />
        )}
      </section>
    </div>
  );
}
