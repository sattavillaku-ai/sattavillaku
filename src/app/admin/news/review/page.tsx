'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  Save,
  ExternalLink,
  ShieldAlert,
  Edit,
  ArrowRight,
  Flame,
  Clock,
  RefreshCw,
  AlertTriangle,
  Loader2,
  Database,
  Radio,
  Send,
  Tag as TagIcon,
  X,
  Plus,
  Cpu,
  Check,
} from 'lucide-react';
import { NewsDraft, NewsDraftReviewStatus, NewsItem } from '@/types';
import { CategoryBadge } from '@/components/category-badge';
import { StatusBadge } from '@/components/status-badge';
import { EmptyState } from '@/components/empty-state';
import { formatDateTamil, formatTimeTamil } from '@/lib/utils';

export default function AdminNewsReviewPage() {
  const [drafts, setDrafts] = useState<NewsDraft[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Editable fields for currently selected draft
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('law');
  const [editedTags, setEditedTags] = useState<string[]>([]);
  const [newTagInput, setNewTagInput] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');

  // Fallback collected items if no drafts exist yet
  const [unprocessedItems, setUnprocessedItems] = useState<NewsItem[]>([]);

  const showNotification = (text: string, type: 'success' | 'danger' = 'success') => {
    setNotification({ type, text });
    setTimeout(() => setNotification(null), 4000);
  };

  const loadDrafts = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(
        `/api/admin/news/drafts?status=${statusFilter !== 'all' ? statusFilter : ''}&search=${encodeURIComponent(searchQuery)}`
      );
      const data = await res.json();

      if (res.ok && data.success) {
        setDrafts(data.drafts || []);
        if (data.drafts && data.drafts.length > 0) {
          loadDraftIntoForm(data.drafts[0]);
          setSelectedIndex(0);
        } else {
          // If no drafts, check for collected items to suggest AI draft generation
          const itemsRes = await fetch('/api/admin/news/items?limit=10&status=collected');
          const itemsData = await itemsRes.json();
          if (itemsData.items) {
            setUnprocessedItems(itemsData.items);
          }
        }
      }
    } catch (err: any) {
      console.error('Error loading news drafts:', err);
      showNotification('செய்தி வரைவுகளை ஏற்றுவதில் பிழை ஏற்பட்டது.', 'danger');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchQuery]);

  useEffect(() => {
    loadDrafts();
  }, [loadDrafts]);

  const loadDraftIntoForm = (draft: NewsDraft) => {
    setEditedHeadline(draft.tamil_headline || '');
    setEditedSummary(draft.tamil_summary || '');
    setEditedContent(draft.tamil_content || '');
    setEditedCategory(draft.category_slug || draft.category || 'law');
    setEditedTags(Array.isArray(draft.tags) ? draft.tags : []);
    setReviewNotes(draft.review_notes || '');
  };

  const currentDraft = drafts[selectedIndex];

  const handleSelectDraft = (idx: number) => {
    setSelectedIndex(idx);
    loadDraftIntoForm(drafts[idx]);
  };

  // Add Tag
  const handleAddTag = () => {
    const trimmed = newTagInput.trim();
    if (trimmed && !editedTags.includes(trimmed)) {
      setEditedTags([...editedTags, trimmed]);
      setNewTagInput('');
    }
  };

  // Remove Tag
  const handleRemoveTag = (tagToRemove: string) => {
    setEditedTags(editedTags.filter((t) => t !== tagToRemove));
  };

  // Save Edits (PUT /api/admin/news/drafts/[id])
  const handleSaveEdits = async () => {
    if (!currentDraft) return;

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/news/drafts/${currentDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tamil_headline: editedHeadline,
          tamil_summary: editedSummary,
          tamil_content: editedContent,
          category_slug: editedCategory,
          tags: editedTags,
          review_notes: reviewNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'திருத்தங்களைச் சேமிக்க முடியவில்லை.');
      }

      setDrafts((prev) =>
        prev.map((d) => (d.id === currentDraft.id ? { ...d, ...data.draft } : d))
      );

      showNotification('ஆசிரியரின் திருத்தங்கள் வரைவாகப் புதுப்பிக்கப்பட்டன!');
    } catch (err: any) {
      showNotification(err.message, 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  // Approve Draft
  const handleApprove = async () => {
    if (!currentDraft) return;

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/news/drafts/${currentDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tamil_headline: editedHeadline,
          tamil_summary: editedSummary,
          tamil_content: editedContent,
          category_slug: editedCategory,
          tags: editedTags,
          review_status: 'approved',
          review_notes: reviewNotes,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'ஒப்புதல் அளிப்பதில் பிழை.');
      }

      setDrafts((prev) =>
        prev.map((d) => (d.id === currentDraft.id ? { ...d, review_status: 'approved' } : d))
      );

      showNotification('செய்தி வரைவு ஆசிரியர் குழுவால் ஒப்புதல் அளிக்கப்பட்டது (Approved)!');
    } catch (err: any) {
      showNotification(err.message, 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  // Reject Draft
  const handleReject = async () => {
    if (!currentDraft) return;
    if (!confirm('இந்தச் செய்தி வரைவை நிராகரிக்க வேண்டுமா? (நிராகரிக்கப்பட்ட செய்தி பொதுப்பார்வைக்கு வராது)')) {
      return;
    }

    try {
      setIsProcessing(true);
      const res = await fetch(`/api/admin/news/drafts/${currentDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          review_status: 'rejected',
          review_notes: reviewNotes || 'ஆசிரியரால் நிராகரிக்கப்பட்டது.',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'நிராகரிப்பதில் பிழை.');
      }

      setDrafts((prev) =>
        prev.map((d) => (d.id === currentDraft.id ? { ...d, review_status: 'rejected' } : d))
      );

      showNotification('செய்தி வரைவு நிராகரிக்கப்பட்டது (Rejected).', 'danger');
    } catch (err: any) {
      showNotification(err.message, 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  // Explicit Publish (POST /api/admin/news/drafts/[id]/publish)
  const handlePublishLive = async () => {
    if (!currentDraft) return;

    if (!confirm('இந்தச் செய்தியை நேரடியாக பொதுதளத்தில் பிரசுரிக்க நிச்சயமாக ஒப்புதல் அளிக்கிறீர்களா?')) {
      return;
    }

    try {
      setIsProcessing(true);

      // Save latest edits first
      await fetch(`/api/admin/news/drafts/${currentDraft.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tamil_headline: editedHeadline,
          tamil_summary: editedSummary,
          tamil_content: editedContent,
          category_slug: editedCategory,
          tags: editedTags,
          review_notes: reviewNotes,
        }),
      });

      // Call explicit publish endpoint
      const res = await fetch(`/api/admin/news/drafts/${currentDraft.id}/publish`, {
        method: 'POST',
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'செய்தியைப் பிரசுரிப்பதில் பிழை ஏற்பட்டது.');
      }

      setDrafts((prev) =>
        prev.map((d) => (d.id === currentDraft.id ? { ...d, review_status: 'published' } : d))
      );

      showNotification('செய்தி ஆசிரியரால் சரிபார்க்கப்பட்டு வெற்றிகரமாக நேரலையில் பிரசுரிக்கப்பட்டது!');
    } catch (err: any) {
      showNotification(err.message, 'danger');
    } finally {
      setIsProcessing(false);
    }
  };

  // Regenerate with Gemini
  const handleRegenerateDraft = async () => {
    if (!currentDraft?.news_item_id) return;

    try {
      setIsGenerating(true);
      const res = await fetch('/api/admin/news/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemId: currentDraft.news_item_id,
          force: true,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gemini வரைவு உருவாக்குவதில் பிழை.');
      }

      showNotification('Gemini AI மூலம் புதிய வரைவு வெற்றிகரமாக உருவாக்கப்பட்டது!');
      loadDrafts();
    } catch (err: any) {
      showNotification(err.message, 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  // Generate Draft from collected items (when drafts list is empty)
  const handleGenerateFromCollected = async (itemId: string) => {
    try {
      setIsGenerating(true);
      const res = await fetch('/api/admin/news/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Gemini வரைவு உருவாக்குவதில் பிழை.');
      }

      showNotification('Gemini AI தமிழ் வரைவு உருவாக்கப்பட்டது!');
      loadDrafts();
    } catch (err: any) {
      showNotification(err.message, 'danger');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-md bg-amber-500/20 text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold text-foreground">
              செய்தி ஆசிரியர் சரிபார்ப்புக் கூடம் (News Editorial Desk)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gemini AI உருவாக்கிய தமிழ் வரைவுகளை ஆசிரியர் குழு ஆய்வு செய்து, திருத்தி, நேரலையில் பிரசுரிக்கும் கட்டுப்பாட்டு மையம்.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/news"
            className="px-3.5 py-2 rounded-md border border-border bg-background text-xs font-bold text-foreground hover:bg-muted transition-colors cursor-pointer"
          >
            &larr; செய்தி மூலங்களுக்குத் திரும்புக
          </Link>
        </div>
      </div>

      {/* Non-negotiable Editorial Notice */}
      <div className="p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span>
          <strong>ஆசிரியர் நெறிமுறை:</strong> AI உருவாக்கிய வரைவு ஒருபோதும் தானாகப் பிரசுரமாகாது. மனித ஆசிரியர் குழு நேரடியாகப் படித்து உறுதிசெய்து, "நேரலையில் பிரசுரி" பொத்தானை அழுத்தினால் மட்டுமே செய்தி பொதுப்பார்வைக்கு வரும்.
        </span>
      </div>

      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-3.5 rounded-lg text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}
        >
          {notification.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-lg shadow-2xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'அனைத்து வரைவுகள்' },
            { id: 'pending', label: 'ஆய்வுக்குரியவை (Pending)' },
            { id: 'approved', label: 'ஒப்புதலானவை (Approved)' },
            { id: 'published', label: 'பிரசுரமானவை (Published)' },
            { id: 'rejected', label: 'நிராகரிக்கப்பட்டவை (Rejected)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === tab.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={() => loadDrafts()}
          disabled={loading}
          className="p-1.5 rounded-md border border-border text-muted-foreground hover:text-foreground text-xs self-end sm:self-auto cursor-pointer"
          title="புதுப்பி"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-xs text-muted-foreground">செய்தி வரைவுகள் ஏற்றப்படுகின்றன...</p>
        </div>
      ) : drafts.length === 0 ? (
        <div className="space-y-6">
          <EmptyState
            title="ஆய்வுக்குரிய செய்தி வரைவுகள் எதுவும் இல்லை"
            description="வடிகட்டல்களுக்கு ஏற்ற வரைவுகள் இல்லை. சேகரிக்கப்பட்ட செய்திகளிலிருந்து Gemini AI மூலம் வரைவு உருவாக்கலாம்."
            actionText="செய்தி சேகரிப்புக்குச் செல்ல"
            actionHref="/admin/news"
          />

          {unprocessedItems.length > 0 && (
            <div className="bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>வரைவு உருவாக்கக் காத்திருக்கும் சேகரிக்கப்பட்ட செய்திகள்:</span>
              </div>
              <div className="divide-y divide-border">
                {unprocessedItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="font-bold text-sm text-foreground">{item.original_title || item.headline}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2">
                        <span>மூலம்: {item.source_name || item.source}</span>
                        <span>•</span>
                        <span>{formatDateTamil(item.published_at || item.publishedAt || '')}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleGenerateFromCollected(item.id)}
                      disabled={isGenerating}
                      className="px-3.5 py-1.5 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shrink-0 cursor-pointer inline-flex items-center gap-1.5"
                    >
                      {isGenerating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>வரைவு உருவாக்கு</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {/* Queue Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/70">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              வரைவுகள் ({drafts.length}):
            </span>
            {drafts.map((d, idx) => (
              <button
                key={d.id}
                type="button"
                onClick={() => handleSelectDraft(idx)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-colors truncate max-w-[220px] cursor-pointer flex items-center gap-1.5 ${
                  selectedIndex === idx
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{idx + 1}. {d.tamil_headline || 'தலைப்பற்ற வரைவு'}</span>
              </button>
            ))}
          </div>

          {currentDraft && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: ORIGINAL SOURCE PROVENANCE */}
              <div className="lg:col-span-5 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Radio className="w-4 h-4 text-primary" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-muted-foreground font-sans">
                      ORIGINAL PROVENANCE (அசல் ஆதாரம்)
                    </h2>
                  </div>
                  <span className="text-[11px] font-mono font-bold bg-primary/10 text-primary px-2 py-0.5 rounded-md">
                    மூலம்: {currentDraft.source_name || currentDraft.news_item?.source_name || 'RSS'}
                  </span>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">
                      செய்தி நிறுவனம் (Source Publisher):
                    </span>
                    <strong className="text-foreground text-sm font-tamil">
                      {currentDraft.source_name || currentDraft.news_item?.source_name || 'செய்தி மூலம்'}
                    </strong>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">
                      அசல் செய்தி இணைப்பு (Source URL):
                    </span>
                    <a
                      href={currentDraft.original_url || currentDraft.news_item?.original_url || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px] break-all"
                    >
                      <span className="truncate">
                        {currentDraft.original_url || currentDraft.news_item?.original_url || 'இணைப்பு இல்லை'}
                      </span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">
                      அசல் ஆங்கிலத் தலைப்பு (Original Headline):
                    </span>
                    <div className="p-2.5 rounded-md bg-muted/60 text-foreground font-bold leading-snug mt-1 font-tamil">
                      {currentDraft.original_title || currentDraft.news_item?.original_title || 'தலைப்பு இல்லை'}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">
                      அசல் சேகரிக்கப்பட்ட உள்ளடக்கம் (Raw Source Text):
                    </span>
                    <div className="p-3 rounded-md bg-muted/40 text-muted-foreground leading-relaxed mt-1 text-xs max-h-72 overflow-y-auto whitespace-pre-wrap font-tamil">
                      {currentDraft.original_content || currentDraft.news_item?.original_content || 'உள்ளடக்கம் இல்லை'}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>வெளியிடப்பட்ட நேரம்:</span>
                    <span>
                      {formatDateTamil(currentDraft.source_published_at || currentDraft.news_item?.published_at || currentDraft.created_at || '')}
                    </span>
                  </div>

                  {/* AI Model metadata */}
                  <div className="p-2.5 rounded-md bg-muted/30 border border-border/70 flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1.5 text-muted-foreground">
                      <Cpu className="w-3.5 h-3.5 text-primary" />
                      <span>உருவாக்கிய AI மாடல்:</span>
                    </span>
                    <span className="font-mono font-bold text-foreground">
                      {currentDraft.ai_model || 'gemini-1.5-flash'}
                    </span>
                  </div>

                  {/* Regenerate Button */}
                  <button
                    type="button"
                    onClick={handleRegenerateDraft}
                    disabled={isGenerating}
                    className="w-full py-2 px-3 rounded-md border border-primary/30 bg-primary/10 text-primary text-xs font-bold hover:bg-primary/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5" />
                    )}
                    <span>Gemini AI மூலம் புதிய வரைவு உருவாக்கு (Regenerate)</span>
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN: EDITABLE DRAFT */}
              <div className="lg:col-span-7 bg-card border border-border rounded-xl p-5 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <h2 className="text-xs font-bold uppercase tracking-wider text-primary font-sans">
                      ஆசிரியர் ஆய்வு & பிரசுரம் (Editorial Desk)
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">நிலை:</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                        currentDraft.review_status === 'published'
                          ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                          : currentDraft.review_status === 'approved'
                          ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400'
                          : currentDraft.review_status === 'rejected'
                          ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                          : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
                      }`}
                    >
                      {currentDraft.review_status === 'published'
                        ? 'பிரசுரமானது'
                        : currentDraft.review_status === 'approved'
                        ? 'ஒப்புதலானது'
                        : currentDraft.review_status === 'rejected'
                        ? 'நிராகரிக்கப்பட்டது'
                        : 'ஆய்வு நிலுவை'}
                    </span>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Category Selector */}
                  <div className="flex items-center gap-3">
                    <label className="text-xs font-bold text-foreground">செய்திப் பிரிவு (Category):</label>
                    <select
                      value={editedCategory}
                      onChange={(e) => setEditedCategory(e.target.value)}
                      className="px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-bold"
                    >
                      <option value="law">சட்டம் & நீதிமன்றம் (Law)</option>
                      <option value="politics">அரசியல் களநிலவரம் (Politics)</option>
                      <option value="tamil-nadu">தமிழ்நாடு செய்திகள் (Tamil Nadu)</option>
                      <option value="india">தேசிய செய்திகள் (India)</option>
                    </select>
                  </div>

                  {/* Tamil Headline */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>தமிழ் தலைப்பு (Tamil Headline) *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        செய்தித்தாள் பாணியிலான துல்லியமான தலைப்பு
                      </span>
                    </label>
                    <input
                      type="text"
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-1 focus:ring-primary font-tamil"
                      placeholder="செய்தித் தலைப்பை உள்ளிடவும்..."
                    />
                  </div>

                  {/* Tamil Summary */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>சுருக்க உரை (Tamil Summary)</span>
                      <span className="text-[10px] text-muted-foreground font-normal">2-3 வரிகள்</span>
                    </label>
                    <textarea
                      rows={2}
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary resize-y font-tamil"
                      placeholder="செய்தி சுருக்கம்..."
                    />
                  </div>

                  {/* Full Tamil Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground flex items-center justify-between">
                      <span>முழு செய்தி உள்ளடக்கம் (Tamil Article Content) *</span>
                      <span className="text-[10px] text-muted-foreground font-normal">
                        ஆதாரத்துடன் கூடிய பத்திகள்
                      </span>
                    </label>
                    <textarea
                      rows={8}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-1 focus:ring-primary resize-y font-tamil font-normal"
                      placeholder="செய்தி உள்ளடக்கம்..."
                    />
                  </div>

                  {/* Tags Editor */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-foreground flex items-center gap-1">
                      <TagIcon className="w-3.5 h-3.5 text-primary" />
                      <span>குறிச்சொற்கள் (Tags):</span>
                    </label>
                    <div className="flex flex-wrap gap-1.5 items-center">
                      {editedTags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-muted text-foreground text-xs border border-border"
                        >
                          <span>{tag}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="text-muted-foreground hover:text-destructive cursor-pointer"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                      <div className="inline-flex items-center gap-1">
                        <input
                          type="text"
                          value={newTagInput}
                          onChange={(e) => setNewTagInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                          placeholder="+ குறிச்சொல்"
                          className="px-2 py-0.5 text-xs rounded border border-border bg-background text-foreground w-28"
                        />
                        <button
                          type="button"
                          onClick={handleAddTag}
                          className="p-1 rounded bg-muted hover:bg-muted/80 text-foreground cursor-pointer text-xs"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Review Notes */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-muted-foreground">
                      ஆசிரியர் குறிப்புகள் (Internal Editorial Notes):
                    </label>
                    <input
                      type="text"
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="ஆசிரியர் குறிப்பு அல்லது திருத்தக் குறிப்பு..."
                      className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
                    />
                  </div>

                  {/* Actions Toolbar */}
                  <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReject}
                        disabled={isProcessing || currentDraft.review_status === 'rejected'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>நிராகரி (Reject)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveEdits}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-background text-foreground text-xs font-bold hover:bg-muted transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Save className="w-4 h-4" />
                        <span>திருத்தங்களைச் சேமி (Save)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleApprove}
                        disabled={isProcessing || currentDraft.review_status === 'approved'}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold hover:bg-blue-500/20 transition-colors disabled:opacity-50 cursor-pointer"
                      >
                        <Check className="w-4 h-4" />
                        <span>ஒப்புதல் அளி (Approve)</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handlePublishLive}
                      disabled={isProcessing || currentDraft.review_status === 'published'}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
                    >
                      {isProcessing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      <span>
                        {currentDraft.review_status === 'published'
                          ? 'பிரசுரிக்கப்பட்டுவிட்டது (Published)'
                          : 'நேரலையில் பிரசுரி (Publish Live)'}
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
