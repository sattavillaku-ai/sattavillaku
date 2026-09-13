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
  X,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Media } from '@/types';
import { fetchMediaList, deleteMediaRecord } from '@/lib/cms-service';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);

  // Upload modal state
  const [uploadMode, setUploadMode] = useState<'file' | 'url'>('file');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newCategory, setNewCategory] = useState<'article' | 'cover' | 'author' | 'site'>('article');
  const [newAltText, setNewAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMediaList(selectedCategory === 'all' ? undefined : selectedCategory);
      setMediaList(data);
    } catch (err: any) {
      console.error('Error fetching media:', err);
      setError(err.message || 'மீடியா கோப்புகளை ஏற்றுவதில் பிழை.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMedia();
  }, [selectedCategory]);

  const handleCopyUrl = async (media: Media) => {
    try {
      await navigator.clipboard.writeText(media.url);
      setCopiedId(media.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      // ignore
    }
  };

  const handleDelete = async (media: Media) => {
    const confirmed = window.confirm(
      `"${media.name}" கோப்பை நிச்சயமாக நீக்க வேண்டுமா?\n\nகவனிக்க: கட்டுரைகளில் இந்த படம் பயன்படுத்தப்பட்டிருந்தால் அது பாதிக்கப்படலாம்.`
    );
    if (!confirmed) return;

    try {
      await deleteMediaRecord(media.id);
      await loadMedia();
    } catch (err: any) {
      alert(err.message || 'மீடியா பதிவை நீக்க முடியவில்லை.');
    }
  };

  const handleSaveUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      if (uploadMode === 'file') {
        if (!uploadFile) {
          setUploadError('தயவுசெய்து ஒரு படக் கோப்பைத் தேர்ந்தெடுக்கவும்.');
          return;
        }
        formData.append('file', uploadFile);
      } else {
        if (!newUrl.trim()) {
          setUploadError('தயவுசெய்து படத்தின் URL-ஐ உள்ளிடவும்.');
          return;
        }
        formData.append('url', newUrl.trim());
      }

      formData.append('name', newName || uploadFile?.name || 'media-item');
      formData.append('category', newCategory);
      formData.append('alt_text', newAltText || newName || 'media item');

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'மீடியா பதிவேற்றம் தோல்வியடைந்தது.');
      }

      setShowUploadModal(false);
      setUploadFile(null);
      setNewName('');
      setNewUrl('');
      setNewAltText('');
      await loadMedia();
    } catch (err: any) {
      setUploadError(err.message || 'பதிவேற்றத்தில் பிழை.');
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = mediaList.filter((m) => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return true;
    return (
      m.name.toLowerCase().includes(term) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(term)) ||
      (m.altText && m.altText.toLowerCase().includes(term))
    );
  });

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-tamil">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ImageIcon className="w-6 h-6 text-primary" />
            <span>மீடியா நூலகம் (Media Library)</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            கட்டுரைப் படங்கள், அட்டைப்படங்கள் மற்றும் புகைப்படங்கள் (Cloudinary & Supabase public.media)
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setUploadError(null);
            setShowUploadModal(true);
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
        >
          <UploadCloud className="w-4 h-4" />
          <span>புதிய படம் பதிவேற்று (Upload Media)</span>
        </button>
      </div>

      {error && (
        <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card border border-border p-3 rounded-md shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="படத்தின் பெயர் அல்லது விளக்கம் கொண்டு தேட..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
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
              className={`px-3 py-1.5 rounded-xs transition-colors whitespace-nowrap cursor-pointer ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground font-bold'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="p-12 text-center bg-card border border-border rounded-lg text-muted-foreground flex items-center justify-center gap-2 text-xs">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />
          <span>மீடியா கோப்புகள் ஏற்றப்படுகின்றன...</span>
        </div>
      )}

      {/* Empty State */}
      {!loading && filtered.length === 0 && (
        <div className="p-12 text-center bg-card border border-border rounded-lg text-muted-foreground text-xs space-y-3">
          <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40" />
          <p className="text-sm font-bold text-foreground">மீடியா கோப்புகள் எதுவும் இல்லை.</p>
          <p className="text-xs">
            {searchQuery
              ? 'உங்கள் தேடலுக்கு ஏற்ப படங்கள் எதுவும் கிடைக்கவில்லை.'
              : 'நூலகத்தில் படங்கள் எதுவும் பதிவு செய்யப்படவில்லை. "புதிய படம் பதிவேற்று" பொத்தானைப் பயன்படுத்தி முதல் படத்தைச் சேர்க்கவும்.'}
          </p>
          <button
            type="button"
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 cursor-pointer"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>படம் பதிவேற்று</span>
          </button>
        </div>
      )}

      {/* Media Grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((item) => (
            <div
              key={item.id}
              className="bg-card border border-border rounded-lg overflow-hidden shadow-2xs hover:border-primary/50 transition-all flex flex-col justify-between group"
            >
              {/* Image Thumbnail */}
              <div className="aspect-square bg-muted relative overflow-hidden">
                <img
                  src={item.url}
                  alt={item.alt_text || item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPreviewMedia(item)}
                    className="p-1.5 rounded-full bg-background/90 text-foreground hover:bg-background cursor-pointer shadow-md"
                    title="பெரிதாக்கிப் பார்"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCopyUrl(item)}
                    className="p-1.5 rounded-full bg-background/90 text-foreground hover:bg-background cursor-pointer shadow-md"
                    title="URL நகலெடு"
                  >
                    {copiedId === item.id ? (
                      <Check className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Card Meta */}
              <div className="p-3 text-xs space-y-1">
                <div className="font-bold text-foreground truncate" title={item.name}>
                  {item.name}
                </div>
                <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                  <span className="uppercase tracking-wider font-mono font-semibold">
                    {item.category}
                  </span>
                  <span>{item.size || (item.size_bytes ? `${(item.size_bytes / (1024 * 1024)).toFixed(1)} MB` : 'படம்')}</span>
                </div>
              </div>

              {/* Card Action footer */}
              <div className="px-3 py-2 border-t border-border flex items-center justify-between text-[11px] bg-muted/20">
                <button
                  type="button"
                  onClick={() => handleCopyUrl(item)}
                  className="text-primary hover:underline flex items-center gap-1 font-semibold cursor-pointer"
                >
                  {copiedId === item.id ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-600">நகலெடுக்கப்பட்டது</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>URL நகல்</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => handleDelete(item)}
                  className="p-1 rounded-xs hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                  title="நீக்கு"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground">
                புதிய படம் பதிவேற்று (Upload Media)
              </h3>
              <button
                type="button"
                onClick={() => setShowUploadModal(false)}
                className="text-muted-foreground hover:text-foreground cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {uploadError && (
              <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{uploadError}</span>
              </div>
            )}

            {/* Switch Mode: File / URL */}
            <div className="flex rounded-md border border-border overflow-hidden text-xs font-bold">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-1.5 text-center cursor-pointer ${
                  uploadMode === 'file' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                கோப்புப் பதிவேற்றம் (File)
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-1.5 text-center cursor-pointer ${
                  uploadMode === 'url' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}
              >
                நேரடி URL (External Link)
              </button>
            </div>

            <form onSubmit={handleSaveUpload} className="space-y-3.5 text-xs font-tamil">
              {uploadMode === 'file' ? (
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">படக் கோப்பு *</label>
                  <input
                    type="file"
                    required
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setUploadFile(file);
                        if (!newName) {
                          setNewName(file.name.replace(/\.[^/.]+$/, ''));
                        }
                      }
                    }}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">படத்தின் நேரடி URL *</label>
                  <input
                    type="url"
                    required
                    placeholder="https://images.unsplash.com/..."
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans"
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">படத்தின் பெயர் (Title)</label>
                <input
                  type="text"
                  placeholder="எ.கா: சென்னை உயர் நீதிமன்றம்"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">பிரிவு (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                >
                  <option value="article">கட்டுரைப் படம் (Article)</option>
                  <option value="cover">இதழ் அட்டைப்படம் (Cover)</option>
                  <option value="author">எழுத்தாளர் புகைப்படம் (Author)</option>
                  <option value="site">தள முத்திரை (Site Asset)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-foreground">மாற்று உரை (Alt Text)</label>
                <input
                  type="text"
                  placeholder="தேடுபொறி மற்றும் பார்வைத் திறனற்றோருக்கான விளக்கம்"
                  value={newAltText}
                  onChange={(e) => setNewAltText(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded-md border border-border hover:bg-muted cursor-pointer"
                >
                  ரத்து
                </button>
                <button
                  type="submit"
                  disabled={isUploading || (uploadMode === 'file' && !uploadFile) || (uploadMode === 'url' && !newUrl)}
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'பதிவேற்றப்படுகிறது...' : 'சேமி (Save Media)'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewMedia && (
        <div
          onClick={() => setPreviewMedia(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-lg max-w-2xl w-full overflow-hidden shadow-2xl animate-in fade-in zoom-in-95"
          >
            <div className="relative aspect-16/10 bg-black flex items-center justify-center">
              <img
                src={previewMedia.url}
                alt={previewMedia.alt_text || previewMedia.name}
                className="max-h-full max-w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setPreviewMedia(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/60 text-white hover:bg-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-2 text-xs font-tamil">
              <div className="font-bold text-sm text-foreground">{previewMedia.name}</div>
              <div className="text-muted-foreground break-all font-mono text-[11px]">
                {previewMedia.url}
              </div>
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <span className="text-muted-foreground uppercase text-[10px]">
                  வகை: {previewMedia.category}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewMedia)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-xs font-bold flex items-center gap-1"
                >
                  <Copy className="w-3 h-3" />
                  <span>URL நகலெடு</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
