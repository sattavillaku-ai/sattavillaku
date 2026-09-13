'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  PlusCircle,
  Search,
  Edit,
  Trash2,
  Eye,
  CheckCircle,
  AlertCircle,
  Loader2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { Article, Category } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { CategoryBadge } from '@/components/category-badge';
import { formatDateTamil } from '@/lib/utils';
import {
  fetchArticles,
  fetchCategories,
  deleteArticle,
  toggleArticlePublish
} from '@/lib/cms-service';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedSort, setSelectedSort] = useState<'published_at' | 'created_at' | 'views' | 'oldest' | 'updated_at'>('published_at');
  const [notification, setNotification] = useState<string | null>(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [fetchedArticles, fetchedCategories] = await Promise.all([
        fetchArticles({
          status: selectedStatus,
          categoryId: selectedCategory,
          search: searchQuery,
          sortBy: selectedSort,
        }),
        fetchCategories(),
      ]);
      setArticles(fetchedArticles);
      setCategories(fetchedCategories);
    } catch (err: any) {
      console.error('Error loading articles in CMS:', err);
      setError(err.message || 'கட்டுரைகளை ஏற்றுவதில் பிழை ஏற்பட்டது.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedStatus, selectedCategory, selectedSort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadData();
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const showToast = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const handleTogglePublish = async (article: Article) => {
    try {
      setActionLoadingId(article.id);
      const newStatus = await toggleArticlePublish(article.id, article.status);
      showToast(
        newStatus === 'published'
          ? `"${article.title.slice(0, 30)}..." பிரசுரிக்கப்பட்டது.`
          : `"${article.title.slice(0, 30)}..." வரைவுக்கு மாற்றப்பட்டது.`
      );
      await loadData();
    } catch (err: any) {
      alert(err.message || 'கட்டுரை நிலையை மாற்ற முடியவில்லை.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleDelete = async (article: Article) => {
    const confirmed = window.confirm(
      `"${article.title}" கட்டுரையை நிச்சயமாக நீக்க வேண்டுமா?\n\nகவனிக்க: தொடர்புடைய குறிச்சொற்கள் இணைப்பும் நீக்கப்படும். இந்த செயலை மாற்றியமைக்க முடியாது.`
    );
    if (!confirmed) return;

    try {
      setActionLoadingId(article.id);
      await deleteArticle(article.id);
      showToast('கட்டுரை வெற்றிகரமாக நீக்கப்பட்டது.');
      await loadData();
    } catch (err: any) {
      alert(err.message || 'கட்டுரையை நீக்க முடியவில்லை.');
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" />
            <span>கட்டுரைகள் மேலாண்மை (Articles CMS)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            இணையதளம் மற்றும் மாத இதழ் கட்டுரைகளை உருவாக்குதல், திருத்துதல் மற்றும் பிரசுரித்தல் (Supabase Database Active)
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs shrink-0 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>புதிய கட்டுரை எழுது (Write Article)</span>
        </Link>
      </div>

      {notification && (
        <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2 animate-in fade-in">
          <CheckCircle className="w-4 h-4 shrink-0" />
          <span>{notification}</span>
        </div>
      )}

      {error && (
        <div className="p-3 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-md shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="கட்டுரை தலைப்பு / எழுத்தாளர் கொண்டு தேட..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
          >
            <option value="all">அனைத்துப் பிரிவுகள்</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name} ({cat.name_en || cat.slug})
              </option>
            ))}
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
          >
            <option value="all">அனைத்து நிலைகள்</option>
            <option value="published">வெளியிடப்பட்டவை</option>
            <option value="draft">வரைவுகள்</option>
          </select>

          <select
            value={selectedSort}
            onChange={(e) => setSelectedSort(e.target.value as any)}
            className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
          >
            <option value="published_at">புதியது முதலில் (Newest)</option>
            <option value="oldest">பழையது முதலில் (Oldest)</option>
            <option value="views">அதிகம் வாசிக்கப்பட்டவை (Most Viewed)</option>
            <option value="updated_at">சமீபத்தில் புதுப்பிக்கப்பட்டவை</option>
          </select>
        </div>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="p-12 text-center bg-card border border-border rounded-lg text-muted-foreground flex items-center justify-center gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>கட்டுரைகள் ஏற்றப்படுகின்றன...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && articles.length === 0 && (
        <div className="p-12 text-center bg-card border border-border rounded-lg text-muted-foreground text-xs space-y-3">
          <FileText className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">கட்டுரைகள் எதுவும் கிடைக்கவில்லை.</p>
          <p className="text-xs max-w-sm mx-auto">
            {searchQuery || selectedCategory !== 'all' || selectedStatus !== 'all'
              ? 'உங்கள் வடிகட்டலுக்கு ஏற்ப கட்டுரைகள் எதுவும் இல்லை. வடிப்பானை மாற்ற முயற்சிக்கவும்.'
              : 'தரவுத்தளத்தில் கட்டுரைகள் எதுவும் இல்லை. புதிய கட்டுரை எழுதி வெளியிடவும்.'}
          </p>
          <Link
            href="/admin/articles/new"
            className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary text-primary-foreground text-xs font-bold rounded-md hover:bg-primary/90"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>முதல் கட்டுரையை எழுது</span>
          </Link>
        </div>
      )}

      {/* Table */}
      {!loading && articles.length > 0 && (
        <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs divide-y divide-border">
              <thead className="bg-muted/50 text-muted-foreground font-semibold">
                <tr>
                  <th className="p-3.5">படம்</th>
                  <th className="p-3.5">தலைப்பு & பிரிவு</th>
                  <th className="p-3.5">எழுத்தாளர்</th>
                  <th className="p-3.5">தேதி</th>
                  <th className="p-3.5">பார்வைகள்</th>
                  <th className="p-3.5">நிலை</th>
                  <th className="p-3.5 text-right">செயல்கள்</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {articles.map((article) => {
                  const isActionBusy = actionLoadingId === article.id;
                  return (
                    <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3.5">
                        <img
                          src={
                            article.hero_image_url ||
                            article.heroImage ||
                            'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80'
                          }
                          alt={article.title}
                          className="w-14 h-10 object-cover rounded-xs border border-border shadow-xs shrink-0"
                        />
                      </td>
                      <td className="p-3.5 max-w-sm">
                        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
                          <CategoryBadge
                            category={article.category}
                            nameTamil={article.categoryNameTamil}
                            size="sm"
                          />
                          {article.featured && (
                            <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-xs font-bold flex items-center gap-1">
                              <Sparkles className="w-2.5 h-2.5" />
                              <span>சிறப்புக் கட்டுரை</span>
                            </span>
                          )}
                        </div>
                        <div className="font-bold text-foreground line-clamp-2 leading-snug">
                          {article.title}
                        </div>
                        {article.slug && (
                          <div className="text-[10px] text-muted-foreground font-sans truncate mt-0.5">
                            /{article.slug}
                          </div>
                        )}
                      </td>
                      <td className="p-3.5 text-foreground whitespace-nowrap">
                        {article.author?.name || article.author_name || 'ஆசிரியர் குழு'}
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap text-[11px]">
                        <div className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{formatDateTamil(article.published_at || article.created_at || '')}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-muted-foreground whitespace-nowrap text-[11px] font-mono">
                        {(article.views || 0).toLocaleString()}
                      </td>
                      <td className="p-3.5 whitespace-nowrap">
                        <StatusBadge status={article.status} />
                      </td>
                      <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                        {/* Preview */}
                        <Link
                          href={`/articles/${article.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-primary hover:bg-muted inline-block cursor-pointer"
                          title="முன்னோட்டம் (Preview)"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Link>

                        {/* Toggle Publish */}
                        <button
                          type="button"
                          disabled={isActionBusy}
                          onClick={() => handleTogglePublish(article)}
                          className={`px-2 py-1 rounded-xs text-[11px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${
                            article.status === 'published'
                              ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 hover:bg-amber-100'
                              : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
                          }`}
                        >
                          {isActionBusy ? (
                            <Loader2 className="w-3 h-3 animate-spin inline" />
                          ) : article.status === 'published' ? (
                            'நிறுத்து'
                          ) : (
                            'வெளியிடு'
                          )}
                        </button>

                        {/* Edit */}
                        <Link
                          href={`/admin/articles/${article.id}`}
                          className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-block cursor-pointer"
                          title="திருத்து (Edit)"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </Link>

                        {/* Delete */}
                        <button
                          type="button"
                          disabled={isActionBusy}
                          onClick={() => handleDelete(article)}
                          className="p-1.5 rounded-xs border border-border bg-card text-destructive hover:bg-destructive/10 inline-block cursor-pointer disabled:opacity-50"
                          title="நீக்கு (Delete)"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
