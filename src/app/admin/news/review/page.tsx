'use client';

import React, { useState, useEffect } from 'react';
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
  AlertTriangle
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { NewsItem } from '@/types';
import { CategoryBadge } from '@/components/category-badge';
import { EmptyState } from '@/components/empty-state';

export default function AdminNewsReviewPage() {
  const [reviewItems, setReviewItems] = useState<NewsItem[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [notification, setNotification] = useState<{ type: 'success' | 'danger'; text: string } | null>(null);

  // Editable draft fields for current item
  const [editedHeadline, setEditedHeadline] = useState('');
  const [editedSummary, setEditedSummary] = useState('');
  const [editedContent, setEditedContent] = useState('');
  const [editedCategory, setEditedCategory] = useState('');
  const [isBreaking, setIsBreaking] = useState(false);

  useEffect(() => {
    loadItems();
  }, []);

  const loadItems = () => {
    const items = dataService.getNewsReviewItems();
    setReviewItems(items);
    if (items.length > 0) {
      loadItemIntoForm(items[0]);
    }
  };

  const loadItemIntoForm = (item: NewsItem) => {
    setEditedHeadline(item.headline);
    setEditedSummary(item.summary);
    setEditedContent(item.content);
    setEditedCategory(item.category);
    setIsBreaking(item.isBreaking || false);
  };

  const currentItem = reviewItems[selectedIndex];

  const handleSelect = (idx: number) => {
    setSelectedIndex(idx);
    loadItemIntoForm(reviewItems[idx]);
  };

  const handleApproveAndPublish = () => {
    if (!currentItem) return;

    const updatedItem: NewsItem = {
      ...currentItem,
      headline: editedHeadline,
      summary: editedSummary,
      content: editedContent,
      category: editedCategory,
      isBreaking,
    };

    dataService.approveAndPublishNews(updatedItem);
    setNotification({
      type: 'success',
      text: 'செய்தி ஆசிரியரால் சரிபார்க்கப்பட்டு வெற்றிகரமாக நேரலையில் பிரசுரிக்கப்பட்டது!',
    });

    setTimeout(() => {
      setNotification(null);
      loadItems();
    }, 1500);
  };

  const handleReject = () => {
    if (!currentItem) return;
    if (confirm('இந்த AI வரைவை நிராகரிக்க வேண்டுமா?')) {
      dataService.rejectNews(currentItem.id);
      setNotification({
        type: 'danger',
        text: 'செய்தி வரைவு நிராகரிக்கப்பட்டது.',
      });
      setTimeout(() => {
        setNotification(null);
        loadItems();
      }, 1500);
    }
  };

  const handleSaveDraft = () => {
    if (!currentItem) return;
    const updated: NewsItem = {
      ...currentItem,
      headline: editedHeadline,
      summary: editedSummary,
      content: editedContent,
      category: editedCategory,
      isBreaking,
      status: 'draft',
    };
    dataService.updateReviewItem(updated);
    setNotification({
      type: 'success',
      text: 'திருத்தங்கள் வரைவாகச் சேமிக்கப்பட்டன.',
    });
    setTimeout(() => setNotification(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1 rounded-xs bg-amber-500/20 text-amber-600">
              <Sparkles className="w-4 h-4" />
            </span>
            <h1 className="text-2xl font-bold text-foreground">
              AI செய்தி சரிபார்ப்புக் கூடம் (News Review Desk)
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            Gemini AI தயாரித்த தமிழ் செய்தி வரைவுகளை ஆய்வு செய்து, உண்மைத்தன்மை உறுதிப்படுத்திய பின் பிரசுரிக்கவும்.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/news"
            className="px-3 py-1.5 rounded-md border border-border text-xs font-semibold text-foreground hover:bg-muted"
          >
            செய்தி ஓடைக்குத் திரும்புக
          </Link>
        </div>
      </div>

      {/* Warning Notice */}
      <div className="p-3 rounded-md bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 text-xs flex items-center gap-2.5">
        <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600" />
        <span>
          <strong>ஆசிரியர் விதியியல் வழிகாட்டுதல்:</strong> சட்ட அல்லது அரசியல் விவகாரங்களில் AI உருவாக்கிய வரைவுகளை ஆசிரியர் குழுவின் நேரடிச் சரிபார்ப்பு மற்றும் கையெழுத்து இல்லாமல் தானாக வெளியிட அனுமதி இல்லை.
        </span>
      </div>

      {notification && (
        <div
          className={`p-3 rounded-md text-xs font-bold flex items-center gap-2 animate-in fade-in ${
            notification.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/20 text-rose-700 dark:text-rose-300'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>{notification.text}</span>
        </div>
      )}

      {reviewItems.length === 0 ? (
        <EmptyState
          title="சரிபார்ப்புக்கு செய்திகள் எதுவும் இல்லை"
          description="அனைத்து AI செய்தி வரைவுகளும் ஆய்வு செய்யப்பட்டு விட்டன. புதிய செய்திகள் தானாக இங்கு தொகுக்கப்படும்."
          actionText="செய்தி ஓடைக்குச் செல்ல"
          actionHref="/admin/news"
        />
      ) : (
        <div className="space-y-6">
          {/* Queue Tab Selector */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/70">
            <span className="text-xs font-bold text-muted-foreground whitespace-nowrap">
              நிலுவையில் உள்ளவை ({reviewItems.length}):
            </span>
            {reviewItems.map((item, idx) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelect(idx)}
                className={`px-3 py-1.5 rounded-xs text-xs font-semibold whitespace-nowrap transition-colors truncate max-w-[200px] ${
                  selectedIndex === idx
                    ? 'bg-primary text-primary-foreground font-bold shadow-xs'
                    : 'bg-card border border-border text-foreground hover:bg-muted'
                }`}
              >
                {idx + 1}. {item.headline}
              </button>
            ))}
          </div>

          {currentItem && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* LEFT COLUMN: ORIGINAL SOURCE */}
              <div className="lg:col-span-5 bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground font-sans">
                      ORIGINAL SOURCE (ஆதாரம்)
                    </h2>
                  </div>
                  <span className="text-xs font-mono font-bold bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-xs">
                    பொருத்தம்: {currentItem.relevanceScore}%
                  </span>
                </div>

                <div className="space-y-3 font-sans text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">Source Organization:</span>
                    <strong className="text-foreground text-sm">{currentItem.source}</strong>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">Source Link:</span>
                    <a
                      href={currentItem.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline flex items-center gap-1 font-mono text-[11px] break-all"
                    >
                      <span>{currentItem.sourceUrl}</span>
                      <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">Original Headline:</span>
                    <div className="p-2.5 rounded-md bg-muted/60 text-foreground font-bold leading-snug mt-1">
                      {currentItem.originalHeadline}
                    </div>
                  </div>

                  <div>
                    <span className="text-muted-foreground block text-[11px] uppercase font-bold">Original Content / Raw Text:</span>
                    <div className="p-3 rounded-md bg-muted/40 text-muted-foreground leading-relaxed mt-1 text-xs max-h-80 overflow-y-auto whitespace-pre-wrap">
                      {currentItem.originalContent || currentItem.summary}
                    </div>
                  </div>

                  {currentItem.aiProcessingNotes && (
                    <div className="p-3 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-200 text-[11px] space-y-1">
                      <strong className="font-bold block flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                        AI குறிப்புகள்:
                      </strong>
                      <p>{currentItem.aiProcessingNotes}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* RIGHT COLUMN: AI-GENERATED TAMIL DRAFT (EDITABLE) */}
              <div className="lg:col-span-7 bg-card border-2 border-primary/30 rounded-lg p-5 shadow-xs space-y-4">
                <div className="border-b border-border pb-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary" />
                    <h2 className="text-sm font-bold uppercase tracking-wider text-primary">
                      AI தமிழ் வரைவு (சரிபார்த்து திருத்தவும்)
                    </h2>
                  </div>
                  <span className="text-xs text-muted-foreground font-semibold">
                    ஆசிரியர் ஆய்வு நிலை
                  </span>
                </div>

                <div className="space-y-4">
                  {/* Category & Breaking Checkbox */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-foreground">பிரிவு:</label>
                      <select
                        value={editedCategory}
                        onChange={(e) => setEditedCategory(e.target.value)}
                        className="px-2.5 py-1 rounded-xs border border-border bg-background text-foreground text-xs"
                      >
                        <option value="law">சட்டம் (Law)</option>
                        <option value="politics">அரசியல் (Politics)</option>
                        <option value="tamil-nadu">தமிழ்நாடு (Tamil Nadu)</option>
                        <option value="india">இந்தியா (India)</option>
                      </select>
                    </div>

                    <label className="flex items-center gap-1.5 text-xs font-bold text-destructive cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isBreaking}
                        onChange={(e) => setIsBreaking(e.target.checked)}
                        className="w-4 h-4 rounded-xs border-border text-destructive focus:ring-destructive"
                      />
                      <span>முக்கியச் செய்தி (Breaking News Bar)</span>
                    </label>
                  </div>

                  {/* Tamil Headline */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      தமிழ் தலைப்பு (Tamil Headline)
                    </label>
                    <input
                      type="text"
                      value={editedHeadline}
                      onChange={(e) => setEditedHeadline(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                  </div>

                  {/* Tamil Summary */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      சுருக்க உரை (Summary)
                    </label>
                    <textarea
                      rows={2}
                      value={editedSummary}
                      onChange={(e) => setEditedSummary(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                    />
                  </div>

                  {/* Full Tamil Content */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-foreground">
                      முழு செய்தி உள்ளடக்கம் (Full Content)
                    </label>
                    <textarea
                      rows={8}
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary resize-y"
                    />
                  </div>

                  {/* Image Preview & URL */}
                  {currentItem.imageUrl && (
                    <div className="flex items-center gap-3 p-2.5 rounded-md bg-muted/40 border border-border text-xs">
                      <img
                        src={currentItem.imageUrl}
                        alt="News visual"
                        className="w-16 h-12 rounded-xs object-cover"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-foreground">செய்திப் படம்</div>
                        <div className="text-muted-foreground truncate text-[11px] font-sans">
                          {currentItem.imageUrl}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons Toolbar */}
                  <div className="pt-4 border-t border-border flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleReject}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-destructive/30 bg-destructive/10 text-destructive text-xs font-bold hover:bg-destructive/20 transition-colors"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>நிராகரி (Reject)</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleSaveDraft}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-border bg-card text-foreground text-xs font-bold hover:bg-muted transition-colors"
                      >
                        <Save className="w-4 h-4" />
                        <span>வரைவாகச் சேமி (Save Draft)</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleApproveAndPublish}
                      className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md bg-emerald-600 text-white text-xs sm:text-sm font-bold hover:bg-emerald-700 transition-colors shadow-xs"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>ஒப்புதல் அளித்து பிரசுரி (Approve & Publish)</span>
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
