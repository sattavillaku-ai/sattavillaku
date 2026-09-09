'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Newspaper, Search, Filter, Sparkles, Clock, Calendar } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Article, Category } from '@/types';
import { ArticleCard } from '@/components/article-card';
import { FeaturedArticle } from '@/components/featured-article';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    setArticles(dataService.getPublishedArticles());
    setCategories(dataService.getCategories());
  }, []);

  const featuredArticle = articles.find((a) => a.featured) || articles[0];

  const filtered = articles.filter((art) => {
    const matchesCategory =
      selectedCategory === 'all' || art.category.toLowerCase() === selectedCategory.toLowerCase();
    const matchesSearch =
      searchQuery.trim() === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedArticles = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="border-b-2 border-primary pb-4">
        <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
          <Newspaper className="w-4 h-4" />
          <span>சட்டவிளக்கு கட்டுரைக் களஞ்சியம்</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground">
          ஆய்வுக் கட்டுரைகள் (Articles & Analysis)
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-3xl leading-relaxed">
          சட்டம், அரசியலமைப்பு, நீதிமன்றத் தீர்ப்புகள், மற்றும் சமூகம் குறித்த நடுநிலையான சட்ட வல்லுநர்களின் ஆய்வுக் கட்டுரைகள்.
        </p>
      </div>

      {/* Featured Spotlight (only on page 1 without filters) */}
      {currentPage === 1 && selectedCategory === 'all' && searchQuery === '' && featuredArticle && (
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-primary">
            <Sparkles className="w-4 h-4" />
            <span>தலையங்க சிறப்புக் கட்டுரை</span>
          </div>
          <FeaturedArticle article={featuredArticle} />
        </section>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card border border-border p-4 rounded-lg shadow-2xs">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0">
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('all');
              setCurrentPage(1);
            }}
            className={`px-3 py-1.5 rounded-xs text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            }`}
          >
            அனைத்தும்
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => {
                setSelectedCategory(cat.slug);
                setCurrentPage(1);
              }}
              className={`px-3 py-1.5 rounded-xs text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.nameTamil}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative shrink-0 md:w-64">
          <input
            type="text"
            placeholder="கட்டுரைகளைத் தேட..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>
      </div>

      {/* Articles Grid */}
      {paginatedArticles.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((art) => (
              <ArticleCard key={art.id} article={art} layout="standard" />
            ))}
          </div>

          {totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={(p) => setCurrentPage(p)}
            />
          )}
        </div>
      ) : (
        <EmptyState
          title="கட்டுரைகள் எதுவும் கிடைக்கவில்லை"
          description="நீங்கள் தேர்ந்தெடுத்த பிரிவு அல்லது தேடல் சொல்லிற்குரிய கட்டுரைகள் எதுவும் இல்லை."
          actionText="வடிகட்டலை மீட்டமை"
          onAction={() => {
            setSelectedCategory('all');
            setSearchQuery('');
            setCurrentPage(1);
          }}
        />
      )}
    </div>
  );
}
