'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  UploadCloud,
  FileUp,
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  CheckCircle,
  Eye,
  Loader2,
  FileCheck,
  AlertCircle,
  Sparkles,
  HardDrive,
} from 'lucide-react';
import { Issue, TableOfContentItem, IssueStatus } from '@/types';
import { saveIssue, generateSlug } from '@/lib/cms-service';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';

interface IssueFormProps {
  initialIssue?: Issue;
  isEditing?: boolean;
}

export function IssueForm({ initialIssue, isEditing = false }: IssueFormProps) {
  const router = useRouter();

  // Basic Details
  const [title, setTitle] = useState(initialIssue?.title || '');
  const [issueNumber, setIssueNumber] = useState(initialIssue?.issueNumber ?? 12);
  const [volumeNumber, setVolumeNumber] = useState(initialIssue?.volume_number ?? 1);
  const [slug, setSlug] = useState(
    initialIssue?.slug || `vol-1-issue-${initialIssue?.issueNumber ?? 12}`
  );
  const [month, setMonth] = useState(initialIssue?.month || 'அக்டோபர்');
  const [year, setYear] = useState(initialIssue?.year || new Date().getFullYear());
  const [description, setDescription] = useState(initialIssue?.description || '');

  // Files & Media
  const [coverUrl, setCoverUrl] = useState(
    initialIssue?.coverUrl ||
      initialIssue?.cover_image_url ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
  );
  const [pdfUrl, setPdfUrl] = useState(initialIssue?.pdfUrl || initialIssue?.pdf_url || '');
  const [pageCount, setPageCount] = useState(initialIssue?.pageCount || 64);
  const [status, setStatus] = useState<IssueStatus>(initialIssue?.status || 'draft');
  const [isFree, setIsFree] = useState(initialIssue?.is_free !== false);
  const [publicationDate, setPublicationDate] = useState(
    initialIssue?.publicationDate
      ? initialIssue.publicationDate.split('T')[0]
      : new Date().toISOString().split('T')[0]
  );

  // Table of Contents
  const [toc, setToc] = useState<TableOfContentItem[]>(
    initialIssue?.tableOfContents && initialIssue.tableOfContents.length > 0
      ? initialIssue.tableOfContents
      : [
          { page: 3, title: 'தலையங்கம்: சட்டத்தின் முன் சமத்துவம்', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
          { page: 8, title: 'நீதிமன்ற வழக்குகளில் புதிய சட்டங்களின் தாக்கம்', author: 'முனைவர் தமிழ்ச்செல்வி', category: 'சட்டம்' },
        ]
  );

  // UI / Action State
  const [showMediaPicker, setShowMediaPicker] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [uploadPdfError, setUploadPdfError] = useState('');
  const [uploadPdfSuccess, setUploadPdfSuccess] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const pdfInputRef = useRef<HTMLInputElement>(null);

  // TOC Handlers
  const handleAddTocRow = () => {
    const lastPage = toc.length > 0 ? toc[toc.length - 1].page + 4 : 4;
    setToc([...toc, { page: lastPage, title: '', author: '', category: 'சட்டம்' }]);
  };

  const handleRemoveTocRow = (index: number) => {
    setToc(toc.filter((_, i) => i !== index));
  };

  const handleTocChange = (index: number, field: keyof TableOfContentItem, value: any) => {
    const updated = [...toc];
    updated[index] = { ...updated[index], [field]: value };
    setToc(updated);
  };

  // PDF File Upload Handler (Supabase Storage)
  const handlePdfFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      setUploadPdfError('PDF கோப்புகளை மட்டுமே பதிவேற்ற முடியும்.');
      return;
    }

    setIsUploadingPdf(true);
    setUploadPdfError('');
    setUploadPdfSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('issue_id', initialIssue?.id || '');
      formData.append('issue_number', issueNumber.toString());
      formData.append('year', year.toString());
      if (pdfUrl) {
        formData.append('old_pdf_url', pdfUrl);
      }

      const res = await fetch('/api/admin/issues/pdf/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'PDF பதிவேற்றத்தில் பிழை ஏற்பட்டது.');
      }

      setPdfUrl(data.pdfUrl);
      if (data.pageCount) {
        setPageCount(data.pageCount);
      }
      setUploadPdfSuccess(`PDF வெற்றிகரமாகப் பதிவேற்றப்பட்டது! (${data.pageCount ? `${data.pageCount} பக்கங்கள்` : file.name})`);
    } catch (err: any) {
      console.error('PDF upload error:', err);
      setUploadPdfError(err.message || 'PDF பதிவேற்றத்தில் பிழை ஏற்பட்டது.');
    } finally {
      setIsUploadingPdf(false);
      if (pdfInputRef.current) pdfInputRef.current.value = '';
    }
  };

  // Google Drive PDF Import Handler
  const handleDrivePdfImport = async (driveFileId: string, driveFileName: string, accessToken: string) => {
    if (!driveFileId || !accessToken) {
      setUploadPdfError('கூகுள் டிரைவ் கோப்பு ஐடி மற்றும் டோக்கன் தேவை.');
      return;
    }

    setIsUploadingPdf(true);
    setUploadPdfError('');
    setUploadPdfSuccess('');

    try {
      const res = await fetch('/api/admin/issues/pdf/google-drive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileId: driveFileId,
          fileName: driveFileName || `issue-${issueNumber}.pdf`,
          accessToken,
          issueNumber: issueNumber.toString(),
          year: year.toString(),
          oldPdfUrl: pdfUrl,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'கூகுள் டிரைவிலிருந்து PDF இறக்குமதி தோல்வியடைந்தது.');
      }

      setPdfUrl(data.pdfUrl);
      if (data.pageCount) {
        setPageCount(data.pageCount);
      }
      setUploadPdfSuccess(`கூகுள் டிரைவிலிருந்து PDF வெற்றிகரமாக நகலெடுக்கப்பட்டது! (${data.pageCount ? `${data.pageCount} பக்கங்கள்` : data.fileName})`);
    } catch (err: any) {
      console.error('Drive PDF import error:', err);
      setUploadPdfError(err.message || 'கூகுள் டிரைவ் PDF இறக்குமதியில் பிழை ஏற்பட்டது.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  // Auto slug generation
  const handleAutoSlug = () => {
    if (title.trim()) {
      setSlug(generateSlug(title));
    } else {
      setSlug(`vol-${volumeNumber}-issue-${issueNumber}`);
    }
  };

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveError('');
    setSavedSuccess(false);

    try {
      const cleanToc = toc.filter((t) => t.title && t.title.trim());

      await saveIssue({
        id: initialIssue?.id,
        title: title.trim(),
        slug: slug.trim(),
        volume_number: Number(volumeNumber) || 1,
        issue_number: Number(issueNumber) || 1,
        month: month.trim(),
        year: Number(year),
        description: description.trim(),
        cover_image_url: coverUrl.trim(),
        pdf_url: pdfUrl.trim(),
        status,
        is_free: isFree,
        page_count: Number(pageCount) || 0,
        table_of_contents: cleanToc,
        published_at: publicationDate ? new Date(publicationDate).toISOString() : null,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/issues');
      }, 1000);
    } catch (err: any) {
      console.error('Save issue error:', err);
      setSaveError(err.message || 'இதழைச் சேமிக்க முடியவில்லை.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto font-tamil pb-16">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/issues"
            className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isEditing ? `இதழ் ${issueNumber} திருத்துதல் (Edit Issue)` : 'புதிய இதழ் உருவாக்குதல் (New Magazine Issue)'}
            </h1>
            <div className="text-xs text-muted-foreground">
              அச்சு மற்றும் டிஜிட்டல் இதழ் மேலாண்மை (Supabase public.issues)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              வெற்றிகரமாகச் சேமிக்கப்பட்டது!
            </span>
          )}

          {isEditing && slug && (
            <Link
              href={`/magazine/${slug}`}
              target="_blank"
              className="inline-flex items-center gap-1 px-3 py-2 rounded-md border border-border bg-card text-xs font-semibold hover:bg-muted text-foreground transition-colors"
            >
              <Eye className="w-3.5 h-3.5 text-primary" />
              <span>முன்னோட்டம்</span>
            </Link>
          )}

          <button
            type="submit"
            disabled={isSaving || isUploadingPdf}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'சேமிக்கப்படுகிறது...' : isEditing ? 'மாற்றங்களைச் சேமி' : 'இதழைச் சேமி'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Form Fields */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <h2 className="text-base font-bold text-foreground border-b border-border pb-2">
              இதழ் அடிப்படை விவரங்கள்
            </h2>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                இதழின் தலைப்பு (Issue Title) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="எ.கா: அரசியல் சாசனத்தின் 75 ஆண்டுகள்: ஜனநாயகத்தின் எதிர்காலம்"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  தொகுதி (Vol.) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={volumeNumber}
                  onChange={(e) => setVolumeNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  இதழ் எண் (Issue No.) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={issueNumber}
                  onChange={(e) => setIssueNumber(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">மாதம்</label>
                <input
                  type="text"
                  placeholder="எ.கா: அக்டோபர்"
                  value={month}
                  onChange={(e) => setMonth(e.target.value)}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">ஆண்டு</label>
                <input
                  type="number"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-foreground">
                  இணைய முகவரி (URL Slug) <span className="text-destructive">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleAutoSlug}
                  className="text-[11px] text-primary hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>தானாக உருவாக்கு</span>
                </button>
              </div>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="எ.கா: vol-1-issue-12"
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">இதழ் சுருக்கக் குறிப்பு (Description)</label>
              <textarea
                rows={3}
                placeholder="இவ்விதழின் முக்கிய மையக் கருத்து, சிறப்பம்சங்கள் மற்றும் ஆசிரியரின் குறிப்பு..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </div>
          </div>

          {/* Table of Contents Builder */}
          <div className="bg-card border border-border rounded-lg p-5 sm:p-6 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h2 className="text-base font-bold text-foreground">பொருளடக்கம் (Table of Contents)</h2>
                <p className="text-[11px] text-muted-foreground">இதழில் இடம்பெறும் கட்டுரைகள் மற்றும் பக்க எண்கள்</p>
              </div>
              <button
                type="button"
                onClick={handleAddTocRow}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>வரிசை சேர்</span>
              </button>
            </div>

            <div className="space-y-2">
              {toc.length === 0 && (
                <div className="text-xs text-muted-foreground py-4 text-center">
                  பொருளடக்கம் இன்னும் சேர்க்கப்படவில்லை. &quot;வரிசை சேர்&quot; பொத்தானை அழுத்தவும்.
                </div>
              )}
              {toc.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 rounded-md bg-muted/40 border border-border/70 text-xs">
                  <div className="w-16">
                    <input
                      type="number"
                      placeholder="பக்."
                      value={item.page}
                      onChange={(e) => handleTocChange(idx, 'page', Number(e.target.value))}
                      className="w-full px-2 py-1 rounded-xs border border-border bg-card text-foreground font-mono text-center"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="கட்டுரை தலைப்பு..."
                      value={item.title}
                      onChange={(e) => handleTocChange(idx, 'title', e.target.value)}
                      className="w-full px-2 py-1 rounded-xs border border-border bg-card text-foreground"
                    />
                  </div>
                  <div className="w-28 sm:w-36">
                    <input
                      type="text"
                      placeholder="கட்டுரையாளர்..."
                      value={item.author || ''}
                      onChange={(e) => handleTocChange(idx, 'author', e.target.value)}
                      className="w-full px-2 py-1 rounded-xs border border-border bg-card text-foreground"
                    />
                  </div>
                  <div className="w-20 sm:w-28">
                    <input
                      type="text"
                      placeholder="பிரிவு..."
                      value={item.category || ''}
                      onChange={(e) => handleTocChange(idx, 'category', e.target.value)}
                      className="w-full px-2 py-1 rounded-xs border border-border bg-card text-foreground"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTocRow(idx)}
                    className="p-1 rounded-xs text-destructive hover:bg-destructive/10 cursor-pointer"
                    title="நீக்கு"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Files & Publishing Meta */}
        <div className="lg:col-span-4 space-y-6">
          {/* Status and Publish */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              வெளியீட்டு நிலை (Status & Access)
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">நிலை</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as IssueStatus)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">வரைவு (Draft - மறைக்கப்பட்ட நிலை)</option>
                <option value="published">வெளியிடப்பட்டது (Published - பொது பார்வைக்கு)</option>
                <option value="archived">காப்பகம் (Archived - பழைய இதழ்)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">வெளியீட்டுத் தேதி</label>
              <input
                type="date"
                value={publicationDate}
                onChange={(e) => setPublicationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">பக்கங்களின் எண்ணிக்கை (Page Count)</label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="checkbox"
                id="is-free-toggle"
                checked={isFree}
                onChange={(e) => setIsFree(e.target.checked)}
                className="w-4 h-4 rounded-xs border-border text-primary focus:ring-primary"
              />
              <label htmlFor="is-free-toggle" className="text-xs text-foreground font-semibold cursor-pointer">
                இலவச இதழ் (Public Free Access)
              </label>
            </div>
          </div>

          {/* Cover Image Upload (Cloudinary via MediaPickerModal) */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">
                அட்டைப்படம் (Cover Image)
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>தேர்வு செய்</span>
              </button>
            </div>

            {coverUrl && (
              <div className="relative aspect-3/4 rounded-md overflow-hidden border border-border bg-muted group">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">படத்தின் நேரடி URL:</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-2 py-1.5 rounded-xs border border-border bg-background text-foreground text-xs font-sans"
              />
            </div>

            <button
              type="button"
              onClick={() => setShowMediaPicker(true)}
              className="w-full py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UploadCloud className="w-4 h-4" />
              <span>மீடியா நூலகம் / Cloudinary பதிவேற்றம்</span>
            </button>
          </div>

          {/* PDF File Upload (Supabase Storage Private Bucket) */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>டிஜிட்டல் இதழ் PDF (Supabase Storage)</span>
            </h3>

            {pdfUrl ? (
              <div className="p-3 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-800 dark:text-emerald-300">
                  <FileCheck className="w-4 h-4 shrink-0" />
                  <span className="truncate">{pdfUrl}</span>
                </div>
                <div className="text-[11px] text-muted-foreground">
                  PDF ஆவணம் இணைக்கப்பட்டுள்ளது ({pageCount} பக்கங்கள்)
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-md bg-muted/60 border border-border text-xs text-muted-foreground">
                PDF கோப்பு இன்னும் பதிவேற்றப்படவில்லை.
              </div>
            )}

            {uploadPdfSuccess && (
              <div className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <CheckCircle className="w-3.5 h-3.5" />
                <span>{uploadPdfSuccess}</span>
              </div>
            )}

            {uploadPdfError && (
              <div className="text-xs text-destructive flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{uploadPdfError}</span>
              </div>
            )}

            <input
              ref={pdfInputRef}
              type="file"
              accept=".pdf,application/pdf"
              className="hidden"
              onChange={handlePdfFileSelect}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <button
                type="button"
                disabled={isUploadingPdf}
                onClick={() => pdfInputRef.current?.click()}
                className="py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isUploadingPdf ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>பதிவேற்றப்படுகிறது...</span>
                  </>
                ) : (
                  <>
                    <FileUp className="w-4 h-4" />
                    <span>கணினியிலிருந்து PDF</span>
                  </>
                )}
              </button>

              <button
                type="button"
                disabled={isUploadingPdf}
                onClick={() => {
                  const driveId = prompt('Google Drive PDF கோப்பு ஐடியை (File ID) உள்ளிடவும்:');
                  if (!driveId) return;
                  const token = prompt('Google OAuth Access Token உள்ளிடவும்:');
                  if (!token) return;
                  handleDrivePdfImport(driveId, `issue-${issueNumber}.pdf`, token);
                }}
                className="py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <HardDrive className="w-4 h-4" />
                <span>Google Drive PDF இறக்குமதி</span>
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground">அல்லது Storage பாதை / நேரடி URL:</label>
              <input
                type="text"
                value={pdfUrl}
                onChange={(e) => setPdfUrl(e.target.value)}
                placeholder="magazines/2026/issue-12/magazine.pdf"
                className="w-full px-2 py-1 rounded-xs border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(media) => {
          setCoverUrl(media.url);
          setShowMediaPicker(false);
        }}
      />
    </form>
  );
}
