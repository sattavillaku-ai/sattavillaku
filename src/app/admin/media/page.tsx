'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  AlertCircle,
  HardDrive,
  ShieldAlert,
  Info,
  CheckCircle2,
  Plus
} from 'lucide-react';
import { Media } from '@/types';
import { fetchMediaList, deleteMediaRecord } from '@/lib/cms-service';
import { openGoogleDrivePicker } from '@/lib/google-drive-client';

export default function AdminMediaPage() {
  const [mediaList, setMediaList] = useState<Media[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [previewMedia, setPreviewMedia] = useState<Media | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [usageModalMedia, setUsageModalMedia] = useState<Media | null>(null);

  // Upload modal state: file / drive / url
  const [uploadMode, setUploadMode] = useState<'file' | 'drive' | 'url'>('file');
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadPreview, setUploadPreview] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [driveFileId, setDriveFileId] = useState('');
  const [driveFileName, setDriveFileName] = useState('');
  const [driveToken, setDriveToken] = useState('');
  const [newCategory, setNewCategory] = useState<'article' | 'cover' | 'author' | 'site'>('article');
  const [newAltText, setNewAltText] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [possibleDuplicate, setPossibleDuplicate] = useState<Media | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Direct Upload from Computer
  const handleDirectComputerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      alert('செல்லுபடியற்ற படம். JPG, PNG, WEBP அல்லது SVG வடிவங்கள் மட்டுமே அனுமதிக்கப்படும்.');
      return;
    }

    try {
      setIsUploading(true);
      setToast({ text: 'Cloudinary-ல் படம் பதிவேற்றப்படுகிறது...', type: 'success' });
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name.replace(/\.[^/.]+$/, ''));
      formData.append('category', selectedCategory === 'all' ? 'article' : selectedCategory);
      formData.append('alt_text', file.name.replace(/\.[^/.]+$/, ''));

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'பதிவேற்றம் தோல்வியடைந்தது.');
      }

      setToast({ text: 'Upload successful! படம் வெற்றிகரமாகப் பதிவேற்றப்பட்டது.', type: 'success' });
      setTimeout(() => setToast(null), 4000);
      await loadMedia();
    } catch (err: any) {
      console.error('Upload error:', err);
      setToast({ text: err.message || 'பதிவேற்றத்தில் பிழை ஏற்பட்டது.', type: 'error' });
      setTimeout(() => setToast(null), 5000);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Direct Import from Google Drive Picker
  const handleDirectDrivePicker = () => {
    openGoogleDrivePicker({
      type: 'image',
      onSelect: async (doc, token) => {
        try {
          setIsUploading(true);
          setToast({ text: 'Google Drive-லிருந்து Cloudinary-ல் நகலெடுக்கப்படுகிறது...', type: 'success' });
          const res = await fetch('/api/admin/media/google-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId: doc.id,
              fileName: doc.name,
              mimeType: doc.mimeType,
              accessToken: token,
              category: selectedCategory === 'all' ? 'article' : selectedCategory,
              altText: doc.name,
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'டிரைவ் இறக்குமதி தோல்வியடைந்தது.');
          }
          setToast({ text: 'Google Drive படம் வெற்றிகரமாகச் சேமிக்கப்பட்டது!', type: 'success' });
          setTimeout(() => setToast(null), 4000);
          await loadMedia();
        } catch (err: any) {
          setToast({ text: err.message || 'டிரைவ் இறக்குமதியில் பிழை.', type: 'error' });
          setTimeout(() => setToast(null), 5000);
        } finally {
          setIsUploading(false);
        }
      },
      onError: (err) => {
        setUploadMode('drive');
        setShowUploadModal(true);
        setUploadError(err.message);
      },
    });
  };

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
    // Check usage first
    if (media.usageCount && media.usageCount > 0) {
      setUsageModalMedia(media);
      return;
    }

    const confirmed = window.confirm(
      `"${media.name}" படத்தை நிச்சயமாக நீக்க வேண்டுமா?\n\nகவனிக்க: இந்த படம் தற்போது எந்த கட்டுரை அல்லது இதழிலும் பயன்பாட்டில் இல்லை.`
    );
    if (!confirmed) return;

    try {
      await deleteMediaRecord(media.id);
      await loadMedia();
    } catch (err: any) {
      alert(err.message || 'மீடியா பதிவை நீக்க முடியவில்லை.');
    }
  };

  const handleFileSelection = (file: File | null) => {
    setUploadFile(file);
    setPossibleDuplicate(null);
    if (!file) {
      setUploadPreview(null);
      return;
    }
    setUploadPreview(URL.createObjectURL(file));
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    if (!newName) setNewName(baseName);
    if (!newAltText) setNewAltText(baseName);

    // Duplicate detection
    const dup = mediaList.find((m) => m.name.toLowerCase() === baseName.toLowerCase());
    if (dup) {
      setPossibleDuplicate(dup);
    }
  };

  const handleSaveUpload = async (e: React.FormEvent, force = false) => {
    if (e) e.preventDefault();
    try {
      setIsUploading(true);
      setUploadError(null);

      if (uploadMode === 'drive') {
        if (!driveFileId.trim() || !driveToken.trim()) {
          setUploadError('கூகுள் டிரைவ் கோப்பு ஐடி மற்றும் அனுமதி டோக்கன் கட்டாயமாகும்.');
          setIsUploading(false);
          return;
        }

        const res = await fetch('/api/admin/media/google-drive', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fileId: driveFileId.trim(),
            fileName: driveFileName.trim() || newName.trim() || 'google-drive-image.jpg',
            mimeType: 'image/jpeg',
            accessToken: driveToken.trim(),
            altText: newAltText.trim() || newName.trim(),
            category: newCategory,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'கூகுள் டிரைவிலிருந்து இறக்குமதி செய்ய இயலவில்லை.');
        }
      } else {
        const formData = new FormData();
        if (uploadMode === 'file') {
          if (!uploadFile) {
            setUploadError('தயவுசெய்து ஒரு படக் கோப்பைத் தேர்ந்தெடுக்கவும்.');
            setIsUploading(false);
            return;
          }
          if (possibleDuplicate && !force) {
            setIsUploading(false);
            return;
          }
          formData.append('file', uploadFile);
        } else {
          if (!newUrl.trim()) {
            setUploadError('தயவுசெய்து படத்தின் URL-ஐ உள்ளிடவும்.');
            setIsUploading(false);
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
      }

      setShowUploadModal(false);
      setUploadFile(null);
      setUploadPreview(null);
      setNewName('');
      setNewUrl('');
      setDriveFileId('');
      setDriveFileName('');
      setDriveToken('');
      setNewAltText('');
      setPossibleDuplicate(null);
      await loadMedia();
    } catch (err: any) {
      setUploadError(err.message || 'பதிவேற்றத்தில் பிழை.');
    } finally {
      setIsUploading(false);
    }
  };

  const filtered = mediaList.filter((m) => {
    const term = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !term ||
      m.name.toLowerCase().includes(term) ||
      (m.alt_text && m.alt_text.toLowerCase().includes(term)) ||
      (m.source && m.source.toLowerCase().includes(term));

    const matchesSource =
      selectedSource === 'all' ||
      (selectedSource === 'local' && m.source === 'Local Upload') ||
      (selectedSource === 'drive' && m.source === 'Google Drive') ||
      (selectedSource === 'imported' && m.source !== 'Local Upload');

    return matchesSearch && matchesSource;
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
            கட்டுரைப் படங்கள், அட்டைப்படங்கள், புகைப்படங்கள் (கணினி & கூகுள் டிரைவ் நேரடி இறக்குமதி ஆதரவு)
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/svg+xml"
            className="hidden"
            onChange={handleDirectComputerUpload}
          />

          <button
            type="button"
            disabled={isUploading}
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-primary text-primary-foreground text-xs font-bold hover:bg-primary/90 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isUploading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <UploadCloud className="w-4 h-4" />
            )}
            <span>கணினியிலிருந்து பதிவேற்று (Upload from Computer)</span>
          </button>

          <button
            type="button"
            disabled={isUploading}
            onClick={handleDirectDrivePicker}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md bg-card border border-border text-foreground hover:bg-muted text-xs font-bold transition-colors shadow-2xs cursor-pointer disabled:opacity-50"
          >
            <HardDrive className="w-4 h-4 text-primary" />
            <span>Google Drive இறக்குமதி (Import from Google Drive)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setUploadError(null);
              setShowUploadModal(true);
            }}
            className="p-2 rounded-md border border-border text-muted-foreground hover:text-foreground text-xs cursor-pointer"
            title="கூடுதல் விவரங்களுடன் பதிவேற்ற"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {toast && (
        <div
          className={`p-3.5 rounded-md text-xs font-bold flex items-center justify-between gap-2 animate-in fade-in ${
            toast.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-300'
              : 'bg-destructive/10 border border-destructive/20 text-destructive'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
            )}
            <span>{toast.text}</span>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-card border border-border p-3.5 rounded-md shadow-2xs">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="படத்தின் பெயர், விளக்கம், மூலம் கொண்டு தேட..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <Search className="w-3.5 h-3.5 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Source filter */}
          <select
            value={selectedSource}
            onChange={(e) => setSelectedSource(e.target.value)}
            className="px-2.5 py-1.5 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
          >
            <option value="all">அனைத்து மூலங்கள்</option>
            <option value="local">கணினி பதிவேற்றங்கள் (Local)</option>
            <option value="drive">கூகுள் டிரைவ் (Google Drive)</option>
            <option value="imported">இறக்குமதி செய்யப்பட்டவை</option>
          </select>

          {/* Category filter */}
          <div className="flex items-center gap-1 overflow-x-auto text-xs font-semibold">
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
            {searchQuery || selectedSource !== 'all' || selectedCategory !== 'all'
              ? 'உங்கள் தேடலுக்கு ஏற்ப படங்கள் எதுவும் கிடைக்கவில்லை.'
              : 'நூலகத்தில் படங்கள் எதுவும் பதிவு செய்யப்படவில்லை. "புதிய படம் பதிவேற்று" பொத்தானைப் பயன்படுத்தி படங்களைச் சேர்க்கவும்.'}
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

                {/* Source Badge */}
                <div className="absolute top-2 left-2">
                  <span className="px-1.5 py-0.5 rounded-xs text-[10px] font-bold bg-black/70 text-white backdrop-blur-xs flex items-center gap-1">
                    {item.source === 'Google Drive' ? (
                      <>
                        <HardDrive className="w-2.5 h-2.5 text-primary" />
                        <span>Google Drive</span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-2.5 h-2.5 text-emerald-400" />
                        <span>Local</span>
                      </>
                    )}
                  </span>
                </div>

                {/* Usage Count Badge */}
                {typeof item.usageCount === 'number' && (
                  <div className="absolute top-2 right-2">
                    <span
                      onClick={() => {
                        if (item.usageCount && item.usageCount > 0) {
                          setUsageModalMedia(item);
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold backdrop-blur-xs cursor-pointer ${
                        item.usageCount > 0
                          ? 'bg-emerald-600/90 text-white hover:bg-emerald-700'
                          : 'bg-muted/80 text-muted-foreground'
                      }`}
                      title={item.usageCount > 0 ? 'பயன்படுத்தப்பட்டுள்ள இடங்களைப் பார்' : 'பயன்பாட்டில் இல்லை'}
                    >
                      {item.usageCount > 0 ? `Used (${item.usageCount})` : 'Unused'}
                    </span>
                  </div>
                )}

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
                {item.alt_text && (
                  <div className="text-[10px] text-muted-foreground truncate" title={item.alt_text}>
                    Alt: {item.alt_text}
                  </div>
                )}
                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                  <span className="uppercase tracking-wider font-mono font-semibold">
                    {item.category}
                  </span>
                  <span>
                    {item.size || (item.size_bytes ? `${(item.size_bytes / (1024 * 1024)).toFixed(1)} MB` : 'படம்')}
                  </span>
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
                  className={`p-1 rounded-xs cursor-pointer ${
                    item.usageCount && item.usageCount > 0
                      ? 'text-muted-foreground/50 hover:text-amber-600'
                      : 'text-muted-foreground hover:text-destructive hover:bg-destructive/10'
                  }`}
                  title={
                    item.usageCount && item.usageCount > 0
                      ? 'பயன்பாட்டில் உள்ள படம் - நீக்க இயலாது'
                      : 'படத்தை நீக்கு'
                  }
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Usage Warning Modal */}
      {usageModalMedia && (
        <div
          onClick={() => setUsageModalMedia(null)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-card border border-border rounded-lg max-w-md w-full p-5 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-tamil"
          >
            <div className="flex items-center gap-2 text-amber-600 border-b border-border pb-3">
              <ShieldAlert className="w-5 h-5" />
              <h3 className="font-bold text-foreground">பயன்பாட்டில் உள்ள படம் (In-Use Media)</h3>
            </div>

            <p className="text-xs text-foreground leading-relaxed">
              &quot;<strong>{usageModalMedia.name}</strong>&quot; என்ற படம் தற்போது{' '}
              <strong>{usageModalMedia.usageCount}</strong> உருப்படிகளில் பயன்படுத்தப்படுவதால் இதை பாதுகாப்பாக நீக்க முடியாது:
            </p>

            <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-muted/40 rounded-md border border-border text-xs">
              {usageModalMedia.usedBy && usageModalMedia.usedBy.length > 0 ? (
                usageModalMedia.usedBy.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between gap-2 p-1.5 bg-background rounded-xs border border-border/50">
                    <span className="font-semibold text-foreground truncate">{item.title}</span>
                    <span className="text-[10px] text-primary uppercase font-mono shrink-0">
                      {item.type}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-muted-foreground text-xs p-1">தொடர்புடைய இணைப்புகள் கண்டறியப்பட்டன.</div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setUsageModalMedia(null)}
                className="px-4 py-1.5 bg-primary text-primary-foreground font-bold rounded-md text-xs cursor-pointer"
              >
                சரி (OK)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-card border border-border rounded-lg max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 font-tamil">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <UploadCloud className="w-5 h-5 text-primary" />
                <span>புதிய படம் சேர்க்க (Add Media)</span>
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

            {/* Switch Mode: File / Google Drive / URL */}
            <div className="flex rounded-md border border-border overflow-hidden text-xs font-bold bg-muted/40">
              <button
                type="button"
                onClick={() => setUploadMode('file')}
                className={`flex-1 py-2 text-center cursor-pointer flex items-center justify-center gap-1 ${
                  uploadMode === 'file' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>கணினி (Computer)</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('drive')}
                className={`flex-1 py-2 text-center cursor-pointer flex items-center justify-center gap-1 ${
                  uploadMode === 'drive' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <HardDrive className="w-3.5 h-3.5" />
                <span>கூகுள் டிரைவ்</span>
              </button>
              <button
                type="button"
                onClick={() => setUploadMode('url')}
                className={`flex-1 py-2 text-center cursor-pointer flex items-center justify-center gap-1 ${
                  uploadMode === 'url' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <span>நேரடி URL</span>
              </button>
            </div>

            {possibleDuplicate && uploadMode === 'file' && (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-md text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 font-bold">
                  <Info className="w-4 h-4 shrink-0 text-amber-600" />
                  <span>இந்த படம் ஏற்கனவே நூலகத்தில் இருக்கலாம்</span>
                </div>
                <p className="text-[11px]">
                  &quot;{possibleDuplicate.name}&quot; என்ற பெயரில் ஏற்கனவே ஒரு கோப்பு உள்ளது.
                </p>
                <button
                  type="button"
                  onClick={(e) => handleSaveUpload(e, true)}
                  className="px-3 py-1 bg-amber-600 text-white font-bold rounded-xs text-[11px] cursor-pointer"
                >
                  இருப்பினும் புதியதாகப் பதிவேற்று
                </button>
              </div>
            )}

            <form onSubmit={(e) => handleSaveUpload(e, false)} className="space-y-3.5 text-xs">
              {uploadMode === 'file' && (
                <div className="space-y-1.5">
                  <label className="font-bold text-foreground">படக் கோப்பு *</label>
                  <input
                    type="file"
                    required
                    accept="image/jpeg,image/png,image/webp,image/svg+xml"
                    onChange={(e) => handleFileSelection(e.target.files?.[0] || null)}
                    className="w-full p-2 rounded-md border border-border bg-background text-foreground text-xs file:mr-3 file:py-1 file:px-3 file:rounded-xs file:border-0 file:text-xs file:font-bold file:bg-primary file:text-primary-foreground cursor-pointer"
                  />
                  {uploadPreview && (
                    <div className="aspect-16/9 max-h-36 rounded-md overflow-hidden border border-border bg-muted">
                      <img src={uploadPreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  )}
                </div>
              )}

              {uploadMode === 'drive' && (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="font-bold text-foreground">Google Drive File ID *</label>
                    <input
                      type="text"
                      required
                      placeholder="1A2b3C4d5E6F7G8h..."
                      value={driveFileId}
                      onChange={(e) => setDriveFileId(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-foreground">OAuth Access Token *</label>
                    <input
                      type="password"
                      required
                      placeholder="ya29.a0AfH6SM..."
                      value={driveToken}
                      onChange={(e) => setDriveToken(e.target.value)}
                      className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground font-mono text-xs"
                    />
                  </div>
                </div>
              )}

              {uploadMode === 'url' && (
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
                  className="px-3.5 py-1.5 rounded-md border border-border hover:bg-muted cursor-pointer"
                >
                  ரத்து
                </button>
                <button
                  type="submit"
                  disabled={isUploading}
                  className="px-4 py-1.5 rounded-md bg-primary text-primary-foreground font-bold hover:bg-primary/90 disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {isUploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isUploading ? 'சேமிக்கப்படுகிறது...' : 'சேமி (Save Media)'}</span>
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
                  வகை: {previewMedia.category} • மூலம்: {previewMedia.source || 'Media Library'}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyUrl(previewMedia)}
                  className="px-3 py-1 bg-primary text-primary-foreground rounded-xs font-bold flex items-center gap-1 cursor-pointer"
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
