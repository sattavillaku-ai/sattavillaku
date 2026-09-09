'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Archive, Search, Filter, BookOpen } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue } from '@/types';
import { IssueCard } from '@/components/issue-card';
import { EmptyState } from '@/components/empty-state';

export default function MagazineArchivePage() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    setIssues(dataService.getIssues());
  }, []);

  const years = Array.from(new Set(issues.map((i) => i.year))).sort((a, b) => b - a);
  const months = ['அனைத்தும்', 'ஜனவரி', 'பிப்ரவரி', 'மார்ச்', 'ஏப்ரல்', 'மே', 'ஜூன்', 'ஜூலை', 'ஆகஸ்ட்', 'செப்டம்பர்', 'அக்டோபர்', 'நவம்பர்', 'டிசம்பர்'];

  const filtered = issues.filter((issue) => {
    const matchesYear = selectedYear === 'all' || issue.year.toString() === selectedYear;
    const matchesMonth = selectedMonth === 'all' || selectedMonth === 'அனைத்தும்' || issue.month === selectedMonth;
    const matchesQuery =
      query.trim() === '' ||
      issue.title.toLowerCase().includes(query.toLowerCase()) ||
      issue.description.toLowerCase().includes(query.toLowerCase()) ||
      issue.issueNumber.toString().includes(query);
    return matchesYear && matchesMonth && matchesQuery;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-primary">முகப்பு</Link>
        <span>/</span>
        <Link href="/magazine" className="hover:text-primary">இதழ்கள்</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">காப்பகம் (Archive)</span>
      </nav>

      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Archive className="w-4 h-4" />
          <span>சட்டவிளக்கு வரலாற்றுத் தொகுப்புகள்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          இதழ் காப்பகம் (Magazine Archive)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil">
          ஆண்டுகள் மற்றும் மாதங்கள் வாரியாக சட்டவிளக்கு பழைய இதழ்களைத் தேடி வாசியுங்கள்.
        </p>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-6 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Query input */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground font-tamil">சொல் தேடல்:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="தலைப்பு / எண்..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Year selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground font-tamil">ஆண்டு:</label>
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">அனைத்து ஆண்டுகள்</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month selector */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground font-tamil">மாதம்:</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
            >
              {months.map((m) => (
                <option key={m} value={m === 'அனைத்தும்' ? 'all' : m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {filtered.map((issue) => (
            <IssueCard key={issue.id} issue={issue} />
          ))}
        </div>
      ) : (
        <EmptyState
          title="காப்பகத்தில் இதழ்கள் எதுவும் கிடைக்கவில்லை"
          description="நீங்கள் தேர்ந்தெடுத்த ஆண்டு அல்லது மாதத்திற்கான இதழ்கள் எதுவும் கிடைக்கவில்லை."
          actionText="வடிகட்டலை மீட்டமைக்க"
          onAction={() => {
            setSelectedYear('all');
            setSelectedMonth('all');
            setQuery('');
          }}
        />
      )}
    </div>
  );
}
