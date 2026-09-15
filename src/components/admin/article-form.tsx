'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  Sparkles,
  BookOpen,
  Loader2,
  AlertCircle,
  HardDrive
} from 'lucide-react';
import { Article, Author, Category, Issue } from '@/types';
import {
  fetchCategories,
  fetchAuthors,
  fetchIssues,
  saveArticle,
  generateSlug
} from '@/lib/cms-service';
import { MediaPickerModal } from '@/components/admin/media-picker-modal';
import { openGoogleDrivePicker } from '@/lib/google-drive-client';

interface ArticleFormProps {
  initialArticle?: Article;
  isEditing?: boolean;
}

export function ArticleForm({ initialArticle, isEditing = false }: ArticleFormProps) {
  const router = useRouter();

  // Form Fields
  const [title, setTitle] = useState(initialArticle?.title || '');
  const [slug, setSlug] = useState(initialArticle?.slug || '');
  const [excerpt, setExcerpt] = useState(initialArticle?.excerpt || '');
  const [content, setContent] = useState(
    initialArticle?.content ||
      `## முன்னுரை\n\nஇங்கு உங்கள் கட்டுரையின் முன்னுரையை எழுதவும்...\n\n## சட்டக் கோட்பாடுகள்\n\nநீதிமன்றத் தீர்ப்புகள் மற்றும் சட்டப் பிரிவுகள் பற்றிய ஆய்வு...\n\n> "சட்டம் என்பது குடிமக்களின் உரிமைகளுக்கான கவசம்."\n\n## முடிவுரை\n\nமுடிவுரைக் கருத்துக்கள்...`
  );
  const [heroImage, setHeroImage] = useState(
    initialArticle?.hero_image_url ||
      initialArticle?.heroImage ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80'
  );
  const [heroMediaId, setHeroMediaId] = useState<string | undefined>(
    initialArticle?.hero_media_id || undefined
  );
  const [categoryId, setCategoryId] = useState<string>(initialArticle?.category_id || '');
  const [authorId, setAuthorId] = useState<string>(initialArticle?.author_id || '');
  const [authorName, setAuthorName] = useState<string>(
    initialArticle?.author_name || initialArticle?.author?.name || ''
  );
  const [tagsString, setTagsString] = useState(
    initialArticle?.tags?.join(', ') || 'சட்டம், தீர்ப்பு, நீதிமன்றம்'
  );
  const [status, setStatus] = useState<'published' | 'draft'>((initialArticle?.status as any) || 'draft');
  const [featured, setFeatured] = useState(Boolean(initialArticle?.featured));
  const [issueId, setIssueId] = useState<string>(initialArticle?.issue_id || initialArticle?.issueId || '');
  const [pdfPage, setPdfPage] = useState<number | string>(
    initialArticle?.pdf_page ?? initialArticle?.pdfPage ?? ''
  );
  const [readTimeMinutes, setReadTimeMinutes] = useState<number>(
    initialArticle?.read_time_minutes ?? initialArticle?.readTimeMinutes ?? 5
  );

  // Status & Dependencies
  const [categories, setCategories] = useState<Category[]>([]);
  const [authors, setAuthors] = useState<Author[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loadingDeps, setLoadingDeps] = useState(true);

  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showMediaPicker, setShowMediaPicker] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load Categories, Authors, and Issues from Supabase
  useEffect(() => {
    async function loadDependencies() {
      try {
        setLoadingDeps(true);
        const [catData, authData, issData] = await Promise.all([
          fetchCategories(),
          fetchAuthors(),
          fetchIssues(),
        ]);
        setCategories(catData);
        setAuthors(authData);
        setIssues(issData);

        // Set default category if creating new
        if (!categoryId && catData.length > 0) {
          if (initialArticle?.category) {
            const matched = catData.find((c) => c.slug === initialArticle.category);
            setCategoryId(matched ? matched.id : catData[0].id);
          } else {
            setCategoryId(catData[0].id);
          }
        }

        // Set default author if creating new
        if (!authorId && authData.length > 0) {
          if (initialArticle?.author?.id && initialArticle.author.id !== 'unassigned') {
            setAuthorId(initialArticle.author.id);
          }
        }
      } catch (err) {
        console.error('Error loading article dependencies:', err);
      } finally {
        setLoadingDeps(false);
      }
    }
    loadDependencies();
  }, [initialArticle]);

  // Auto generate slug from title if new and slug not manually edited
  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isEditing && (!slug || slug === generateSlug(title))) {
      setSlug(generateSlug(val));
    }
  };

  // Toolbar action helper for formatting
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

  const [isUploadingHero, setIsUploadingHero] = useState(false);
  const heroFileInputRef = useRef<HTMLInputElement>(null);

  // Direct Hero Upload from Computer (to Cloudinary)
  const handleDirectHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingHero(true);
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', `hero-${title ? title.slice(0, 30) : 'article'}`);
      formData.append('category', 'article');
      formData.append('alt_text', title || 'கட்டுரை படம்');

      const res = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'படப் பதிவேற்றம் தோல்வியடைந்தது.');
      }
      setHeroImage(data.media.url);
      setHeroMediaId(data.media.id);
    } catch (err: any) {
      alert(err.message || 'படத்தைப் பதிவேற்ற முடியவில்லை.');
    } finally {
      setIsUploadingHero(false);
      if (heroFileInputRef.current) heroFileInputRef.current.value = '';
    }
  };

  // Direct Hero Import from Google Drive (to Cloudinary)
  const handleDirectHeroDrivePicker = () => {
    openGoogleDrivePicker({
      type: 'image',
      onSelect: async (doc, token) => {
        try {
          setIsUploadingHero(true);
          const res = await fetch('/api/admin/media/google-drive', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              fileId: doc.id,
              fileName: doc.name,
              mimeType: doc.mimeType,
              accessToken: token,
              category: 'article',
            }),
          });
          const data = await res.json();
          if (!res.ok || !data.success) {
            throw new Error(data.error || 'Google Drive-லிருந்து படம் இறக்குமதி தோல்வியடைந்தது.');
          }
          setHeroImage(data.media.url);
          setHeroMediaId(data.media.id);
        } catch (err: any) {
          alert(err.message || 'Google Drive-லிருந்து படத்தை இறக்குமதி செய்ய முடியவில்லை.');
        } finally {
          setIsUploadingHero(false);
        }
      },
      onError: (err) => {
        alert(`Google Drive Picker பிழை: ${err.message}`);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setSaveError('கட்டுரை தலைப்பு கட்டாயமாகும்.');
      return;
    }

    try {
      setIsSaving(true);
      setSaveError(null);

      const selectedAuthor = authors.find((a) => a.id === authorId);
      const parsedTags = tagsString
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await saveArticle({
        id: initialArticle?.id,
        title: title.trim(),
        slug: slug.trim() || generateSlug(title),
        excerpt: excerpt.trim(),
        content,
        hero_image_url: heroImage,
        hero_media_id: heroMediaId,
        category_id: categoryId || undefined,
        author_id: authorId || undefined,
        author_name: selectedAuthor?.name || authorName || 'ஆசிரியர் குழு',
        issue_id: issueId || undefined,
        featured,
        pdf_page: pdfPage !== '' ? Number(pdfPage) : undefined,
        read_time_minutes: Number(readTimeMinutes) || 5,
        status,
        published_at: initialArticle?.published_at || (status === 'published' ? new Date().toISOString() : null),
        tags: parsedTags,
      });

      setSavedSuccess(true);
      setTimeout(() => {
        router.push('/admin/articles');
      }, 900);
    } catch (err: any) {
      console.error('Error saving article:', err);
      setSaveError(err.message || 'கட்டுரையைச் சேமிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto font-tamil">
      {/* Top action header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/articles"
            className="p-2 rounded-md border border-border bg-card text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">
              {isEditing ? 'கட்டுரையைத் திருத்துதல்' : 'புதிய கட்டுரை எழுதுதல் (Article CMS Editor)'}
            </h1>
            <div className="text-xs text-muted-foreground">
              தமிழ் யூனிகோட் & ரிச்-டெக்ஸ்ட் ஆதரவு (Supabase public.articles)
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {savedSuccess && (
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 animate-in fade-in">
              <CheckCircle className="w-4 h-4" />
              சேமிக்கப்பட்டது!
            </span>
          )}

          <button
            type="submit"
            disabled={isSaving || loadingDeps}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-xs sm:text-sm font-bold hover:bg-primary/90 transition-colors shadow-xs disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>{isSaving ? 'சேமிக்கப்படுகிறது...' : isEditing ? 'மாற்றங்களைச் சேமி' : 'கட்டுரையைச் சேமி'}</span>
          </button>
        </div>
      </div>

      {saveError && (
        <div className="p-3.5 rounded-md bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center gap-2 animate-in fade-in">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left/Main Column - Content & Writing Area */}
        <div className="lg:col-span-8 space-y-5">
          {/* Article Title */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              கட்டுரை தலைப்பு (Article Title) *
            </label>
            <input
              type="text"
              required
              placeholder="எ.கா: அரசியல் சாசனப் பிரிவு 21: தனிமனித சுதந்திரத்தின் புதிய பரிமாணங்கள்..."
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-full text-lg sm:text-xl font-bold p-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />

            {/* Slug row */}
            <div className="flex items-center gap-2 pt-2 text-xs text-muted-foreground font-mono">
              <span className="shrink-0 font-sans text-xs">URL Slug:</span>
              <span className="text-muted-foreground/60 hidden sm:inline">/articles/</span>
              <input
                type="text"
                required
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                className="flex-1 px-2.5 py-1 rounded-xs border border-border bg-background text-foreground text-xs font-mono"
                placeholder="tamil-article-slug"
              />
            </div>
          </div>

          {/* Excerpt */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-2">
            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              சுருக்கம் (Excerpt / Summary)
            </label>
            <textarea
              rows={3}
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="கட்டுரையின் முக்கிய மையக் கருத்து மற்றும் வாசகர்களுக்கான சுருக்கக் குறிப்பு..."
              className="w-full text-xs sm:text-sm p-3 rounded-md border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-y"
            />
          </div>

          {/* Editorial Rich Text Editor Area */}
          <div className="bg-card border border-border rounded-lg shadow-2xs overflow-hidden">
            {/* Formatting Toolbar */}
            <div className="bg-muted/60 border-b border-border p-2 flex flex-wrap items-center gap-1 text-xs">
              <button
                type="button"
                onClick={() => insertFormatting('**', '**')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="தடிமன் (Bold)"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('*', '*')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="சாய்வு (Italic)"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('<u>', '</u>')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="அடிக்கோடு (Underline)"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('\n## ', '\n')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="உபதலைப்பு 2 (Heading 2)"
              >
                <Heading2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n### ', '\n')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="உபதலைப்பு 3 (Heading 3)"
              >
                <Heading3 className="w-3.5 h-3.5" />
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={() => insertFormatting('\n- ', '\n')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="புல்லட் பட்டியல் (Bullet List)"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n1. ', '\n')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="எண் பட்டியல் (Numbered List)"
              >
                <ListOrdered className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n> "', '"\n')}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="மேற்கோள் (Quote)"
              >
                <Quote className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => insertFormatting('\n---\n')}
                className="px-2 py-1 rounded-xs hover:bg-muted text-foreground text-[11px] font-bold cursor-pointer"
                title="கிடைமட்டக் கோடு (Divider)"
              >
                HR
              </button>

              <div className="w-px h-4 bg-border mx-1" />

              <button
                type="button"
                onClick={() => {
                  const url = prompt('இணைப்பு முகவரியை (URL) உள்ளிடவும்:');
                  if (url) insertFormatting(`[`, `](${url})`);
                }}
                className="p-1.5 rounded-xs hover:bg-muted text-foreground cursor-pointer"
                title="இணைப்பு (Link)"
              >
                <LinkIcon className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="p-1.5 rounded-xs hover:bg-muted text-primary cursor-pointer flex items-center gap-1"
                title="மீடியா படம் சேர்க்க"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] font-bold">மீடியா</span>
              </button>
            </div>

            {/* Textarea */}
            <div className="p-4">
              <textarea
                ref={textareaRef}
                rows={18}
                required
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="கட்டுரை உள்ளடக்கத்தை இங்கு விரிவாக எழுதவும்..."
                className="w-full bg-background text-foreground text-sm sm:text-base leading-relaxed font-tamil focus:outline-none resize-y p-3 border border-border rounded-md font-sans"
              />
            </div>
          </div>
        </div>

        {/* Sidebar Metadata Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Publishing settings */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-4">
            <h3 className="text-sm font-bold text-foreground border-b border-border pb-2">
              வெளியீட்டு மேலாண்மை (Publishing)
            </h3>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">நிலை (Status) *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as 'published' | 'draft')}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="draft">வரைவு (Draft - பிரசுரிக்கப்படாதது)</option>
                <option value="published">வெளியிடப்பட்டது (Published - நேரலை)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">பிரிவு (Category) *</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.name_en || c.slug})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">கட்டுரையாளர் (Author) *</label>
              <select
                value={authorId}
                onChange={(e) => {
                  setAuthorId(e.target.value);
                  const selected = authors.find((a) => a.id === e.target.value);
                  if (selected) setAuthorName(selected.name);
                }}
                className="w-full px-3 py-2 rounded-md border border-border bg-background text-foreground text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="">ஆசிரியர் குழு (Editorial Desk)</option>
                {authors.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name} ({a.role})
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
                className="rounded-xs border-border text-primary focus:ring-primary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="featured-check" className="text-xs font-bold text-foreground cursor-pointer flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                <span>முகப்பு சிறப்புக் கட்டுரை (Featured)</span>
              </label>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">வாசிப்பு நேரம் (Read Time in Mins)</label>
              <input
                type="number"
                min={1}
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
                <option value="">இதழ் இல்லை (இணையதளப் பிரசுரம் மட்டுமே)</option>
                {issues.map((i) => (
                  <option key={i.id} value={i.id}>
                    {i.title || `இதழ் ${i.issue_number || i.issueNumber}`} ({i.month || ''} {i.year || ''})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-foreground">PDF பக்க எண் (Page No)</label>
              <input
                type="number"
                placeholder="எ.கா: 8"
                value={pdfPage}
                onChange={(e) => setPdfPage(e.target.value ? Number(e.target.value) : '')}
                className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs font-mono"
              />
            </div>
          </div>

          {/* Hero Image */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <h3 className="text-sm font-bold text-foreground">
                முக்கியப் படம் (Hero Image)
              </h3>
              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="text-xs text-primary hover:underline font-bold flex items-center gap-1 cursor-pointer"
              >
                <UploadCloud className="w-3.5 h-3.5" />
                <span>மீடியா நூலகம்</span>
              </button>
            </div>

            {heroImage && (
              <div className="aspect-16/10 rounded-md overflow-hidden border border-border bg-muted relative group">
                <img src={heroImage} alt="Hero Preview" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-muted-foreground">படத்தின் நேரடி URL:</label>
              <input
                type="url"
                value={heroImage}
                onChange={(e) => {
                  setHeroImage(e.target.value);
                  setHeroMediaId(undefined);
                }}
                className="w-full px-2.5 py-1.5 rounded-xs border border-border bg-background text-foreground text-xs font-sans"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            {/* Hidden file input for hero */}
            <input
              ref={heroFileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleDirectHeroUpload}
            />

            {/* Three Actions: Computer, Google Drive, Media Library */}
            <div className="space-y-2 pt-1">
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={isUploadingHero}
                  onClick={() => heroFileInputRef.current?.click()}
                  className="py-2 px-2.5 rounded-md border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="கணினியிலிருந்து படம் பதிவேற்றவும்"
                >
                  {isUploadingHero ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <UploadCloud className="w-3.5 h-3.5 text-primary" />
                  )}
                  <span>கணினி படம்</span>
                </button>

                <button
                  type="button"
                  disabled={isUploadingHero}
                  onClick={handleDirectHeroDrivePicker}
                  className="py-2 px-2.5 rounded-md border border-border hover:bg-muted text-xs font-bold text-foreground flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  title="Google Drive-லிருந்து படம் இறக்குமதி செய்"
                >
                  <HardDrive className="w-3.5 h-3.5 text-blue-500" />
                  <span>Google Drive</span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setShowMediaPicker(true)}
                className="w-full py-2 px-3 rounded-md border border-dashed border-border hover:bg-muted text-xs font-bold text-primary flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <UploadCloud className="w-4 h-4" />
                <span>மீடியா நூலகம் / ஏற்கனவே உள்ள படம்</span>
              </button>
            </div>
          </div>

          {/* Tags */}
          <div className="bg-card border border-border rounded-lg p-5 shadow-2xs space-y-2">
            <label className="text-xs font-bold text-foreground">
              குறிச்சொற்கள் (Tags - கமாவால் பிரிக்கவும்)
            </label>
            <input
              type="text"
              value={tagsString}
              onChange={(e) => setTagsString(e.target.value)}
              className="w-full px-3 py-1.5 rounded-md border border-border bg-background text-foreground text-xs"
              placeholder="அரசியல் சாசனம், உச்ச நீதிமன்றம், அடிப்படை உரிமை"
            />
            <p className="text-[11px] text-muted-foreground">
              குறிச்சொற்கள் தானாகவே `public.tags` மற்றும் `public.article_tags`-ல் ஒத்திசைக்கப்படும்.
            </p>
          </div>
        </div>
      </div>

      {/* Media Picker Modal */}
      <MediaPickerModal
        isOpen={showMediaPicker}
        onClose={() => setShowMediaPicker(false)}
        onSelect={(media) => {
          setHeroImage(media.url);
          if (media.mediaId) setHeroMediaId(media.mediaId);
        }}
        title="கட்டுரை முக்கியப் படத்தைத் தேர்ந்தெடுக்கவும் (Select Hero Image)"
        categoryFilter="article"
      />
    </form>
  );
}
