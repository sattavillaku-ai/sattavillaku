'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Globe, ArrowLeft } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';
import { NewsCard } from '@/components/news-card';
import { EmptyState } from '@/components/empty-state';

export default function IndiaNewsPage() {
  const [indiaNews, setIndiaNews] = useState<NewsItem[]>([]);

  useEffect(() => {
    setIndiaNews(dataService.getNewsByCategory('india'));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-primary">முகப்பு</Link>
        <span>/</span>
        <Link href="/news" className="hover:text-primary">செய்திகள்</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">இந்தியா</span>
      </nav>

      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Globe className="w-4 h-4" />
          <span>தேசிய களம்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          இந்திய தேசிய செய்திகள் (National News)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-3xl leading-relaxed">
          ஒன்றிய அரசு கொள்கைகள், நாடாளுமன்ற நடவடிக்கைகள், தேசிய சட்ட ஆணைய அறிக்கைகள் மற்றும் பிற மாநில முக்கிய நிகழ்வுகள்.
        </p>
      </div>

      {/* Grid */}
      {indiaNews.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {indiaNews.map((item) => (
            <NewsCard key={item.id} news={item} variant="grid" />
          ))}
        </div>
      ) : (
        <EmptyState
          title="தேசிய செய்திகள் எதுவும் இல்லை"
          description="இப்பிரிவில் செய்திகள் விரைவில் சேர்க்கப்படும்."
          actionText="அனைத்து செய்திகளுக்கும் செல்ல"
          actionHref="/news"
        />
      )}
    </div>
  );
}
