'use client';

import React, { useState, useEffect } from 'react';
import {
  Image as ImageIcon,
  UploadCloud,
  Search,
  Copy,
  Trash2,
  Check,
  Eye,
  Filter,
  X,
  FileText
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Media } from '@/types';
import { EmptyState } from '@/components/empty-state';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // New media upload fields
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'article' | 'cover' | 'author' | 'site'>('article');
  const [newAltText, setNewAltText] = useState('');

  useEffect(() => {
    setMediaList(dataService.getMedia());
  }, []);

  const handleCopyUrl = async (media: Media) => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopiedId(media.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // fallback
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('இந்த மீடியா கோப்பை நிச்சயமாக நீக்க வேண்டுமா?')) {
      dataService.deleteMedia(id);
      setMediaList(dataService.getMedia());
    }
  };

  const handleSaveUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUrl) return;

    const newMedia: Media = {
      id: `med-${Date.now()}`,
      name: newName || 'uploaded-image.jpg',
      url: newUrl,
      type: 'image',
      size: '1.4 MB',
      category: newCategory,
      altText: newAltText || newName,
      createdAt: new Date().toISOString(),
    };

    dataService.saveMedia(newMedia);
    setMediaList(dataService.getMedia());
    setShowUploadModal(false);
    setNewName('');
    setNewUrl('');
    setNewAltText('');
  };

  const filtered = mediaList.filter((m) => {
    const matchesCat = selectedCategory === 'all' || m.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === '' ||
      m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.altText.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            மீடியா நூலகம் (Media Library)
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            கட்டுரைப் படங்கள், அட்டைப்படங்கள் மற்றும் தள புகைப்படங்கள் (Cloudinary Integration Ready)
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs"
        >
          <UploadCloud className="w-4 h-4" />
          <span>புதிய படம் பதிவேற்று (Upload Media)</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-md shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="படத்தின் பெயர் அல்லது விளக்கம்..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-semibold">
          {[
            { id: 'all', label: 'அனைத்தும்' },
            { id: 'article', label: 'கட்டுரைப் படங்கள்' },
            { id: 'cover', label: 'இதழ் அட்டைப்படங்கள்' },
            { id: 'author', label: 'எழுத்தாளர் படங்கள்' },
            { id: 'site', label: 'தள முத்திரைகள்' },
          ].map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Media Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="group bg-card border border-border rounded-md overflow-hidden p-2 flex flex-col justify-between shadow-2xs hover:border-primary/50 transition-all"
            >
              <div className="relative aspect-4/3 rounded-xs overflow-hidden bg-muted mb-2">
                <img
                  src={item.url}
                  alt={item.altText}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <button
                  type="button"
                  onClick={() => setPreviewMedia(item)}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition-opacity"
                  title="முன்னோட்டம்"
                >
                  <Eye className="w-5 h-5" />
                </button>
              </div>

              <div>
                <div className="font-bold text-foreground text-xs truncate font-sans" title={item.name}>
                  {item.name}
                </div>
                <div className="text-[10px] text-muted-foreground flex justify-between mt-0.5">
                  <span className="capitalize">{item.category}</span>
                  <span>{item.size}</span>
                </div>
              </div>

              <div className="pt-2 mt-2 border-t border-border flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  className="inline-flex items-center gap-1 text-[11px] text-muted-foreground hover:text-primary font-semibold"
                  title="URL நகலெடு"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">நகலானது!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>URL</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item.id)}
                  className="p-1 rounded-xs text-destructive hover:bg-destructive/10"
                  title="நீக்கு"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EmptyState
          title="மீடியா கோப்புகள் எதுவும் இல்லை"
          description="நீங்கள் தேடிய பிரிவில் கோப்புகள் எதுவும் கிடைக்கவில்லை."
          actionText="புதிய படம் பதிவேற்று"
          onAction={() => setShowUploadModal(true)}
        />
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">புதிய மீடியா பதிவு (Upload Media)</h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-3 text-xs font-tamil">
              <div className="space-y-1">
                <label className="font-bold text-foreground">படத்தின் நேரடி URL (Image URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">கோப்பின் பெயர் (File Name)</label>
                <input
                  type="text"
                  placeholder="madras-hc-verdict.jpg"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">பிரிவு (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="article">Article Images (கட்டுரைப் படங்கள்)</option>
                  <option value="cover">Magazine Covers (இதழ் அட்டைப்படங்கள்)</option>
                  <option value="author">Author Images (எழுத்தாளர் படங்கள்)</option>
                  <option value="site">Site Images (தள முத்திரைகள்)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-foreground">Alt Text (விளக்க உரை)</label>
                <input
                  type="text"
                  placeholder="படத்தின் விளக்கம்..."
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted text-foreground"
                >
                  ரத்து செய்
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                >
                  சேமி & பதிவேற்று
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setPreviewMedia(null)}
        >
          <div
            className="bg-card border border-border rounded-lg max-w-2xl w-full p-4 shadow-2xl space-y-3"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center pb-2 border-b border-border">
              <span className="font-bold text-sm font-sans truncate">{previewMedia.name}</span>
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="aspect-16/10 rounded-md overflow-hidden bg-muted flex items-center justify-center">
              <img src={previewMedia.url} alt={previewMedia.altText} className="w-full h-full object-contain" />
            </div>
            <div className="text-xs text-muted-foreground space-y-1">
              <div>விளக்கம்: <strong className="text-foreground">{previewMedia.altText}</strong></div>
              <div className="font-mono break-all text-[11px] text-primary">{previewMedia.url}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
