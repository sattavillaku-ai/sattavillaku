'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Scale, Filter, BookOpen, AlertCircle, ArrowLeft } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';
import { NewsCard } from '@/components/news-card';
import { EmptyState } from '@/components/empty-state';

export default function LawNewsPage() {
  const [lawNews, setLawNews] = useState<NewsItem[]>([]);
  const [subFilter, setSubFilter] = useState('all');

  useEffect(() => {
    const items = dataService.getNewsByCategory('law');
    setLawNews(items);
  }, []);

  const subCategories = [
    { id: 'all', label: 'அனைத்து சட்டச் செய்திகள்' },
    { id: 'sc', label: 'உச்ச நீதிமன்றம் (Supreme Court)' },
    { id: 'hc', label: 'சென்னை உயர் நீதிமன்றம் (Madras HC)' },
    { id: 'verdict', label: 'தீர்ப்புகள் & வழிகாட்டுதல்கள்' },
    { id: 'amendment', label: 'சட்டத் திருத்தங்கள்' },
  ];

  const filtered = lawNews.filter((item) => {
    if (subFilter === 'all') return true;
    if (subFilter === 'sc') return item.headline.includes('உச்ச') || item.content.includes('உச்ச நீதிமன்றம்');
    if (subFilter === 'hc') return item.headline.includes('உயர்') || item.content.includes('சென்னை உயர்');
    if (subFilter === 'verdict') return item.headline.includes('உத்தரவு') || item.headline.includes('தீர்ப்பு');
    if (subFilter === 'amendment') return item.headline.includes('சட்டம்') || item.content.includes('சட்ட');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-primary">முகப்பு</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-primary">செய்திகள்</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">சட்டம் & நீதிமன்றம்</span>
      </nav>

      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4" />
          <span>நீதிமன்றச் செய்திகள்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          சட்டச் செய்திகள் (Law & Judgments)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-3xl leading-relaxed">
          உச்ச நீதிமன்றம், சென்னை உயர் நீதிமன்றம், பசுமைத் தீர்ப்பாயம் மற்றும் கீழமை நீதிமன்றங்களின் முக்கிய உத்தரவுகள், தீர்ப்புகள், மற்றும் சட்ட நடைமுறை விளக்கங்கள்.
        </p>
      </div>

      {/* Forum filter pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/70">
        {subCategories.map((sub) => (
          <button
            key={sub.id}
            type="button"
            onClick={() => setSubFilter(sub.id)}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold whitespace-nowrap transition-colors ${
              subFilter === sub.id
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'bg-card border border-border text-muted-foreground hover:text-foreground'
            }`}
          >
            {sub.label}
          </button>
        ))}
      </div>

      {/* News Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((item) => (
            <NewsCard key={item.id} news={item} variant="grid" />
          ))}
        </div>
      ) : (
        <EmptyState
          title="சட்டச் செய்திகள் எதுவும் இல்லை"
          description="இப்பிரிவில் செய்திகள் விரைவில் சேர்க்கப்படும்."
          actionText="அனைத்துச் செய்திகளுக்கும் திரும்புக"
          actionHref="/news"
        />
      )}
    </div>
  );
}
