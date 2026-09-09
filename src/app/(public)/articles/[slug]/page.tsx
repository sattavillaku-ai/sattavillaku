'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  Calendar,
  Clock,
  BookOpen,
  ArrowLeft,
  Share2,
  Tag,
  ArrowRight,
  User,
  Eye,
  Bookmark
} from 'lucide-react';
import { dataService } from '@/lib/data-service';
import { Article, Category } from '@/types';
import { CategoryBadge } from '@/components/category-badge';
import { AuthorInfo } from '@/components/author-info';
import { ShareButtons } from '@/components/share-buttons';
import { ReadingControls } from '@/components/reading-controls';
import { ArticleCard } from '@/components/article-card';
import { EmptyState } from '@/components/empty-state';
import { formatDateTamil } from '@/lib/utils';

export default function ArticleOrCategoryDynamicPage() {
  const params = useParams();
  const rawSlug = params?.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [categoryArticles, setCategoryArticles] = useState<Article[]>([]);

  const [article, setArticle] = useState<Article | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<Article[]>([]);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg' | 'xl'>('base');
  const [readingMode, setReadingMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!rawSlug) return;

    // 1. Check if slug matches a category
    const foundCategory = dataService.getCategories().find(
      (c) => c.slug.toLowerCase() === rawSlug.toLowerCase()
    );

    if (foundCategory) {
      setCategory(foundCategory);
      setCategoryArticles(dataService.getArticlesByCategory(foundCategory.slug));
      setArticle(null);
      setLoading(false);
      return;
    }

    // 2. Otherwise check if slug matches an article
    const foundArticle = dataService.getArticleBySlug(rawSlug) || dataService.getArticles()[0];
    if (foundArticle) {
      setArticle(foundArticle);
      setCategory(null);
      // Related articles from same category
      const related = dataService
        .getPublishedArticles()
        .filter((a) => a.id !== foundArticle.id && a.category === foundArticle.category)
        .slice(0, 3);
      setRelatedArticles(
        related.length > 0 ? related : dataService.getPublishedArticles().filter((a) => a.id !== foundArticle.id).slice(0, 3)
      );
    }
    setLoading(false);
  }, [rawSlug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-muted-foreground font-tamil">
        கட்டுரை ஏற்றப்படுகிறது...
      </div>
    );
  }

  // RENDER CATEGORY ARTICLES LISTING
  if (category) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <nav className="text-xs text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-primary">முகப்பு</Link>
          <span>/</span>
          <Link href="/articles" className="hover:text-primary">கட்டுரைகள்</Link>
          <span>/</span>
          <span className="text-foreground font-semibold">{category.nameTamil}</span>
        </nav>

        <div className="border-b-2 border-primary pb-4">
          <div className="flex items-center gap-2 mb-1">
            <CategoryBadge category={category.slug} nameTamil={category.nameTamil} size="md" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-tamil text-foreground mt-2">
            {category.nameTamil} கட்டுரைகள்
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 font-tamil max-w-2xl leading-relaxed">
            {category.description}
          </p>
        </div>

        {categoryArticles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categoryArticles.map((art) => (
              <ArticleCard key={art.id} article={art} layout="standard" />
            ))}
          </div>
        ) : (
          <EmptyState
            title="இப்பிரிவில் கட்டுரைகள் எதுவும் இல்லை"
            description="விரைவில் இப்பிரிவில் புதிய ஆய்வுக் கட்டுரைகள் பதிவேற்றப்படும்."
            actionText="அனைத்துக் கட்டுரைகளுக்கும் செல்ல"
            actionHref="/articles"
          />
        )}
      </div>
    );
  }

  // RENDER ARTICLE DETAIL
  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <EmptyState
          title="கட்டுரை கிடைக்கவில்லை"
          description="நீங்கள் தேடிய கட்டுரை முகவரி தவறானது அல்லது நீக்கப்பட்டுள்ளது."
          actionText="கட்டுரைகள் பட்டியலுக்குச் செல்ல"
          actionHref="/articles"
        />
      </div>
    );
  }

  const fontSizeClasses = {
    sm: 'text-sm sm:text-base leading-relaxed',
    base: 'text-base sm:text-lg leading-relaxed',
    lg: 'text-lg sm:text-xl leading-relaxed',
    xl: 'text-xl sm:text-2xl leading-relaxed',
  };

  return (
    <article className={`pb-16 ${readingMode ? 'bg-[#fcfbf9] dark:bg-[#0f1013]' : ''}`}>
      <div className={`max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8`}>
        {/* Navigation Breadcrumb */}
        {!readingMode && (
          <nav className="text-xs text-muted-foreground flex items-center gap-2">
            <Link href="/" className="hover:text-primary">முகப்பு</Link>
            <span>/</span>
            <Link href="/articles" className="hover:text-primary">கட்டுரைகள்</Link>
            <span>/</span>
            <Link href={`/articles/${article.category}`} className="hover:text-primary">
              {article.categoryNameTamil}
            </Link>
          </nav>
        )}

        {/* Article Header */}
        <header className="space-y-4">
          <div className="flex flex-wrap items-center gap-2.5">
            <CategoryBadge
              category={article.category}
              nameTamil={article.categoryNameTamil}
              size="md"
              isLink
            />
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {article.readTimeMinutes} நிமிட வாசிப்பு
            </span>
            {article.views && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {article.views} பார்வைகள்
              </span>
            )}
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-tamil text-foreground leading-snug">
            {article.title}
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground font-tamil leading-relaxed">
            {article.excerpt}
          </p>

          {/* Author bar & Date */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-3 border-y border-border">
            <div className="flex items-center gap-3">
              {article.author.photo && (
                <img
                  src={article.author.photo}
                  alt={article.author.name}
                  className="w-11 h-11 rounded-full object-cover border border-border"
                />
              )}
              <div>
                <div className="text-sm font-bold font-tamil text-foreground">{article.author.name}</div>
                <div className="text-xs text-muted-foreground">{article.author.role}</div>
              </div>
            </div>

            <time dateTime={article.publishedAt} className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              <span>{formatDateTamil(article.publishedAt)}</span>
            </time>
          </div>

          {/* Reading Controls Toolbar */}
          <ReadingControls
            fontSize={fontSize}
            setFontSize={setFontSize}
            readingMode={readingMode}
            setReadingMode={setReadingMode}
          />
        </header>

        {/* Hero Image */}
        {article.heroImage && (
          <div className="aspect-16/10 rounded-lg overflow-hidden border border-border bg-muted shadow-sm">
            <img
              src={article.heroImage}
              alt={article.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Magazine Citation Box (Optional requirement from prompt) */}
        {article.issueTitle && (
          <div className="p-4 rounded-md bg-primary/10 border border-primary/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <BookOpen className="w-5 h-5 text-primary shrink-0" />
              <div>
                <strong className="text-foreground font-tamil">
                  இந்தக் கட்டுரை சட்டவிளக்கு அச்சு இதழ் வெளியீட்டிலும் இடம்பெற்றுள்ளது:
                </strong>
                <div className="text-muted-foreground mt-0.5">
                  {article.issueTitle} • பக்கம்: {article.pdfPage || '24'}
                </div>
              </div>
            </div>

            {article.issueId && (
              <Link
                href={`/magazine/${article.issueId}`}
                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xs bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-colors shrink-0"
              >
                <span>இதழை முழுமையாக வாசிக்க</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            )}
          </div>
        )}

        {/* Article Body Content */}
        <div
          className={`font-tamil text-foreground prose dark:prose-invert max-w-none space-y-6 ${fontSizeClasses[fontSize]}`}
        >
          {article.content.split('\n\n').map((block, idx) => {
            if (block.startsWith('## ')) {
              return (
                <h2
                  key={idx}
                  className="text-xl sm:text-2xl font-bold font-tamil text-primary border-b border-border/80 pb-2 mt-8 mb-4"
                >
                  {block.replace('## ', '')}
                </h2>
              );
            }
            if (block.startsWith('### ')) {
              return (
                <h3
                  key={idx}
                  className="text-lg sm:text-xl font-bold font-tamil text-foreground mt-6 mb-3"
                >
                  {block.replace('### ', '')}
                </h3>
              );
            }
            if (block.startsWith('> ')) {
              return (
                <blockquote
                  key={idx}
                  className="p-4 my-4 bg-muted/60 border-l-4 border-primary rounded-r-md text-foreground font-serif-tamil italic text-sm sm:text-base leading-relaxed"
                >
                  {block.replace('> ', '')}
                </blockquote>
              );
            }
            if (block.startsWith('---')) {
              return <hr key={idx} className="my-8 border-border" />;
            }
            if (block.startsWith('* ') || block.startsWith('- ')) {
              const listItems = block.split('\n');
              return (
                <ul key={idx} className="list-disc pl-5 space-y-2">
                  {listItems.map((item, itemIdx) => (
                    <li key={itemIdx}>{item.replace(/^[\*\-]\s+/, '')}</li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-foreground leading-relaxed">
                {block}
              </p>
            );
          })}
        </div>

        {/* Tags */}
        {article.tags && article.tags.length > 0 && (
          <div className="pt-6 border-t border-border flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" />
              குறிச்சொற்கள்:
            </span>
            {article.tags.map((tag, i) => (
              <span
                key={i}
                className="text-xs px-2.5 py-1 rounded-xs bg-muted text-muted-foreground border border-border/80"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Share Buttons */}
        <div className="pt-4 border-t border-border flex items-center justify-between">
          <ShareButtons title={article.title} />
        </div>

        {/* Author Bio Box */}
        <div className="pt-8">
          <AuthorInfo author={article.author} layout="card" />
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <section className="pt-10 border-t border-border space-y-4">
            <h2 className="text-xl font-bold font-tamil text-foreground border-b-2 border-primary pb-2">
              தொடர்புடைய சிறப்புக் கட்டுரைகள் (Related Articles)
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {relatedArticles.map((rel) => (
                <ArticleCard key={rel.id} article={rel} layout="standard" />
              ))}
            </div>
          </section>
        )}
      </div>
    </article>
  );
}
