'use client';

import React, { useState, useEffect } from 'react';
import {
  X,
  Search,
  UploadCloud,
  Check,
  Loader2,
  Image as ImageIcon,
  AlertCircle,
  HardDrive,
  Link as LinkIcon,
  Sparkles,
  Info
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
  title = 'படத்தைத் தேர்ந்தெடுக்கவும் (Choose Media)',
  categoryFilter,
}: MediaPickerModalProps) {
  // Tabs: library, computer upload, google drive, direct url
  const [activeTab, setActiveTab] = useState<'library' | 'computer' | 'drive' | 'url'>('library');
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>(categoryFilter || 'all');
  const [selectedItem, setSelectedItem] = useState<Media | null>(null);

  // Local Computer Upload State
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreviewUrl, setUploadPreviewUrl] = useState<string | null>(null);
  const [uploadName, setUploadName] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploadCategory, setUploadCategory] = useState(categoryFilter || 'article');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [possibleDuplicate, setPossibleDuplicate] = useState<Media | null>(null);

  // Google Drive State
  const [driveFileId, setDriveFileId] = useState('');
  const [driveFileName, setDriveFileName] = useState('');
  const [driveToken, setDriveToken] = useState('');
  const [driveAltText, setDriveAltText] = useState('');
  const [isDriveImporting, setIsDriveImporting] = useState(false);
  const [driveError, setDriveError] = useState<string | null>(null);

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

  // Local Computer File Selection & Duplicate Check
  const handleFileChange = (file: File | null) => {
    setUploadFile(file);
    setPossibleDuplicate(null);
    if (!file) {
      setUploadPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setUploadPreviewUrl(objectUrl);

    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!uploadName) {
      setUploadName(baseName);
    }
    if (!uploadAltText) {
      setUploadAltText(baseName);
    }

    // Duplicate detection check against existing library by filename
    const dup = mediaList.find(
      (m) => m.name.toLowerCase() === baseName.toLowerCase()
    );
    if (dup) {
      setPossibleDuplicate(dup);
    }
  };

  // Local Computer Upload Submit
  const handleFileUploadSubmit = async (e: React.FormEvent, forceUpload = false) => {
    if (e) e.preventDefault();
    if (!uploadFile) {
      setUploadError('தயவுசெய்து ஒரு படக் கோப்பைத் தேர்ந்தெடுக்கவும்.');
      return;
    }

    // If duplicate found and not forced, ask user
    if (possibleDuplicate && !forceUpload) {
      return;
    }

    try {
      setIsUploading(true);
      setUploadError(null);

      const formData = new FormData();
      formData.append('file', uploadFile);
      formData.append('name', uploadName.trim() || uploadFile.name);
      formData.append('alt_text', uploadAltText.trim() || uploadName.trim() || uploadFile.name);
      formData.append('category', uploadCategory);

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'படப் பதிவேற்றம் தோல்வியடைந்தது. மீண்டும் முயற்சிக்கவும்.');
      }

      onSelect({
        url: data.media.url,
        mediaId: data.media.id,
        altText: data.media.alt_text || data.media.altText,
      });
      onClose();
    } catch (err: any) {
      setUploadError(err.message || 'படப் பதிவேற்றத்தில் பிழை ஏற்பட்டது.');
    } finally {
      setIsUploading(false);
    }
  };

  // Google Drive Import Submit
  const handleDriveImportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!driveFileId.trim() || !driveToken.trim()) {
      setDriveError('கூகுள் டிரைவ் கோப்பு ஐடி மற்றும் அனுமதி டோக்கன் கட்டாயமாகும்.');
      return;
    }

    try {
      setIsDriveImporting(true);
      setDriveError(null);

      const res = await fetch('/api/admin/media/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: driveFileId.trim(),
          fileName: driveFileName.trim() || 'google-drive-image.jpg',
          mimeType: 'image/jpeg',
          accessToken: driveToken.trim(),
          altText: driveAltText.trim() || driveFileName.trim(),
          category: uploadCategory,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'கூகுள் டிரைவிலிருந்து பதிவிறக்க இயலவில்லை.');
      }

      onSelect({
        url: data.media.url,
        mediaId: data.media.id,
        altText: data.media.alt_text || data.media.altText,
      });
      onClose();
    } catch (err: any) {
      setDriveError(err.message || 'கூகுள் டிரைவ் இறக்குமதியில் பிழை.');
    } finally {
      setIsDriveImporting(false);
    }
  };

  const handleDirectUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directUrl.trim()) return;
    onSelect({
      url: directUrl.trim(),
      altText: 'வெளிப்புறப் படம்',
    });
    onClose();
  };

  const filtered = mediaList.filter((m) => {
    const term = searchQuery.toLowerCase().trim();
    if (!term) return true;
    return (
      m.name.toLowerCase().includes(term) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(term)) ||
      (m.source && m.source.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 font-tamil">
      <div className="bg-card border border-border rounded-lg max-w-4xl w-full flex flex-col max-h-[92vh] shadow-2xl animate-in fade-in zoom-in-95 overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/40">
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

        {/* 4 Unified Choice Tabs */}
        <div className="flex border-b border-border text-xs font-bold bg-muted/20 overflow-x-auto">
          <button
            type="button"
            onClick={() => setActiveTab('library')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'library'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>மீடியா நூலகம் (Media Library)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('computer')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'computer'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>கணினியிலிருந்து பதிவேற்று (From Computer)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('drive')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'drive'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <HardDrive className="w-4 h-4" />
            <span>கூகுள் டிரைவ் இறக்குமதி (Google Drive)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('url')}
            className={`flex-1 py-3 px-3 text-center border-b-2 transition-colors whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'url'
                ? 'border-primary text-primary bg-primary/10'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            <LinkIcon className="w-4 h-4" />
            <span>நேரடி URL (External Link)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {/* TAB 1: MEDIA LIBRARY */}
          {activeTab === 'library' && (
            <div className="space-y-4">
              {/* Filter and Search */}
              <div className="flex flex-col sm:flex-row gap-2.5">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="படத்தின் பெயர், விளக்கம் கொண்டு தேட..."
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
                <div className="py-16 text-center text-muted-foreground flex items-center justify-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span>படங்கள் ஏற்றப்படுகின்றன...</span>
                </div>
              ) : error ? (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md">
                  {error}
                </div>
              ) : filtered.length === 0 ? (
                <div className="py-16 text-center text-muted-foreground text-xs space-y-3">
                  <ImageIcon className="w-10 h-10 mx-auto text-muted-foreground/40" />
                  <p className="font-bold text-foreground">படங்கள் எதுவும் கிடைக்கவில்லை.</p>
                  <div className="flex justify-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setActiveTab('computer')}
                      className="px-3 py-1.5 rounded-md bg-primary text-primary-foreground font-bold text-xs hover:bg-primary/90 cursor-pointer flex items-center gap-1"
                    >
                      <UploadCloud className="w-3.5 h-3.5" />
                      <span>கணினியிலிருந்து பதிவேற்று</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('drive')}
                      className="px-3 py-1.5 rounded-md border border-border bg-card text-foreground font-bold text-xs hover:bg-muted cursor-pointer flex items-center gap-1"
                    >
                      <HardDrive className="w-3.5 h-3.5" />
                      <span>கூகுள் டிரைவ்</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3.5 max-h-[420px] overflow-y-auto p-1">
                  {filtered.map((item) => {
                    const isSelected = selectedItem?.id === item.id;
                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        className={`relative group rounded-md border overflow-hidden cursor-pointer aspect-square bg-muted transition-all ${
                          isSelected
                            ? 'ring-2 ring-primary border-primary shadow-md'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <img
                          src={item.url}
                          alt={item.alt_text || item.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        />
                        {isSelected && (
                          <div className="absolute inset-0 bg-primary/30 flex items-center justify-center">
                            <div className="w-7 h-7 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg">
                              <Check className="w-4 h-4 stroke-[3]" />
                            </div>
                          </div>
                        )}
                        <div className="absolute bottom-0 inset-x-0 bg-black/75 p-1 text-[10px] text-white truncate px-1.5">
                          <div className="truncate font-semibold">{item.name}</div>
                          {item.source && (
                            <div className="text-[9px] text-primary-foreground/80">{item.source}</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: UPLOAD FROM LOCAL COMPUTER */}
          {activeTab === 'computer' && (
            <div className="max-w-xl mx-auto py-2 space-y-4">
              {uploadError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              {possibleDuplicate && (
                <div className="p-3.5 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-md text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <Info className="w-4 h-4 shrink-0 text-amber-600" />
                    <span>இந்த படம் ஏற்கனவே மீடியா நூலகத்தில் இருக்கலாம்!</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    &quot;{possibleDuplicate.name}&quot; என்ற பெயரில் ஏற்கனவே ஒரு படம் உள்ளது. தேவையற்ற நகல்களைத் தவிர்க்க ஏற்கனவே உள்ள படத்தைப் பயன்படுத்தலாம்:
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onSelect({
                          url: possibleDuplicate.url,
                          mediaId: possibleDuplicate.id,
                          altText: possibleDuplicate.alt_text || possibleDuplicate.altText,
                        });
                        onClose();
                      }}
                      className="px-3 py-1.5 bg-primary text-primary-foreground font-bold rounded-xs cursor-pointer text-xs"
                    >
                      ஏற்கனவே உள்ள படத்தைப் பயன்படுத்து
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleFileUploadSubmit(e, true)}
                      className="px-3 py-1.5 border border-border bg-card text-foreground font-semibold rounded-xs cursor-pointer text-xs hover:bg-muted"
                    >
                      புதியதாகப் பதிவேற்று
                    </button>
                  </div>
                </div>
              )}

              <form onSubmit={(e) => handleFileUploadSubmit(e, false)} className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground">
                    கணினியிலிருந்து படக் கோப்பு (Select from Computer) *
                  </label>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => handleFileChange(e.target.files?.[0] || null)}
                    className="w-full p-2.5 rounded-md border border-border bg-background text-foreground text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                  <span className="text-[10px] text-muted-foreground block">
                    ஆதரிக்கப்படும் வடிவங்கள்: JPG, JPEG, PNG, WEBP, SVG (அதிகபட்சம் 15MB)
                  </span>
                </div>

                {uploadPreviewUrl && (
                  <div className="relative aspect-16/9 max-h-48 rounded-md overflow-hidden border border-border bg-muted">
                    <img src={uploadPreviewUrl} alt="Preview" className="w-full h-full object-contain" />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-foreground">படத்தின் பெயர் (Title)</label>
                    <input
                      type="text"
                      placeholder="எ.கா: நீதிமன்றத் தீர்ப்பு"
                      value={uploadName}
                      onChange={(e) => setUploadName(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                    />
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <label className="font-bold text-foreground">பிரிவு (Category)</label>
                    <select
                      value={uploadCategory}
                      onChange={(e) => setUploadCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                    >
                      <option value="article">கட்டுரைப் படம் (Article)</option>
                      <option value="cover">இதழ் அட்டைப்படம் (Cover)</option>
                      <option value="author">எழுத்தாளர் புகைப்படம் (Author)</option>
                      <option value="site">தள முத்திரை (Site Asset)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground">மாற்று உரை (Alt Text)</label>
                  <input
                    type="text"
                    placeholder="பார்வையற்றோர் & தேடுபொறிக்கான விளக்கம்"
                    value={uploadAltText}
                    onChange={(e) => setUploadAltText(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    கோப்புப் பெயரிலிருந்து தானாக எடுக்கப்படும் மாற்று உரையை தேவைக்கேற்ப மாற்றிக் கொள்ளலாம்.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isUploading || !uploadFile}
                  className="w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Cloudinary-ல் பதிவேற்றப்பட்டு சேமிக்கப்படுகிறது...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-4 h-4" />
                      <span>கணினியிலிருந்து பதிவேற்றிப் பயன்படுத்து</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 3: IMPORT FROM GOOGLE DRIVE */}
          {activeTab === 'drive' && (
            <div className="max-w-xl mx-auto py-2 space-y-4">
              <div className="p-3.5 bg-primary/10 border border-primary/20 rounded-md text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold text-foreground">
                  <HardDrive className="w-4 h-4 text-primary shrink-0" />
                  <span>கூகுள் டிரைவ் நேரடி இறக்குமதி (Permanent Sattavilakku Copy)</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  தேர்ந்தெடுக்கப்படும் கோப்பு தானாகவே சட்டவிளக்கின் Cloudinary சேமிப்பகத்தில் நகலெடுக்கப்பட்டுவிடும். இதனால் உங்கள் கூகுள் டிரைவில் கோப்பை மாற்றினாலும் அல்லது நீக்கினாலும் இணையதளத்தில் அது தொடர்ந்து இயங்கும்.
                </p>
              </div>

              {driveError && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-md flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{driveError}</span>
                </div>
              )}

              <form onSubmit={handleDriveImportSubmit} className="space-y-4">
                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground">
                    கூகுள் டிரைவ் கோப்பு ஐடி (Google Drive File ID) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="எ.கா: 1A2b3C4d5E6F7G8h9I0J..."
                    value={driveFileId}
                    onChange={(e) => setDriveFileId(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    Google Drive இணைப்பு முகவரியில் (URL) &apos;d/&apos; மற்றும் &apos;/view&apos; இடையே உள்ள ஐடி.
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground">கோப்பின் பெயர் (File Name)</label>
                  <input
                    type="text"
                    placeholder="எ.கா: supreme-court-order.jpg"
                    value={driveFileName}
                    onChange={(e) => setDriveFileName(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                  />
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground">
                    கூகுள் அங்கீகார டோக்கன் (OAuth Access Token) *
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="ya29.a0AfH6SM..."
                    value={driveToken}
                    onChange={(e) => setDriveToken(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-xs"
                  />
                  <span className="text-[10px] text-muted-foreground">
                    நிர்வாகியின் பாதுகாப்பான Google Picker அல்லது OAuth டோக்கன் (சர்வர் பக்கத்தில் மட்டுமே நகலெடுக்கப் பயன்படும்).
                  </span>
                </div>

                <div className="space-y-1.5 text-xs">
                  <label className="font-bold text-foreground">மாற்று உரை (Alt Text)</label>
                  <input
                    type="text"
                    placeholder="படத்திற்கான மாற்று உரை விளக்கம்"
                    value={driveAltText}
                    onChange={(e) => setDriveAltText(e.target.value)}
                    className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isDriveImporting || !driveFileId.trim() || !driveToken.trim()}
                  className="w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  {isDriveImporting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>டிரைவிலிருந்து நகலெடுக்கப்பட்டு Cloudinary-ல் சேமிக்கப்படுகிறது...</span>
                    </>
                  ) : (
                    <>
                      <HardDrive className="w-4 h-4" />
                      <span>கூகுள் டிரைவிலிருந்து பதிவிறக்கி சேமி (Import File)</span>
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: DIRECT URL */}
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
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={!directUrl.trim()}
                className="w-full py-2.5 px-4 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer shadow-xs"
              >
                இப்படத்தைப் பயன்படுத்து (Apply Image)
              </button>
            </form>
          )}
        </div>

        {/* Modal Footer (for Library Tab) */}
        {activeTab === 'library' && (
          <div className="px-5 py-3 border-t border-border flex items-center justify-between bg-muted/30 text-xs">
            <div className="text-muted-foreground truncate max-w-xs sm:max-w-md">
              {selectedItem ? (
                <span className="text-foreground font-bold">தேர்வு: {selectedItem.name}</span>
              ) : (
                'பட்டியலில் இருந்து ஒரு படத்தைத் தேர்ந்தெடுக்கவும்.'
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 rounded-md border border-border hover:bg-muted text-foreground cursor-pointer"
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
