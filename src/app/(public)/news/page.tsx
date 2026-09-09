'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Flame, Clock, Scale, Landmark, MapPin, Globe, Filter } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';
import { NewsCard } from '@/components/news-card';
import { EmptyState } from '@/components/empty-state';

export default function DailyNewsPage() {
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    setAllNews(dataService.getPublishedNews());
  }, []);

  const categories = [
    { id: 'all', label: 'அனைத்து செய்திகள்', icon: Newspaper },
    { id: 'law', label: 'சட்டம் & நீதிமன்றம்', icon: Scale, href: '/news/law' },
    { id: 'politics', label: 'அரசியல் களநிலவரம்', icon: Landmark, href: '/news/politics' },
    { id: 'tamil-nadu', label: 'தமிழ்நாடு செய்திகள்', icon: MapPin, href: '/news/tamil-nadu' },
    { id: 'india', label: 'தேசிய செய்திகள்', icon: Globe, href: '/news/india' },
  ];

  const filteredNews =
    selectedCategory === 'all'
      ? allNews
      : allNews.filter((n) => n.category.toLowerCase() === selectedCategory.toLowerCase());

  const leadNews = filteredNews[0];
  const remainingNews = filteredNews.slice(1);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Page Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Newspaper className="w-4 h-4" />
          <span>சட்டவிளக்கு அன்றாடச் செய்திக் களம்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          தினசரி செய்திகள் (Daily Digital News)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-3xl leading-relaxed">
          உச்ச நீதிமன்றம், சென்னை உயர் நீதிமன்றம், தமிழ்நாடு அரசு மற்றும் தேசிய அரசியல் நகர்வுகளின் உடனுக்குடனான நம்பகமான செய்திகள்.
        </p>
      </div>

      {/* Category Navigation Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/70">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = selectedCategory === cat.id;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xs text-xs font-bold whitespace-nowrap transition-all ${
                isSelected
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-card border border-border text-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Lead Story */}
      {leadNews && (
        <section className="space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-primary">
            <Flame className="w-4 h-4" />
            <span>தலையங்க செய்தி (Lead Story)</span>
          </div>
          <NewsCard news={leadNews} variant="lead" />
        </section>
      )}

      {/* News Grid */}
      {remainingNews.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-xl font-bold font-tamil text-foreground border-b border-border pb-2">
            மேலும் முக்கிய செய்திகள்
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {remainingNews.map((item) => (
              <NewsCard key={item.id} news={item} variant="grid" />
            ))}
          </div>
        </section>
      ) : (
        !leadNews && (
          <EmptyState
            title="செய்திகள் எதுவும் கிடைக்கவில்லை"
            description="நீங்கள் தேர்ந்தெடுத்த பிரிவில் தற்சமயம் செய்திகள் எதுவும் பதிவாகவில்லை."
            actionText="அனைத்து செய்திகளுக்கும் செல்ல"
            onAction={() => setSelectedCategory('all')}
          />
        )
      )}
    </div>
  );
}
