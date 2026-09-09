'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Save,
  ArrowLeft,
  CheckCircle,
  UploadCloud,
  Bold,
  Italic,
  Underline,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  AlignLeft,
  AlignCenter,
  AlignJustify,
  Undo,
  Redo,
  Sparkles,
  BookOpen
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Article, Author, Category, Issue } from '@/types';

interface ArticleFormProps {
  initialArticle?: Article;
  isEditing?: boolean;
}

export function ArticleForm({ initialArticle, isEditing = false }: ArticleFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(
    initialArticle?.slug || 'new-legal-article-analysis-tamil'
  );
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(
    initialArticle?.content ||
      `## முன்னுரை\n\nஇங்கு உங்கள் கட்டுரையின் முன்னுரையை எழுதவும்...\n\n## சட்டக் கோட்பாடுகள்\n\nநீதிமன்றத் தீர்ப்புகள் மற்றும் சட்டப் பிரிவுகள் பற்றிய ஆய்வு...\n\n> "சட்டம் என்பது குடிமக்களின் உரிமைகளுக்கான கவசம்."\n\n## முடிவுரை\n\nமுடிவுரைக் கருத்துக்கள்...`
  );
  const [heroImage, setHeroImage] = useState(
    initialArticle?.heroImage ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80'
  );
  const [category, setCategory] = useState(initialArticle?.category || 'law');
  const [authorId, setAuthorId] = useState(initialArticle?.author.id || 'auth-1');
  const [tagsString, setTagsString] = useState(initialArticle?.tags?.join(', ') || 'சட்டம், தீர்ப்பு, நீதிமன்றம்');
  const [status, setStatus] = useState<'published' | 'draft'>(initialArticle?.status || 'draft');
  const [featured, setFeatured] = useState(initialArticle?.featured || false);
  const [issueId, setIssueId] = useState(initialArticle?.issueId || 'issue-48');
  const [pdfPage, setPdfPage] = useState(initialArticle?.pdfPage || 8);
  const [readTimeMinutes, setReadTimeMinutes] = useState(initialArticle?.readTimeMinutes || 5);

  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const authors = dataService.getAuthors();
  const categories = dataService.getCategories();
  const issues = dataService.getIssues();

  // Toolbar action helper for textarea
  const insertFormatting = (before: string, after: string = '') => {
    if (!textareaRef.current) return;
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const replacement = `${before}${selectedText || 'உரை'}${after}`;
    const newContent = content.substring(0, start) + replacement + content.substring(end);
    setContent(newContent);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + replacement.length - after.length);
    }, 0);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    const author = authors.find((a) => a.id === authorId) || authors[0];
    const catObj = categories.find((c) => c.slug === category);
    const selectedIssue = issues.find((i) => i.id === issueId);

    const articleToSave: Article = {
      id: initialArticle?.id || `art-${Date.now()}`,
      title,
      slug,
      excerpt,
      content,
      heroImage,
      category,
      categoryNameTamil: catObj?.nameTamil || 'சட்டம்',
      author,
      tags: tagsString.split(',').map((t) => t.trim()).filter(Boolean),
      status,
      featured,
      publishedAt: initialArticle?.publishedAt || new Date().toISOString(),
      readTimeMinutes: Number(readTimeMinutes),
      issueId: issueId || undefined,
      issueTitle: selectedIssue ? `${selectedIssue.month} ${selectedIssue.year} (இதழ் ${selectedIssue.issueNumber})` : undefined,
      pdfPage: pdfPage ? Number(pdfPage) : undefined,
    };

    dataService.saveArticle(articleToSave);

    setTimeout(() => {
      setIsSaving(false);
      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/articles');
      }, 800);
    }, 400);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto font-tamil">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isEditing ? 'கட்டுரையைத் திருத்துதல்' : 'புதிய கட்டுரை எழுதுதல் (Article CMS Editor)'}
            </h1>
            <div className="text-xs text-muted-foreground">
              தமிழ் யூனிகோட் மற்றும் TipTap ரிச்-டெக்ஸ்ட் ஆதரவு
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
            <span>{isSaving ? 'சேமிக்கப்படுகிறது...' : 'கட்டுரையைச் சேமி (Save Article)'}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Editor Column */}
        <div className="lg:col-span-8 space-y-5">
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                கட்டுரை தலைப்பு (Headline) <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="எ.கா: அரசியல் சாசனத்தின் 75 ஆண்டுகள்: அடிப்படை உரிமைகள் எதிர்நோக்கும் சமகாலச் சவால்கள்"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  if (!isEditing) {
                    setSlug(
                      e.target.value
                        .toLowerCase()
                        .replace(/[^\w\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .slice(0, 50) || 'article-slug'
                    );
                  }
                }}
                className="w-full px-3 py-2.5 rounded-md border border-border bg-background text-foreground text-base sm:text-lg font-bold focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">URL Slug</label>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs font-sans focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">
                சுருக்க உரை (Excerpt) <span className="text-destructive">*</span>
              </label>
              <textarea
                rows={2}
                required
                placeholder="கட்டுரையின் முக்கிய மையக் கருத்தை 2-3 வரிகளில் சுருக்கமாகக் குறிப்பிடவும்..."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-y"
              />
            </div>
          </div>

          {/* TipTap Compatible Rich Text Editor */}
          <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
            {/* Toolbar */}
            <div className="p-2 border-b border-border bg-muted/60 flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting('## ')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="Heading 2"
              >
                <Heading2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('### ')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="Heading 3"
              >
                <Heading3 className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="Bold (தடிமன்)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="Italic (சாய்வு)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<u>', '</u>')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('\n* ')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="குறியீட்டுப் பட்டியல் (Bullet list)"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n1. ')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="எண் பட்டியல் (Numbered list)"
              >
                <ListOrdered className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n> ')}
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="மேற்கோள் (Quote)"
              >
                <Quote className="w-4 h-4" />
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('[இணைப்பு உரை](', ')') }
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="இணைய இணைப்பு (Link)"
              >
                <LinkIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('![பட விளக்கம்](', ')') }
                className="p-1.5 rounded-xs hover:bg-card border border-transparent hover:border-border text-foreground"
                title="படம் இணைக்க"
              >
                <ImageIcon className="w-4 h-4" />
              </button>
            </div>

            {/* Textarea */}
            <div className="p-4">
              <textarea
                ref={textareaRef}
                rows={16}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="கட்டுரை உள்ளடக்கத்தை இங்கு எழுதவும்..."
                className="w-full bg-background text-foreground text-sm sm:text-base leading-relaxed font-tamil focus:outline-none resize-y p-3 border border-border rounded-md"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Metadata Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Publishing settings */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              வெளியீட்டு மேலாண்மை
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">நிலை (Status)</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">வரைவு (Draft - மறைக்கப்பட்டது)</option>
                <option value="published">வெளியிடப்பட்டது (Published - நேரலை)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">பிரிவு (Category)</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.slug}>
                    {c.nameTamil} ({c.nameEnglish})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">கட்டுரையாளர் (Author)</label>
              <select
                value={authorId}
                onChange={(e) => setAuthorId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} - {a.role}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t border-border">
              <input
                type="checkbox"
                id="featured-check"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="rounded-xs border-border text-primary focus:ring-primary w-4 h-4"
              />
              <label htmlFor="featured-check" className="text-xs font-bold text-foreground cursor-pointer">
                முகப்பு சிறப்புக் கட்டுரையாகக் காட்டு (Featured Article)
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">வாசிப்பு நேரம் (நிமிடங்களில்)</label>
              <input
                type="number"
                value={readTimeMinutes}
                onChange={(e) => setReadTimeMinutes(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>
          </div>

          {/* Magazine Link Box */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              <span>மாத இதழ் இணைப்பு (Magazine Link)</span>
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">தொடர்புடைய இதழ்</label>
              <select
                value={issueId}
                onChange={(e) => setIssueId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs focus:outline-none"
              >
                <option value="">இதழ் இல்லை (இணையதளம் மட்டுமே)</option>
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>
                    இதழ் {i.issueNumber} ({i.month} {i.year})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">PDF பக்க எண்</label>
              <input
                type="number"
                placeholder="எ.கா: 8"
                value={pdfPage}
                onChange={(e) => setPdfPage(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              முக்கியப் படம் (Hero Image - Cloudinary Ready)
            </h3>

            {heroImage && (
              <div className="aspect-16/10 rounded-md overflow-hidden border border-border bg-muted">
                <img src={heroImage} alt="Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <input
              type="url"
              value={heroImage}
              onChange={(e) => setHeroImage(e.target.value)}
              className="w-full px-2.5 py-1.5 rounded-xs border border-border bg-background text-foreground text-xs font-sans"
              placeholder="https://..."
            />

            <button
              type="button"
              onClick={() => alert('Cloudinary மீடியா பதிவேற்றம் விரைவில் இணைக்கப்படும்.')}
              className="w-full py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5"
            >
              <UploadCloud className="w-4 h-4" />
              <span>படத்தை மாற்றுக / பதிவேற்று</span>
            </button>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-2">
            <label className="text-xs font-bold text-foreground">குறிச்சொற்கள் (Tags - கமாவால் பிரிக்கவும்)</label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
              placeholder="அரசியல் சாசனம், உச்ச நீதிமன்றம், அடிப்படை உரிமை"
            />
          </div>
        </div>
      </div>
    </form>
  );
}
