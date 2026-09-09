'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, ArrowLeft } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';
import { NewsCard } from '@/components/news-card';
import { EmptyState } from '@/components/empty-state';

export default function TamilNaduNewsPage() {
  const [tnNews, setTnNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    setTnNews(dataService.getNewsByCategory('tamil-nadu'));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-primary">முகப்பு</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-primary">செய்திகள்</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">தமிழ்நாடு</span>
      </nav>

      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <MapPin className="w-4 h-4" />
          <span>மாநில நடப்புகள்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          தமிழ்நாடு செய்திகள் (Tamil Nadu News)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-3xl leading-relaxed">
          தலைமைச் செயலக கொள்கை முடிவுகள், நலவாரிய அறிவிப்புகள், மாவட்ட ஆட்சித்துறை நடவடிக்கைகள் மற்றும் தமிழக மக்கள் நலச் செய்திகள்.
        </p>
      </div>

      {/* Grid */}
      {tnNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tnNews.map((item) => (
            <NewsCard key={item.id} news={item} variant="grid" />
          ))}
        </div>
      ) : (
        <EmptyState
          title="தமிழ்நாடு செய்திகள் எதுவும் இல்லை"
          description="இப்பிரிவில் செய்திகள் விரைவில் சேர்க்கப்படும்."
          actionText="அனைத்து செய்திகளுக்கும் செல்ல"
          actionHref="/news"
        />
      )}
    </div>
  );
}
