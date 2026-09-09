'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, PlusCircle, Search, Edit, Trash2, Eye, Filter, CheckCircle } from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Article } from '@/types';
import { StatusBadge } from '@/components/status-badge';
import { CategoryBadge } from '@/components/category-badge';
import { formatDateTamil } from '@/lib/utils';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [notification, setNotification] = useState('');

  useEffect(() => {
    setArticles(dataService.getArticles());
  }, []);

  const handleTogglePublish = (article: Article) => {
    const updated: Article = {
      ...article,
      status: article.status === 'published' ? 'draft' : 'published',
    };
    dataService.saveArticle(updated);
    setArticles(dataService.getArticles());
    setNotification(`"${article.title.slice(0, 30)}..." நிலை மாற்றப்பட்டது.`);
    setTimeout(() => setNotification(''), 3000);
  };

  const handleDelete = (id: string) => {
    if (confirm('இந்தக் கட்டுரையை நிச்சயமாக நீக்க வேண்டுமா?')) {
      dataService.deleteArticle(id);
      setArticles(dataService.getArticles());
      setNotification('கட்டுரை வெற்றிகரமாக நீக்கப்பட்டது.');
      setTimeout(() => setNotification(''), 3000);
    }
  };

  const filtered = articles.filter((art) => {
    const matchesSearch =
      searchQuery.trim() === '' ||
      art.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      art.author.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCat = selectedCategory === 'all' || art.category === selectedCategory;
    const matchesStat = selectedStatus === 'all' || art.status === selectedStatus;
    return matchesSearch && matchesCat && matchesStat;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            கட்டுரைகள் மேலாண்மை (Articles CMS)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            இணையதளம் மற்றும் மாத இதழ் கட்டுரைகளை உருவாக்குதல், திருத்துதல், மற்றும் பிரசுரித்தல்
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
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

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-md shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="கட்டுரை தலைப்பு / எழுத்தாளர் பெயர் கொண்டு தேட..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
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
            <option value="law">சட்டம்</option>
            <option value="politics">அரசியல்</option>
            <option value="tamil-nadu">தமிழ்நாடு</option>
            <option value="india">இந்தியா</option>
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
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs divide-y divide-border">
            <thead className="bg-muted/50 text-muted-foreground font-semibold">
              <tr>
                <th className="p-3.5">படம்</th>
                <th className="p-3.5">தலைப்பு & பிரிவு</th>
                <th className="p-3.5">எழுத்தாளர்</th>
                <th className="p-3.5">தேதி</th>
                <th className="p-3.5">நிலை</th>
                <th className="p-3.5 text-right">செயல்கள்</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {filtered.map((article) => (
                <tr key={article.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3.5">
                    <img
                      src={article.heroImage}
                      alt={article.title}
                      className="w-14 h-10 object-cover rounded-xs border border-border shadow-xs"
                    />
                  </td>
                  <td className="p-3.5 max-w-sm">
                    <div className="flex items-center gap-1.5 mb-1">
                      <CategoryBadge category={article.category} nameTamil={article.categoryNameTamil} size="sm" />
                      {article.featured && (
                        <span className="text-[10px] bg-primary/15 text-primary px-1.5 py-0.5 rounded-xs font-bold">
                          சிறப்புக் கட்டுரை
                        </span>
                      )}
                    </div>
                    <div className="font-bold text-foreground line-clamp-1">
                      {article.title}
                    </div>
                  </td>
                  <td className="p-3.5 text-foreground whitespace-nowrap">
                    {article.author.name}
                  </td>
                  <td className="p-3.5 text-muted-foreground whitespace-nowrap">
                    {formatDateTamil(article.publishedAt)}
                  </td>
                  <td className="p-3.5 whitespace-nowrap">
                    <StatusBadge status={article.status} />
                  </td>
                  <td className="p-3.5 text-right whitespace-nowrap space-x-2">
                    <Link
                      href={`/articles/${article.slug}`}
                      target="_blank"
                      className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-primary hover:bg-muted inline-block"
                      title="முன்னோட்டம்"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleTogglePublish(article)}
                      className={`px-2 py-1 rounded-xs text-[11px] font-bold border transition-colors ${
                        article.status === 'published'
                          ? 'border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300'
                          : 'border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300'
                      }`}
                    >
                      {article.status === 'published' ? 'நிறுத்து' : 'வெளியிடு'}
                    </button>

                    <Link
                      href={`/admin/articles/${article.id}`}
                      className="p-1.5 rounded-xs border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-muted inline-block"
                      title="திருத்து"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>

                    <button
                      type="button"
                      onClick={() => handleDelete(article.id)}
                      className="p-1.5 rounded-xs border border-border bg-card text-destructive hover:bg-destructive/10 inline-block"
                      title="நீக்கு"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
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
