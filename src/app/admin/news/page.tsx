'use client';

import React, { useState, useEffect, useCallback, useTransition } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Newspaper,
  Sparkles,
  Filter,
  ExternalLink,
  RefreshCw,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Radio,
  Search,
  Check,
  X,
  Play,
  Activity,
  Layers,
  ShieldAlert,
  Globe,
  Database,
  SlidersHorizontal,
  ChevronRight,
  Info,
  Loader2,
  Hash,
} from 'lucide-react';
import { NewsItem, NewsSource, NewsCollectionResult } from '@/types';
import {
  fetchNewsItems,
  fetchNewsSources,
  createNewsSource,
  updateNewsSource,
  toggleNewsSourceActive,
  deleteNewsSource,
  deleteNewsItem,
  updateNewsItem,
  seedDefaultSources,
} from '@/lib/cms-service';
import { StatusBadge } from '@/components/status-badge';
import { CategoryBadge } from '@/components/category-badge';
import { formatDateTamil, formatTimeTamil } from '@/lib/utils';

export default function AdminNewsPage() {
  // Tabs: 'items' (சேகரிக்கப்பட்ட செய்திகள்) | 'sources' (செய்தி மூலங்கள்)
  const [activeTab, setActiveTab] = useState<'items' | 'sources'>('items');

  // Items State
  const [items, setItems] = useState<NewsItem[]>([]);
  const [itemsLoading, setItemsLoading] = useState(true);
  const [itemsError, setItemsError] = useState<string | null>(null);
  const [totalItems, setTotalItems] = useState(0);

  // Sources State
  const [sources, setSources] = useState<NewsSource[]>([]);
  const [sourcesLoading, setSourcesLoading] = useState(true);
  const [sourcesError, setSourcesError] = useState<string | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSourceId, setSelectedSourceId] = useState<string>('all');

  // Collection State
  const [isCollecting, setIsCollecting] = useState(false);
  const [collectionResult, setCollectionResult] = useState<NewsCollectionResult | null>(null);
  const [showResultModal, setShowResultModal] = useState(false);

  // Item Detail Modal
  const [selectedItemForView, setSelectedItemForView] = useState<NewsItem | null>(null);

  // Source Add/Edit Modal
  const [sourceModalOpen, setSourceModalOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<NewsSource | null>(null);
  const [sourceForm, setSourceForm] = useState({
    name: '',
    feed_url: '',
    category: 'law',
    region: 'India',
    priority: 80,
    active: true,
  });
  const [sourceSubmitting, setSourceSubmitting] = useState(false);

  // Test Feed Modal
  const [testModalOpen, setTestModalOpen] = useState(false);
  const [testFeedUrl, setTestFeedUrl] = useState('');
  const [testLoading, setTestLoading] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Notification Toast
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isGeneratingDraft, setIsGeneratingDraft] = useState(false);
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Generate Gemini AI Draft from News Item
  const handleGenerateDraft = async (itemId: string) => {
    try {
      setIsGeneratingDraft(true);
      showToast('Gemini AI தமிழ் வரைவு உருவாக்கப்படுகிறது...', 'success');
      const res = await fetch('/api/admin/news/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'வரைவு உருவாக்குவதில் பிழை.');
      }
      showToast('வரைவு வெற்றிகரமாக உருவாக்கப்பட்டது! ஆசிரியர் ஆய்வுக்கூடத்திற்குச் செல்கிறது...');
      setTimeout(() => {
        router.push('/admin/news/review');
      }, 1000);
    } catch (err: any) {
      showToast(err.message || 'வரைவு உருவாக்கம் தோல்வியடைந்தது.', 'error');
    } finally {
      setIsGeneratingDraft(false);
    }
  };

  // Load Sources
  const loadSources = useCallback(async () => {
    try {
      setSourcesLoading(true);
      setSourcesError(null);
      const data = await fetchNewsSources();
      setSources(data);
    } catch (err: any) {
      setSourcesError(err.message || 'செய்தி மூலங்களை ஏற்றுவதில் பிழை.');
    } finally {
      setSourcesLoading(false);
    }
  }, []);

  // Load Items
  const loadItems = useCallback(async () => {
    try {
      setItemsLoading(true);
      setItemsError(null);
      const { items: fetchedItems, total } = await fetchNewsItems({
        status: selectedStatus,
        category: selectedCategory,
        sourceId: selectedSourceId,
        search: searchQuery,
        limit: 100,
      });
      setItems(fetchedItems);
      setTotalItems(total);
    } catch (err: any) {
      setItemsError(err.message || 'செய்திகளை ஏற்றுவதில் பிழை.');
    } finally {
      setItemsLoading(false);
    }
  }, [selectedStatus, selectedCategory, selectedSourceId, searchQuery]);

  useEffect(() => {
    loadSources();
  }, [loadSources]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  // Run News Collection
  const handleRunCollection = async () => {
    try {
      setIsCollecting(true);
      const res = await fetch('/api/admin/news/collect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'செய்தி சேகரிப்பில் பிழை ஏற்பட்டது.');
      }

      setCollectionResult(data.result);
      setShowResultModal(true);
      showToast(`செய்திகள் சேகரிக்கப்பட்டன! புதிதாக: ${data.result.itemsAdded}`);
      loadItems();
    } catch (err: any) {
      showToast(err.message || 'செய்தி சேகரிப்பு தோல்வியுற்றது.', 'error');
    } finally {
      setIsCollecting(false);
    }
  };

  // Seed Default Sources
  const handleSeedSources = async () => {
    if (!confirm('அங்கீகரிக்கப்பட்ட 5 இந்திய சட்ட/செய்தி மூலங்களை சேர்க்க வேண்டுமா?')) return;
    try {
      setSourcesLoading(true);
      await seedDefaultSources();
      showToast('இயல்புநிலை செய்தி மூலங்கள் சேர்க்கப்பட்டன!');
      await loadSources();
    } catch (err: any) {
      showToast(err.message || 'மூலங்களை நிறுவுவதில் பிழை.', 'error');
    } finally {
      setSourcesLoading(false);
    }
  };

  // Toggle Source Active
  const handleToggleSourceActive = async (source: NewsSource) => {
    try {
      const updated = await toggleNewsSourceActive(source.id, !source.active);
      setSources((prev) => prev.map((s) => (s.id === source.id ? updated : s)));
      showToast(`மூலம் ${updated.active ? 'செயல்படுத்தப்பட்டது' : 'முடக்கப்பட்டது'}`);
    } catch (err: any) {
      showToast(err.message || 'நிலையை மாற்ற முடியவில்லை', 'error');
    }
  };

  // Open Add Source Modal
  const handleOpenAddSource = () => {
    setEditingSource(null);
    setSourceForm({
      name: '',
      feed_url: '',
      category: 'law',
      region: 'India',
      priority: 80,
      active: true,
    });
    setSourceModalOpen(true);
  };

  // Open Edit Source Modal
  const handleOpenEditSource = (source: NewsSource) => {
    setEditingSource(source);
    setSourceForm({
      name: source.name,
      feed_url: source.feed_url,
      category: source.category,
      region: source.region,
      priority: source.priority,
      active: source.active,
    });
    setSourceModalOpen(true);
  };

  // Save Source (Create or Update)
  const handleSaveSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceForm.name.trim() || !sourceForm.feed_url.trim()) {
      showToast('பெயர் மற்றும் RSS URL கட்டாயமாகும்.', 'error');
      return;
    }

    try {
      setSourceSubmitting(true);
      if (editingSource) {
        const updated = await updateNewsSource(editingSource.id, sourceForm);
        setSources((prev) => prev.map((s) => (s.id === editingSource.id ? updated : s)));
        showToast('செய்தி மூலம் புதுப்பிக்கப்பட்டது.');
      } else {
        const created = await createNewsSource(sourceForm);
        setSources((prev) => [created, ...prev]);
        showToast('புதிய செய்தி மூலம் சேர்க்கப்பட்டது.');
      }
      setSourceModalOpen(false);
    } catch (err: any) {
      showToast(err.message || 'செய்தி மூலத்தைச் சேமிப்பதில் பிழை.', 'error');
    } finally {
      setSourceSubmitting(false);
    }
  };

  // Delete Source
  const handleDeleteSource = async (id: string, name: string) => {
    if (!confirm(`"${name}" செய்தி மூலத்தை நிச்சயமாக நீக்க வேண்டுமா?`)) return;
    try {
      await deleteNewsSource(id);
      setSources((prev) => prev.filter((s) => s.id !== id));
      showToast('செய்தி மூலம் நீக்கப்பட்டது.');
    } catch (err: any) {
      showToast(err.message || 'மூலத்தை நீக்க முடியவில்லை.', 'error');
    }
  };

  // Delete Item
  const handleDeleteItem = async (id: string) => {
    if (!confirm('இந்த சேகரிக்கப்பட்ட செய்தியை நீக்க வேண்டுமா?')) return;
    try {
      await deleteNewsItem(id);
      setItems((prev) => prev.filter((item) => item.id !== id));
      setTotalItems((prev) => Math.max(0, prev - 1));
      if (selectedItemForView?.id === id) setSelectedItemForView(null);
      showToast('செய்தி நீக்கப்பட்டது.');
    } catch (err: any) {
      showToast(err.message || 'செய்தியை நீக்க முடியவில்லை.', 'error');
    }
  };

  // Quick Toggle Publish / Live
  const handleTogglePublish = async (item: NewsItem) => {
    try {
      const nextStatus = item.status === 'published' ? 'review' : 'published';
      await updateNewsItem(item.id, { status: nextStatus });
      setItems((prev) =>
        prev.map((it) => (it.id === item.id ? { ...it, status: nextStatus } : it))
      );
      showToast(
        nextStatus === 'published'
          ? 'செய்தி நேரலையில் வெளியிடப்பட்டது!'
          : 'செய்தி ஆய்வுக்கு மாற்றப்பட்டது.'
      );
    } catch (err: any) {
      showToast(err.message || 'செய்தி நிலையை மாற்ற முடியவில்லை.', 'error');
    }
  };

  // Run Test Feed
  const handleRunTestFeed = async (urlToTest?: string) => {
    const targetUrl = urlToTest || testFeedUrl;
    if (!targetUrl.trim()) {
      showToast('பரிசோதிக்க RSS URL ஐ உள்ளிடவும்.', 'error');
      return;
    }

    try {
      setTestLoading(true);
      setTestResult(null);
      setTestFeedUrl(targetUrl);
      setTestModalOpen(true);

      const res = await fetch('/api/admin/news/sources/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feed_url: targetUrl }),
      });
      const data = await res.json();
      setTestResult(data);
    } catch (err: any) {
      setTestResult({
        success: false,
        error: err.message || 'RSS ஓடையைச் சோதிப்பதில் பிழை.',
      });
    } finally {
      setTestLoading(false);
    }
  };

  // Counts for Stats Strip
  const lawCount = items.filter((i) => i.category_slug === 'law' || i.category === 'law' || i.category === 'சட்டம்').length;
  const tnCount = items.filter((i) => i.category_slug === 'tamil-nadu' || i.category === 'தமிழ்நாடு').length;
  const highRelevanceCount = items.filter((i) => (i.relevance_score || i.relevanceScore || 0) >= 70).length;
  const activeSourcesCount = sources.filter((s) => s.active).length;

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil pb-12">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg border text-xs font-bold transition-all animate-in fade-in slide-in-from-bottom-5 ${
            toast.type === 'error'
              ? 'bg-destructive text-destructive-foreground border-destructive/20'
              : 'bg-emerald-600 text-white border-emerald-500'
          }`}
        >
          {toast.type === 'error' ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            <span className="text-[11px] font-bold uppercase text-primary tracking-wider font-sans">
              Phase 4 • News Ingestion & Source Engine
            </span>
          </div>
          <h1 className="text-2xl font-bold text-foreground mt-1">
            செய்தி சேகரிப்பு & மூல மேலாண்மை (News Collection CMS)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            அங்கீகரிக்கப்பட்ட செய்தி மூலங்களிலிருந்து சட்ட/அரசியல் நிகழ்வுகளைத் தானாகப் பெற்று, தரம்பிரித்து, நகல்களை நீக்குகிறது.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleRunCollection}
            disabled={isCollecting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isCollecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>சேகரிக்கப்படுகிறது...</span>
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4" />
                <span>செய்திகளைச் சேகரி (Collect News)</span>
              </>
            )}
          </button>

          <Link
            href="/admin/news/review"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold hover:bg-amber-500/20 transition-colors shadow-xs"
          >
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>செய்தி ஆய்வுக்கூடம் (Review Desk)</span>
          </Link>
        </div>
      </div>

      {/* Quick Metrics Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>மொத்த செய்திகள்</span>
            <Database className="w-4 h-4 text-primary" />
          </div>
          <div className="text-xl font-bold font-mono text-foreground">{totalItems}</div>
          <p className="text-[10px] text-muted-foreground">தரவுத்தளத்தில் உள்ளவை</p>
        </div>

        <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>சட்டச் செய்திகள்</span>
            <Layers className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="text-xl font-bold font-mono text-indigo-600 dark:text-indigo-400">{lawCount}</div>
          <p className="text-[10px] text-muted-foreground">நீதிமன்றம் & சட்டம்</p>
        </div>

        <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>தமிழ்நாடு செய்திகள்</span>
            <Globe className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold font-mono text-emerald-600 dark:text-emerald-400">{tnCount}</div>
          <p className="text-[10px] text-muted-foreground">மாநில நிகழ்வுகள்</p>
        </div>

        <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs space-y-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>உயர் பொருத்தம் (≥70%)</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold font-mono text-amber-600 dark:text-amber-400">{highRelevanceCount}</div>
          <p className="text-[10px] text-muted-foreground">முக்கியத்துவம் வாய்ந்தவை</p>
        </div>

        <div className="p-3.5 rounded-lg bg-card border border-border shadow-2xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-muted-foreground text-xs">
            <span>செயலில் உள்ள மூலங்கள்</span>
            <Radio className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-bold font-mono text-sky-600 dark:text-sky-400">
            {activeSourcesCount} / {sources.length}
          </div>
          <p className="text-[10px] text-muted-foreground">RSS ஃபீடுகள்</p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'items'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Newspaper className="w-4 h-4" />
          <span>சேகரிக்கப்பட்ட செய்திகள் ({totalItems})</span>
        </button>

        <button
          onClick={() => setActiveTab('sources')}
          className={`px-4 py-2.5 text-xs font-bold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'sources'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Radio className="w-4 h-4" />
          <span>செய்தி மூலங்கள் ({sources.length})</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: COLLECTED NEWS ITEMS                                              */}
      {/* ========================================================================= */}
      {activeTab === 'items' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-card border border-border p-3.5 rounded-lg shadow-2xs space-y-3">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="தலைப்பு, உள்ளடக்கம் அல்லது செய்தி மூலம் தேடுக..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              {/* Status and Category Filter Dropdowns */}
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
                >
                  <option value="all">அனைத்து நிலைகளும்</option>
                  <option value="collected">சேகரிக்கப்பட்டவை (Collected)</option>
                  <option value="review">ஆய்வில் உள்ளவை (Review)</option>
                  <option value="draft">வரைவுகள் (Draft)</option>
                  <option value="published">வெளியிடப்பட்டவை (Published)</option>
                </select>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
                >
                  <option value="all">அனைத்துப் பிரிவுகள்</option>
                  <option value="law">சட்டம் (Law)</option>
                  <option value="politics">அரசியல் (Politics)</option>
                  <option value="tamil-nadu">தமிழ்நாடு (Tamil Nadu)</option>
                  <option value="india">இந்தியா (India)</option>
                </select>

                <select
                  value={selectedSourceId}
                  onChange={(e) => setSelectedSourceId(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs max-w-[180px] truncate"
                >
                  <option value="all">அனைத்து மூலங்களும்</option>
                  {sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>

                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedStatus('all');
                    setSelectedCategory('all');
                    setSelectedSourceId('all');
                  }}
                  className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground text-xs"
                  title="வடிகட்டல்களை மீட்டமை"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
            {itemsLoading ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">செய்திகள் ஏற்றப்படுகின்றன...</p>
              </div>
            ) : itemsError ? (
              <div className="p-8 text-center space-y-2 text-destructive">
                <AlertCircle className="w-6 h-6 mx-auto" />
                <p className="text-xs">{itemsError}</p>
                <button
                  onClick={() => loadItems()}
                  className="text-xs underline font-bold cursor-pointer"
                >
                  மீண்டும் முயற்சிக்கவும்
                </button>
              </div>
            ) : items.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Newspaper className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">செய்திகள் எதுவும் கிடைக்கவில்லை</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  வடிகட்டல்களுக்கு ஏற்ற செய்திகள் இல்லை அல்லது செய்தி சேகரிப்பு இன்னும் இயங்கவில்லை.
                </p>
                <button
                  onClick={handleRunCollection}
                  disabled={isCollecting}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>இப்போது சேகரிக்கவும்</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-border">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3.5">செய்தி மூலம்</th>
                      <th className="p-3.5">தலைப்பு & முன்னோட்டம்</th>
                      <th className="p-3.5">பிரிவு</th>
                      <th className="p-3.5">வெளியிடப்பட்ட நேரம்</th>
                      <th className="p-3.5">பொருத்தம் (Score)</th>
                      <th className="p-3.5">நிலை</th>
                      <th className="p-3.5 text-right">செயல்கள்</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {items.map((item) => {
                      const score = item.relevance_score ?? item.relevanceScore ?? 50;
                      const scoreColor =
                        score >= 70
                          ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                          : score >= 50
                          ? 'text-amber-600 dark:text-amber-400 bg-amber-500/10 border-amber-500/20'
                          : 'text-rose-600 dark:text-rose-400 bg-rose-500/10 border-rose-500/20';

                      return (
                        <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                          {/* Source */}
                          <td className="p-3.5 whitespace-nowrap align-top">
                            <div className="font-bold text-foreground flex items-center gap-1">
                              <Radio className="w-3 h-3 text-primary" />
                              <span>{item.source_name || item.source}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              சேகரிப்பு: {formatTimeTamil(item.discovered_at || item.created_at || '')}
                            </div>
                          </td>

                          {/* Headline & Preview */}
                          <td className="p-3.5 max-w-md align-top">
                            <div className="font-bold text-foreground line-clamp-2 hover:text-primary transition-colors">
                              <a
                                href={item.original_url || item.sourceUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-baseline gap-1"
                              >
                                <span>{item.original_title || item.headline}</span>
                                <ExternalLink className="w-2.5 h-2.5 shrink-0 opacity-60" />
                              </a>
                            </div>
                            <div className="text-[11px] text-muted-foreground line-clamp-2 mt-1">
                              {item.original_content || item.summary || 'உள்ளடக்கம் இல்லை'}
                            </div>
                          </td>

                          {/* Category */}
                          <td className="p-3.5 whitespace-nowrap align-top">
                            <CategoryBadge
                              category={item.category_slug || item.category || 'india'}
                              nameTamil={item.category || item.categoryNameTamil}
                              size="sm"
                            />
                          </td>

                          {/* Published At */}
                          <td className="p-3.5 whitespace-nowrap text-muted-foreground align-top">
                            <div>{formatDateTamil(item.published_at || item.publishedAt || '')}</div>
                            <div className="text-[10px] opacity-75">
                              {formatTimeTamil(item.published_at || item.publishedAt || '')}
                            </div>
                          </td>

                          {/* Relevance Score */}
                          <td className="p-3.5 whitespace-nowrap align-top">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-mono font-bold border ${scoreColor}`}
                            >
                              {score}%
                            </span>
                          </td>

                          {/* Status */}
                          <td className="p-3.5 whitespace-nowrap align-top">
                            <StatusBadge status={item.status} />
                          </td>

                          {/* Actions */}
                          <td className="p-3.5 text-right whitespace-nowrap align-top space-x-1.5">
                            <button
                              onClick={() => handleTogglePublish(item)}
                              className={`px-2 py-1 rounded-md text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 border transition-colors ${
                                item.status === 'published'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20'
                                  : 'border-primary/30 bg-primary/10 text-primary hover:bg-primary/20'
                              }`}
                              title={
                                item.status === 'published'
                                  ? 'வெளியீட்டை ரத்து செய்'
                                  : 'உடனடியாக இணையதளத்தில் நேரலை செய்'
                              }
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>{item.status === 'published' ? 'நேரலை' : 'வெளியிடு'}</span>
                            </button>

                            <button
                              onClick={() => handleGenerateDraft(item.id)}
                              disabled={isGeneratingDraft}
                              className="px-2 py-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 text-[11px] font-bold cursor-pointer inline-flex items-center gap-1 disabled:opacity-50"
                              title="Gemini AI தமிழ் வரைவு உருவாக்கு"
                            >
                              <Sparkles className="w-3 h-3 text-amber-500" />
                              <span>AI வரைவு</span>
                            </button>

                            <button
                              onClick={() => setSelectedItemForView(item)}
                              className="px-2.5 py-1 rounded-md border border-border bg-background text-foreground hover:bg-muted text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                            >
                              <Info className="w-3 h-3 text-primary" />
                              <span>விவரம்</span>
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="p-1.5 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 text-[11px] cursor-pointer inline-block"
                              title="செய்தியை நீக்கு"
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
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: NEWS SOURCES MANAGEMENT                                            */}
      {/* ========================================================================= */}
      {activeTab === 'sources' && (
        <div className="space-y-4">
          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-lg shadow-2xs">
            <div className="space-y-0.5">
              <h3 className="text-xs font-bold text-foreground">அங்கீகரிக்கப்பட்ட செய்தி மூலங்கள் (Approved Feeds)</h3>
              <p className="text-[11px] text-muted-foreground">
                சட்ட தளங்கள், அரசு தகவல் மையங்கள், மற்றும் நம்பகமான செய்தி நிறுவனங்களின் RSS முகவரிகள்.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {sources.length === 0 && (
                <button
                  onClick={handleSeedSources}
                  disabled={sourcesLoading}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 transition-colors shadow-xs cursor-pointer"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>இயல்புநிலை மூலங்கள் நிறுவு (Seed Feeds)</span>
                </button>
              )}

              <button
                onClick={() => {
                  setTestFeedUrl('');
                  setTestResult(null);
                  setTestModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-bold hover:bg-muted transition-colors shadow-xs cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5 text-primary" />
                <span>RSS சோதனை (Test URL)</span>
              </button>

              <button
                onClick={handleOpenAddSource}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>புதிய மூலம் சேர் (Add Source)</span>
              </button>
            </div>
          </div>

          {/* Sources List Table */}
          <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
            {sourcesLoading ? (
              <div className="py-16 text-center space-y-2">
                <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                <p className="text-xs text-muted-foreground">செய்தி மூலங்கள் ஏற்றப்படுகின்றன...</p>
              </div>
            ) : sourcesError ? (
              <div className="p-8 text-center space-y-2 text-destructive">
                <AlertCircle className="w-6 h-6 mx-auto" />
                <p className="text-xs">{sourcesError}</p>
              </div>
            ) : sources.length === 0 ? (
              <div className="py-16 text-center space-y-3">
                <Radio className="w-10 h-10 text-muted-foreground/40 mx-auto" />
                <h3 className="text-sm font-bold text-foreground">செய்தி மூலங்கள் எதுவும் இல்லை</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  சட்ட மற்றும் தமிழக செய்திகளைச் சேகரிக்க செய்தி மூலங்களைச் சேர்க்கவும் அல்லது இயல்புநிலை மூலங்களை நிறுவவும்.
                </p>
                <button
                  onClick={handleSeedSources}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold"
                >
                  <Database className="w-3.5 h-3.5" />
                  <span>இயல்புநிலை மூலங்களை நிறுவுக</span>
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs divide-y divide-border">
                  <thead className="bg-muted/50 text-muted-foreground font-semibold">
                    <tr>
                      <th className="p-3.5">பெயர் & வகை</th>
                      <th className="p-3.5">RSS முகவரி (Feed URL)</th>
                      <th className="p-3.5">பிரிவு & பகுதி</th>
                      <th className="p-3.5">முன்னுரிமை (Priority)</th>
                      <th className="p-3.5">நிலை (Active)</th>
                      <th className="p-3.5 text-right">செயல்கள்</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {sources.map((source) => (
                      <tr key={source.id} className="hover:bg-muted/30 transition-colors">
                        <td className="p-3.5 whitespace-nowrap">
                          <div className="font-bold text-foreground flex items-center gap-1.5">
                            <span
                              className={`w-2 h-2 rounded-full ${
                                source.active ? 'bg-emerald-500' : 'bg-muted-foreground/40'
                              }`}
                            />
                            <span>{source.name}</span>
                          </div>
                          <div className="text-[10px] text-muted-foreground uppercase tracking-wider font-mono mt-0.5">
                            {source.source_type || 'rss'}
                          </div>
                        </td>

                        <td className="p-3.5 max-w-sm truncate">
                          <a
                            href={source.feed_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-mono text-[11px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
                          >
                            <span className="truncate">{source.feed_url}</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <CategoryBadge category={source.category} size="sm" />
                          <div className="text-[10px] text-muted-foreground mt-0.5">{source.region || 'India'}</div>
                        </td>

                        <td className="p-3.5 whitespace-nowrap font-mono font-bold text-foreground">
                          {source.priority ?? 50}
                        </td>

                        <td className="p-3.5 whitespace-nowrap">
                          <button
                            onClick={() => handleToggleSourceActive(source)}
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors cursor-pointer ${
                              source.active
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                                : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
                            }`}
                          >
                            {source.active ? 'செயலில் உள்ளது' : 'முடக்கப்பட்டது'}
                          </button>
                        </td>

                        <td className="p-3.5 text-right whitespace-nowrap space-x-1.5">
                          <button
                            onClick={() => handleRunTestFeed(source.feed_url)}
                            className="px-2 py-1 rounded-md border border-border bg-background text-foreground hover:bg-muted text-[11px] font-bold cursor-pointer inline-flex items-center gap-1"
                            title="இந்த RSS ஓடையை சோதனை செய்"
                          >
                            <Play className="w-3 h-3 text-primary" />
                            <span>சோதனை</span>
                          </button>

                          <button
                            onClick={() => handleOpenEditSource(source)}
                            className="p-1.5 rounded-md border border-border text-foreground hover:bg-muted text-[11px] cursor-pointer inline-block"
                            title="திருத்து"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteSource(source.id, source.name)}
                            className="p-1.5 rounded-md border border-destructive/20 text-destructive hover:bg-destructive/10 text-[11px] cursor-pointer inline-block"
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
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 1: COLLECTION RUN SUMMARY MODAL                                     */}
      {/* ========================================================================= */}
      {showResultModal && collectionResult && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                <h3 className="font-bold text-base text-foreground">செய்தி சேகரிப்பு நிறைவடைந்தது</h3>
              </div>
              <button
                onClick={() => setShowResultModal(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-tamil">ஆய்வு செய்த ஃபீடுகள்</span>
                <div className="text-xl font-bold text-foreground">{collectionResult.sourcesChecked}</div>
              </div>
              <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-0.5">
                <span className="text-[11px] text-emerald-700 dark:text-emerald-300 font-tamil">புதிதாகச் சேர்க்கப்பட்டவை</span>
                <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                  +{collectionResult.itemsAdded}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 space-y-0.5">
                <span className="text-[11px] text-amber-700 dark:text-amber-300 font-tamil">நகல்கள் தவிர்க்கப்பட்டவை</span>
                <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                  {collectionResult.duplicatesSkipped}
                </div>
              </div>
              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-0.5">
                <span className="text-[11px] text-muted-foreground font-tamil">குறைந்த பொருத்தம் (&lt;40%)</span>
                <div className="text-xl font-bold text-foreground">{collectionResult.lowScoreFiltered}</div>
              </div>
            </div>

            {collectionResult.errors.length > 0 && (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs space-y-1">
                <div className="font-bold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  <span>பிழைகள் ({collectionResult.errors.length}):</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5 text-[11px] max-h-24 overflow-y-auto">
                  {collectionResult.errors.map((err, idx) => (
                    <li key={idx}>
                      <strong>{err.sourceName}:</strong> {err.message}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <button
              onClick={() => setShowResultModal(false)}
              className="w-full py-2 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 transition-colors"
            >
              சரி, தொடர்க
            </button>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 2: ITEM DETAIL MODAL                                                */}
      {/* ========================================================================= */}
      {selectedItemForView && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <CategoryBadge
                  category={selectedItemForView.category_slug || selectedItemForView.category || 'india'}
                  nameTamil={selectedItemForView.category || selectedItemForView.categoryNameTamil}
                  size="sm"
                />
                <span className="text-xs text-muted-foreground font-bold font-sans">
                  {selectedItemForView.source_name || selectedItemForView.source}
                </span>
              </div>
              <button
                onClick={() => setSelectedItemForView(null)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4 text-xs">
              <div>
                <h2 className="text-base font-bold text-foreground leading-snug">
                  {selectedItemForView.original_title || selectedItemForView.headline}
                </h2>
                <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-[11px] mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    வெளியீடு: {formatDateTamil(selectedItemForView.published_at || selectedItemForView.publishedAt || '')}
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    பொருத்தம்: {selectedItemForView.relevance_score ?? selectedItemForView.relevanceScore}%
                  </span>
                  <StatusBadge status={selectedItemForView.status} />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                <span className="font-bold text-foreground">சேகரிக்கப்பட்ட உள்ளடக்கம் (Raw Content):</span>
                <p className="text-foreground/90 whitespace-pre-line leading-relaxed">
                  {selectedItemForView.original_content || selectedItemForView.content || 'உள்ளடக்கம் இல்லை'}
                </p>
              </div>

              <div className="space-y-2 border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">அசல் இணைப்பு (Original Source URL):</span>
                  <a
                    href={selectedItemForView.original_url || selectedItemForView.sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1 truncate max-w-sm"
                  >
                    <span className="truncate">{selectedItemForView.original_url || selectedItemForView.sourceUrl}</span>
                    <ExternalLink className="w-3 h-3 shrink-0" />
                  </a>
                </div>

                {selectedItemForView.duplicate_hash && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">நகல் சரிபார்ப்பு குறியீடு (SHA-256):</span>
                    <span className="font-mono text-[10px] text-muted-foreground truncate max-w-xs">
                      {selectedItemForView.duplicate_hash}
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-border flex items-center justify-between bg-muted/20">
              <button
                onClick={() => handleDeleteItem(selectedItemForView.id)}
                className="px-3 py-1.5 rounded-md text-destructive hover:bg-destructive/10 text-xs font-bold transition-colors inline-flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>நீக்கு</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleGenerateDraft(selectedItemForView.id);
                    setSelectedItemForView(null);
                  }}
                  disabled={isGeneratingDraft}
                  className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isGeneratingDraft ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                  <span>Gemini AI வரைவு உருவாக்கு</span>
                </button>

                <button
                  onClick={() => setSelectedItemForView(null)}
                  className="px-4 py-1.5 rounded-md bg-muted text-foreground text-xs font-bold hover:bg-muted/80 transition-colors cursor-pointer"
                >
                  மூடு
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 3: ADD/EDIT SOURCE MODAL                                            */}
      {/* ========================================================================= */}
      {sourceModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-bold text-base text-foreground">
                {editingSource ? 'செய்தி மூலத்தைத் திருத்து' : 'புதிய செய்தி மூலம் சேர்'}
              </h3>
              <button
                onClick={() => setSourceModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSource} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-foreground mb-1">மூலத்தின் பெயர் (Source Name) *</label>
                <input
                  type="text"
                  required
                  placeholder="எ.கா. Bar & Bench (Legal)"
                  value={sourceForm.name}
                  onChange={(e) => setSourceForm({ ...sourceForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-bold text-foreground mb-1">RSS ஓடை முகவரி (Feed URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://example.com/feed.xml"
                  value={sourceForm.feed_url}
                  onChange={(e) => setSourceForm({ ...sourceForm, feed_url: e.target.value })}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">முதன்மைப் பிரிவு</label>
                  <select
                    value={sourceForm.category}
                    onChange={(e) => setSourceForm({ ...sourceForm, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                  >
                    <option value="law">சட்டம் (Law)</option>
                    <option value="politics">அரசியல் (Politics)</option>
                    <option value="tamil-nadu">தமிழ்நாடு (Tamil Nadu)</option>
                    <option value="india">இந்தியா (India)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-foreground mb-1">பகுதி (Region)</label>
                  <input
                    type="text"
                    placeholder="Tamil Nadu / India"
                    value={sourceForm.region}
                    onChange={(e) => setSourceForm({ ...sourceForm, region: e.target.value })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-foreground mb-1">முன்னுரிமை (1 - 100)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    value={sourceForm.priority}
                    onChange={(e) => setSourceForm({ ...sourceForm, priority: Number(e.target.value) || 50 })}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs font-mono"
                  />
                </div>

                <div className="flex items-center gap-2 pt-5">
                  <input
                    type="checkbox"
                    id="activeToggle"
                    checked={sourceForm.active}
                    onChange={(e) => setSourceForm({ ...sourceForm, active: e.target.checked })}
                    className="w-4 h-4 rounded text-primary border-border"
                  />
                  <label htmlFor="activeToggle" className="font-bold text-foreground cursor-pointer">
                    செயலில் வைக்கவும் (Active)
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
                <button
                  type="button"
                  onClick={() => setSourceModalOpen(false)}
                  className="px-3.5 py-2 rounded-md border border-border bg-background text-foreground text-xs font-bold hover:bg-muted"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  disabled={sourceSubmitting}
                  className="px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {sourceSubmitting ? 'சேமிக்கப்படுகிறது...' : 'சேமிக்கவும்'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* MODAL 4: TEST FEED DIAGNOSTIC MODAL                                       */}
      {/* ========================================================================= */}
      {testModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-xl shadow-2xl max-w-2xl w-full max-h-[85vh] flex flex-col animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary" />
                <h3 className="font-bold text-sm text-foreground">RSS ஓடை நேரடிப் பரிசோதனை (Diagnostic Feed Test)</h3>
              </div>
              <button
                onClick={() => setTestModalOpen(false)}
                className="p-1 rounded-md text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-border space-y-2">
              <div className="flex gap-2">
                <input
                  type="url"
                  placeholder="https://example.com/feed.xml"
                  value={testFeedUrl}
                  onChange={(e) => setTestFeedUrl(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-md border border-border bg-background text-foreground font-mono text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  onClick={() => handleRunTestFeed()}
                  disabled={testLoading}
                  className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 inline-flex items-center gap-1.5 cursor-pointer"
                >
                  {testLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                  <span>பரிசோதி</span>
                </button>
              </div>
              <p className="text-[11px] text-muted-foreground">
                இந்தச் சோதனை RSS உள்ளடக்கத்தை நேரடியாக வாசித்து பகுப்பாய்வு செய்யும். தரவுத்தளத்தில் எதுவும் எழுதப்படாது.
              </p>
            </div>

            <div className="p-4 overflow-y-auto flex-1 space-y-4 text-xs">
              {testLoading ? (
                <div className="py-12 text-center space-y-2">
                  <Loader2 className="w-6 h-6 animate-spin text-primary mx-auto" />
                  <p className="text-xs text-muted-foreground">RSS ஓடை சோதிக்கப்படுகிறது...</p>
                </div>
              ) : testResult ? (
                testResult.success ? (
                  <div className="space-y-4">
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 space-y-1">
                      <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>ஓடை வெற்றிகரமாகப் பெறப்பட்டது! (Status: {testResult.statusCode})</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground font-mono">
                        தலைப்பு: <strong className="text-foreground">{testResult.feedTitle}</strong> • கட்டுரைகள்: {testResult.itemCount}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="font-bold text-foreground">மாதிரி கட்டுரைகள் (முதல் 5):</span>
                      <div className="space-y-2">
                        {testResult.sampleItems?.map((sample: any, idx: number) => (
                          <div key={idx} className="p-3 rounded-lg bg-muted/40 border border-border space-y-1">
                            <div className="font-bold text-foreground line-clamp-1">{sample.title}</div>
                            <div className="text-[11px] text-muted-foreground line-clamp-2">{sample.snippet}</div>
                            <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40 font-mono">
                              <span>தேதி: {sample.pubDate || 'குறிப்பிடப்படவில்லை'}</span>
                              <a
                                href={sample.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline inline-flex items-center gap-0.5"
                              >
                                <span>இணைப்பு</span>
                                <ExternalLink className="w-2.5 h-2.5" />
                              </a>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive space-y-2">
                    <div className="font-bold flex items-center gap-1.5">
                      <AlertCircle className="w-4 h-4" />
                      <span>சோதனை தோல்வியுற்றது</span>
                    </div>
                    <p className="text-xs">{testResult.error}</p>
                  </div>
                )
              ) : (
                <div className="py-12 text-center text-muted-foreground">
                  மேலே உள்ள பெட்டியில் RSS URL ஐ உள்ளிட்டு "பரிசோதி" பொத்தானை அழுத்தவும்.
                </div>
              )}
            </div>

            <div className="p-3 border-t border-border flex justify-end bg-muted/20">
              <button
                onClick={() => setTestModalOpen(false)}
                className="px-4 py-1.5 rounded-md bg-muted text-foreground text-xs font-bold hover:bg-muted/80"
              >
                மூடு
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
