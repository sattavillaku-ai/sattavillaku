'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Sparkles, Filter, CheckCircle, ExternalLink, Flame } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { CategoryBadge } from '@/components/category-badge';
import { formatDateTamil, formatTimeTamil } from '@/lib/utils';

export default function AdminNewsPage() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    // Combine published and review items for complete overview
    const published = dataService.getNews();
    const reviews = dataService.getNewsReviewItems();
    setAllNews([...reviews, ...published]);
  }, []);

  const filtered = allNews.filter((item) => {
    const matchesStat = selectedStatus === 'all' || item.status === selectedStatus;
    const matchesCat = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesStat && matchesCat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            செய்தி ஓடை மேலாண்மை (Collected News Feed)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            பல்வேறு நீதிமன்றங்கள், அரசு செய்தி வெளியீடுகள், மற்றும் இணைய மூலங்களிலிருந்து சேகரிக்கப்பட்ட செய்திகள்
          </p>
        </div>

        <Link
          href="/admin/news/review"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors shadow-xs"
        >
          <Sparkles className="w-4 h-4" />
          <span>AI செய்தி சரிபார்ப்புக் கூடம் (Review Pipeline)</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-card border border-border p-3 rounded-md shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">நிலை வடிகட்டல்:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
          >
            <option value="all">அனைத்து நிலைகளும்</option>
            <option value="review">ஆய்வில் உள்ளவை (Review)</option>
            <option value="published">வெளியிடப்பட்டவை (Published)</option>
            <option value="collected">சேகரிக்கப்பட்டவை (Collected)</option>
            <option value="processing">செயலாக்கத்தில் (Processing)</option>
            <option value="draft">வரைவுகள் (Draft)</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-foreground">பிரிவு:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
          >
            <option value="all">அனைத்துப் பிரிவுகள்</option>
            <option value="law">சட்டம்</option>
            <option value="politics">அரசியல்</option>
            <option value="tamil-nadu">தமிழ்நாடு</option>
            <option value="india">இந்தியா</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-border">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">மூலம் (Source)</th>
                <th className="p-3.5">தலைப்பு (Headline)</th>
                <th className="p-3.5">பிரிவு</th>
                <th className="p-3.5">தேதி & நேரம்</th>
                <th className="p-3.5">பொருத்தம் (Score)</th>
                <th className="p-3.5">நிலை (Status)</th>
                <th className="p-3.5 text-right">செயல்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5 font-medium text-foreground whitespace-nowrap">
                    {item.source}
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <div className="font-bold text-foreground line-clamp-1">
                      {item.headline}
                    </div>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5">
                      {item.summary}
                    </div>
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <CategoryBadge category={item.category} nameTamil={item.categoryNameTamil} size="sm" />
                  </td>
                  <td className="p-3.5 whitespace-nowrap text-muted-foreground">
                    {formatTimeTamil(item.publishedAt)} | {formatDateTamil(item.publishedAt)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {item.relevanceScore}%
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap">
                    {item.status === 'review' ? (
                      <Link
                        href="/admin/news/review"
                        className="px-2.5 py-1 rounded-xs bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold hover:bg-amber-500/20 text-[11px]"
                      >
                        ஆய்வு செய் &rarr;
                      </Link>
                    ) : (
                      <Link
                        href={`/news/${item.category}`}
                        target="_blank"
                        className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-primary inline-block"
                        title="தளத்தில் பார்க்க"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
