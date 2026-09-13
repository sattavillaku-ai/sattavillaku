'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  UploadCloud,
  Check,
  Loader2,
  Image as ImageIcon,
  AlertCircle
} from 'lucide-react';
import { Media } from '@/types';
import { fetchMediaList } from '@/lib/cms-service';

interface MediaPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (media: { url: string; mediaId?: string; altText?: string }) => void;
  title?: string;
  categoryFilter?: string;
}

export function MediaPickerModal({
  isOpen,
  onClose,
  onSelect,
  title = 'படத்தைத் தேர்ந்தெடுக்கவும் (Select Media)',
  categoryFilter,
}: MediaPickerModalProps) {
  const [activeTab, setActiveTab] = useState<'library' | 'upload' | 'url'>('library');
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);

  // Upload form state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCategory, setUploadCategory] = useState(categoryFilter || 'article');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Direct URL state
  const [directUrl, setDirectUrl] = useState('');

  const loadMedia = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchMediaList(selectedCategory === 'all' ? undefined : selectedCategory);
      setMediaList(data);
    } catch (err: any) {
      setError(err.message || 'மீடியா பட்டியலை ஏற்றுவதில் பிழை.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadMedia();
    }
  }, [isOpen, selectedCategory]);

  if (!isOpen) return null;

  const handleConfirmSelection = () => {
    if (selectedItem) {
      onSelect({
        url: selectedItem.url,
        mediaId: selectedItem.id,
        altText: selectedItem.alt_text || selectedItem.altText,
      });
      onClose();
    }
  };

  const handleFileUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) {
      setUploadError('தயவுசெய்து ஒரு படக் கோப்பைத் தேர்ந்தெடுக்கவும்.');
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName || uploadFile.name);
      formData.append('alt_text', uploadAltText || uploadName || uploadFile.name);
      formData.append('category', uploadCategory);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'படப் பதிவேற்றம் தோல்வியடைந்தது.');
      }

      // Auto select and close
      onSelect({
        url: data.media.url,
        mediaId: data.media.id,
        altText: data.media.alt_text || data.media.altText,
      });
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'பதிவேற்றத்தில் பிழை.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    onSelect({
      url: directUrl.trim(),
    });
    onClose();
  };

  const filtered = mediaList.filter((m) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      m.name.toLowerCase().includes(term) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-tamil">
      <div className="bg-card border border-border rounded-lg max-w-3xl w-full flex flex-col max-h-[90vh] shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-muted/30">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-primary" />
            <h3 className="text-base font-bold text-foreground">{title}</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex border-b border-border text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'library'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            மீடியா நூலகம் (Media Library)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'upload'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            புதிய படம் பதிவேற்று (Upload Cloudinary)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-2.5 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'url'
                ? 'border-primary text-primary bg-primary/5'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            நேரடி URL (External Image Link)
          </button>
        </div>

        {/* Modal Content Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Filter bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="படத்தின் பெயர் தேட..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                  <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
                >
                  <option value="all">அனைத்துப் பிரிவுகள்</option>
                  <option value="article">கட்டுரைப் படங்கள்</option>
                  <option value="cover">இதழ் அட்டைப்படங்கள்</option>
                  <option value="author">எழுத்தாளர் படங்கள்</option>
                  <option value="site">தள முத்திரைகள்</option>
                </select>
              </div>

              {loading ? (
                <div className="py-12 text-center text-muted-foreground flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>படங்கள் ஏற்றப்படுகின்றன...</span>
                </div>
              ) : error ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md">
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-12 text-center text-muted-foreground text-xs space-y-2">
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground/40" />
                  <p>மீடியா நூலகத்தில் படங்கள் எதுவும் இல்லை.</p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('upload')}
                    className="text-primary hover:underline font-bold text-xs"
                  >
                    புதிய படம் பதிவேற்ற இங்கே கிளிக் செய்யவும் &rarr;
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-[400px] overflow-y-auto p-1">
                  {filtered.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`relative group rounded-md border overflow-hidden cursor-pointer aspect-square bg-muted transition-all ${
                          isSelected
                            ? 'ring-2 ring-primary border-primary'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.alt_text || item.name}
                          className="w-full h-full object-cover"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[10px] text-white truncate px-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          {item.name}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD (Cloudinary) */}
          {activeTab === 'upload' && (
            <form onSubmit={handleFileUploadSubmit} className="space-y-4 max-w-lg mx-auto py-2">
              {uploadError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-foreground">படக் கோப்பு (Image File) *</label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setUploadFile(file);
                      if (!uploadName) {
                        setUploadName(file.name.replace(/\.[^/.]+$/, ''));
                      }
                    }
                  }}
                  className="w-full p-2 rounded-md border border-border bg-background text-foreground text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground cursor-pointer"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-foreground">படத்தின் பெயர் (Title)</label>
                <input
                  type="text"
                  placeholder="எ.கா: உச்ச நீதிமன்ற தீர்ப்பு ஆய்வு"
                  value={uploadName}
                  onChange={(e) => setUploadName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-foreground">மாற்று உரை (Alt Text)</label>
                <input
                  type="text"
                  placeholder="பார்வையற்றோர் மற்றும் தேடுபொறிக்கான விளக்கம்"
                  value={uploadAltText}
                  onChange={(e) => setUploadAltText(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
                />
              </div>

              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-foreground">பிரிவு (Category)</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
                >
                  <option value="article">கட்டுரைப் படம் (Article)</option>
                  <option value="cover">இதழ் அட்டைப்படம் (Cover)</option>
                  <option value="author">எழுத்தாளர் புகைப்படம் (Author)</option>
                  <option value="site">தள முத்திரை (Site Asset)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={isUploading || !uploadFile}
                className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Cloudinary-ல் பதிவேற்றப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Cloudinary-ல் பதிவேற்றிப் பயன்படுத்து</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* TAB 3: DIRECT URL */}
          {activeTab === 'url' && (
            <form onSubmit={handleDirectUrlSubmit} className="space-y-4 max-w-lg mx-auto py-4">
              <div className="space-y-1.5 text-xs">
                <label className="font-bold text-foreground">இணையப் பட முகவரி (Direct Image URL) *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={directUrl}
                  onChange={(e) => setDirectUrl(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-sans text-xs"
                />
              </div>

              {directUrl && (
                <div className="aspect-video max-h-48 rounded-md overflow-hidden border border-border bg-muted">
                  <img
                    src={directUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!directUrl.trim()}
                className="w-full py-2 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                இப்படத்தைப் பயன்படுத்து (Apply Image)
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer */}
        {activeTab === 'library' && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/20 text-xs">
            <div className="text-muted-foreground truncate max-w-xs sm:max-w-md">
              {selectedItem ? (
                <span className="text-foreground font-bold">தேர்வு: {selectedItem.name}</span>
              ) : (
                'பட்டியலில் இருந்து ஒரு படத்தை தேர்வு செய்யவும்.'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-md border border-border hover:bg-muted text-foreground cursor-pointer"
              >
                ரத்து
              </button>
              <button
                type="button"
                disabled={!selectedItem}
                onClick={handleConfirmSelection}
                className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                தேர்வு செய் (Select)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
