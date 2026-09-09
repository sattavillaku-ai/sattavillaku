'use client';

import React, { useState } from 'react';
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
  Eye
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Issue, TableOfContentItem } from '@/types';

interface IssueFormProps {
  initialIssue?: Issue;
  isEditing?: boolean;
}

export function IssueForm({ initialIssue, isEditing = false }: IssueFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialIssue?.title || '');
  const [issueNumber, setIssueNumber] = useState(initialIssue?.issueNumber || 49);
  const [slug, setSlug] = useState(initialIssue?.slug || `issue-${initialIssue?.issueNumber || 49}-october-2026`);
  const [month, setMonth] = useState(initialIssue?.month || 'அக்டோபர்');
  const [year, setYear] = useState(initialIssue?.year || 2026);
  const [description, setDescription] = useState(initialIssue?.description || '');
  const [coverUrl, setCoverUrl] = useState(
    initialIssue?.coverUrl ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80'
  );
  const [pdfUrl, setPdfUrl] = useState(initialIssue?.pdfUrl || '/magazine-sample.pdf');
  const [pageCount, setPageCount] = useState(initialIssue?.pageCount || 64);
  const [status, setStatus] = useState<'published' | 'draft'>(initialIssue?.status || 'draft');
  const [publicationDate, setPublicationDate] = useState(
    initialIssue?.publicationDate || new Date().toISOString().split('T')[0]
  );

  const [toc, setToc] = useState<TableOfContentItem[]>(
    initialIssue?.tableOfContents || [
      { page: 3, title: 'தலையங்கம்: சட்டத்தின் முன் சமத்துவம்', author: 'கே. எஸ். இளங்கோவன்', category: 'தலையங்கம்' },
      { page: 8, title: 'நீதிமன்ற வழக்குகளில் புதிய சட்டங்களின் தாக்கம்', author: 'முனைவர் தமிழ்ச்செல்வி', category: 'சட்டம்' },
    ]
  );

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleAddTocRow = () => {
    setToc([...toc, { page: toc.length * 6 + 4, title: '', author: '', category: 'சட்டம்' }]);
  };

  const handleRemoveTocRow = (index: number) => {
    setToc(toc.filter((_, i) => i !== index));
  };

  const handleTocChange = (index: number, field: keyof TableOfContentItem, value: any) => {
    const updated = [...toc];
    updated[index] = { ...updated[index], [field]: value };
    setToc(updated);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const issueToSave: Issue = {
      id: initialIssue?.id || `issue-${issueNumber}`,
      title,
      issueNumber: Number(issueNumber),
      slug,
      month,
      year: Number(year),
      description,
      coverUrl,
      pdfUrl,
      publicationDate,
      status,
      pageCount: Number(pageCount),
      tableOfContents: toc,
      createdAt: initialIssue?.createdAt || new Date().toISOString(),
    };

    dataService.saveIssue(issueToSave);

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/issues');
      }, 1000);
    }, 500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 max-w-5xl mx-auto font-tamil">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/issues"
            className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isEditing ? `இதழ் ${issueNumber} திருத்துதல்` : 'புதிய இதழ் உருவாக்குதல் (New Magazine Issue)'}
            </h1>
            <div className="text-xs text-muted-foreground">
              {isEditing ? 'இதழ் விவரங்களைப் புதுப்பிக்கவும்' : 'அட்டைப்படம் மற்றும் PDF கோப்புகளை உள்ளிடவும்'}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" />
              சேமிக்கப்பட்டது!
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'சேமிக்கப்படுகிறது...' : 'இதழைச் சேமி (Save Issue)'}</span>
          </button>
        </div>
      </div>

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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">
                  இதழ் எண் (Issue No.) <span className="text-destructive">*</span>
                </label>
                <input
                  type="number"
                  required
                  value={issueNumber}
                  onChange={(e) => {
                    setIssueNumber(Number(e.target.value));
                    setSlug(`issue-${e.target.value}-october-2026`);
                  }}
                  className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">மாதம்</label>
                <input
                  type="text"
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
              <label className="text-xs font-bold text-foreground">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-sans"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">இதழ் சுருக்கக் குறிப்பு</label>
              <textarea
                rows={3}
                placeholder="இவ்விதழின் முக்கிய மையக் கருத்து மற்றும் சிறப்பம்சங்கள்..."
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
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xs bg-muted hover:bg-muted/80 text-foreground text-xs font-semibold border border-border"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>வரிசை சேர்</span>
              </button>
            </div>

            <div className="space-y-2">
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
                      placeholder="எழுத்தாளர்..."
                      value={item.author}
                      onChange={(e) => handleTocChange(idx, 'author', e.target.value)}
                      className="w-full px-2 py-1 rounded-xs border border-border bg-card text-foreground"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTocRow(idx)}
                    className="p-1 rounded-xs text-destructive hover:bg-destructive/10"
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
              வெளியீட்டு நிலை (Status)
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">நிலை</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">வரைவு (Draft - மறைக்கப்பட்ட நிலை)</option>
                <option value="published">வெளியிடப்பட்டது (Published - நேரலை)</option>
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
              <label className="text-xs font-bold text-foreground">பக்கங்களின் எண்ணிக்கை</label>
              <input
                type="number"
                value={pageCount}
                onChange={(e) => setPageCount(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary font-mono"
              />
            </div>
          </div>

          {/* Cover Image Upload (Cloudinary Ready) */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              அட்டைப்படம் (Cover Image - Cloudinary Ready)
            </h3>

            {coverUrl && (
              <div className="relative aspect-3/4 rounded-md overflow-hidden border border-border bg-muted">
                <img src={coverUrl} alt="Cover Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">படத்தின் நேரடி URL:</label>
              <input
                type="url"
                value={coverUrl}
                onChange={(e) => setCoverUrl(e.target.value)}
                className="w-full px-2 py-1.5 rounded-xs border border-border bg-background text-foreground text-xs font-sans"
              />
            </div>

            <button
              type="button"
              onClick={() => alert('Cloudinary விட்ஜெட் விரைவில் இணைக்கப்படும்.')}
              className="w-full py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>புதிய அட்டைப்படம் பதிவேற்று</span>
            </button>
          </div>

          {/* PDF File Upload (Supabase Storage Ready) */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              டிஜிட்டல் இதழ் PDF (Supabase Storage Ready)
            </h3>

            <div className="p-3 rounded-md bg-muted/60 border border-border text-xs space-y-1">
              <div className="font-bold text-foreground truncate font-sans">{pdfUrl}</div>
              <div className="text-[11px] text-muted-foreground">மாதிரி PDF இணைக்கப்பட்டுள்ளது</div>
            </div>

            <button
              type="button"
              onClick={() => alert('Supabase Storage PDF பதிவேற்றம் விரைவில் இணைக்கப்படும்.')}
              className="w-full py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5"
            >
              <FileUp className="w-4 h-4" />
              <span>புதிய PDF ஆவணம் பதிவேற்று</span>
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
