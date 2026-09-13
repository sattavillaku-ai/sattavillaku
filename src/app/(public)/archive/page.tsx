'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Archive,
  Search,
  Calendar,
  Layers,
  ChevronRight,
  BookOpen,
  Newspaper,
  Loader2
} from 'lucide-react';
import { Article, Category } from '@/types';
import { fetchArticles, fetchCategories } from '@/lib/cms-service';
import { ArticleCard } from '@/components/article-card';
import { EmptyState } from '@/components/empty-state';
import { Pagination } from '@/components/pagination';

export default function ArticleArchivePage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedYear, setSelectedYear] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const [arts, cats] = await Promise.all([
          fetchArticles({ status: 'published', sortBy: 'published_at' }),
          fetchCategories(),
        ]);
        setArticles(arts);
        setCategories(cats);
      } catch (err) {
        console.error('Error loading article archive:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Compute available years from published articles
  const years = Array.from(
    new Set(
      articles
        .map((a) => {
          const d = a.published_at || a.created_at;
          return d ? new Date(d).getFullYear() : null;
        })
        .filter(Boolean) as number[]
    )
  ).sort((a, b) => b - a);

  const months = [
    { num: 'all', name: 'அனைத்து மாதங்கள்' },
    { num: '0', name: 'ஜனவரி (Jan)' },
    { num: '1', name: 'பிப்ரவரி (Feb)' },
    { num: '2', name: 'மார்ச் (Mar)' },
    { num: '3', name: 'ஏப்ரல் (Apr)' },
    { num: '4', name: 'மே (May)' },
    { num: '5', name: 'ஜூன் (Jun)' },
    { num: '6', name: 'ஜூலை (Jul)' },
    { num: '7', name: 'ஆகஸ்ட் (Aug)' },
    { num: '8', name: 'செப்டம்பர் (Sep)' },
    { num: '9', name: 'அக்டோபர் (Oct)' },
    { num: '10', name: 'நவம்பர் (Nov)' },
    { num: '11', name: 'டிசம்பர் (Dec)' },
  ];

  const filtered = articles.filter((art) => {
    const d = art.published_at || art.created_at;
    const artDate = d ? new Date(d) : null;

    // Year filter
    if (selectedYear !== 'all' && artDate) {
      if (artDate.getFullYear().toString() !== selectedYear) return false;
    }

    // Month filter
    if (selectedMonth !== 'all' && artDate) {
      if (artDate.getMonth().toString() !== selectedMonth) return false;
    }

    // Category filter
    if (selectedCategory !== 'all') {
      if (art.category.toLowerCase() !== selectedCategory.toLowerCase()) return false;
    }

    // Search filter
    if (searchQuery.trim()) {
      const term = searchQuery.toLowerCase().trim();
      const matchTitle = art.title.toLowerCase().includes(term);
      const matchExcerpt = art.excerpt.toLowerCase().includes(term);
      const matchAuthor = art.author?.name.toLowerCase().includes(term);
      if (!matchTitle && !matchExcerpt && !matchAuthor) return false;
    }

    return true;
  });

  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginatedArticles = filtered.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 font-tamil">
      {/* Breadcrumb */}
      <nav className="text-xs text-muted-foreground flex items-center gap-2">
        <Link href="/" className="hover:text-primary">முகப்பு</Link>
        <span>/</span>
        <Link href="/articles" className="hover:text-primary">கட்டுரைகள்</Link>
        <span>/</span>
        <span className="text-foreground font-semibold">வரலாற்று காப்பகம் (Historical Archive)</span>
      </nav>

      {/* Header */}
      <div className="border-b-2 border-primary pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-primary text-xs font-bold uppercase tracking-wider mb-1">
            <Archive className="w-4 h-4" />
            <span>சட்டவிளக்கு ஆய்வுக் கட்டுரைக் காப்பகம்</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            கட்டுரை வரலாற்று காப்பகம் (Article Archive)
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 max-w-3xl leading-relaxed">
            சட்டவிளக்கில் வெளியான அனைத்து வரலாற்று ஆழமான கட்டுரைகளும் நிரந்தரமாகப் பாதுகாக்கப்படுகின்றன. ஆண்டுகள், மாதங்கள் மற்றும் பிரிவுகள் வாரியாக ஆராயலாம்.
          </p>
        </div>

        <Link
          href="/magazine/archive"
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md border border-border bg-card hover:bg-muted text-xs font-bold text-foreground transition-colors shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5 text-primary" />
          <span>இதழ் காப்பகம் செல்ல &rarr;</span>
        </Link>
      </div>

      {/* Filter and Discovery Toolbar */}
      <div className="bg-card border border-border rounded-lg p-4 sm:p-5 shadow-2xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">சொல் தேடல்:</label>
            <div className="relative">
              <input
                type="text"
                placeholder="கட்டுரை தலைப்பு / எழுத்தாளர்..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full pl-8 pr-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
              />
              <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
            </div>
          </div>

          {/* Year */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">ஆண்டு (Year):</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
            >
              <option value="all">அனைத்து ஆண்டுகள்</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>
                  {y}
                </option>
              ))}
            </select>
          </div>

          {/* Month */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">மாதம் (Month):</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
            >
              {months.map((m) => (
                <option key={m.num} value={m.num}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1">
            <label className="font-bold text-foreground">பிரிவு (Category):</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
            >
              <option value="all">அனைத்துப் பிரிவுகள்</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug}>
                  {c.nameTamil || c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filter Indicators */}
        <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
          <div>
            மொத்தம் <strong>{filtered.length}</strong> வரலாற்று கட்டுரைகள் உள்ளன.
          </div>
          {(selectedYear !== 'all' || selectedMonth !== 'all' || selectedCategory !== 'all' || searchQuery) && (
            <button
              type="button"
              onClick={() => {
                setSelectedYear('all');
                setSelectedMonth('all');
                setSelectedCategory('all');
                setSearchQuery('');
                setCurrentPage(1);
              }}
              className="text-primary hover:underline font-bold cursor-pointer"
            >
              அனைத்து வடிகட்டல்களையும் மீட்டமை
            </button>
          )}
        </div>
      </div>

      {/* Content Section */}
      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 gap-3 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <span className="text-xs">வரலாற்று காப்பகக் கட்டுரைகள் ஏற்றப்படுகின்றன...</span>
        </div>
      ) : paginatedArticles.length === 0 ? (
        <EmptyState
          title="காப்பகத்தில் கட்டுரைகள் எதுவும் கிடைக்கவில்லை"
          description="நீங்கள் தேர்ந்தெடுத்த ஆண்டு, மாதம் அல்லது சொல்லிற்கான கட்டுரைகள் எதுவும் இல்லை."
          actionText="அனைத்துக் கட்டுரைகளையும் பார்"
          onAction={() => {
            setSelectedYear('all');
            setSelectedMonth('all');
            setSelectedCategory('all');
            setSearchQuery('');
            setCurrentPage(1);
          }}
        />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedArticles.map((article) => (
              <ArticleCard key={article.id} article={article} layout="standard" />
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
      )}
    </div>
  );
}
