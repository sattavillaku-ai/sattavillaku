import {
  INITIAL_ISSUES,
  INITIAL_ARTICLES,
  INITIAL_NEWS,
  INITIAL_NEWS_REVIEW,
  INITIAL_AUTHORS,
  INITIAL_CATEGORIES,
  INITIAL_MEDIA,
  INITIAL_SITE_SETTINGS
} from './mock-data';
import { Issue, Article, NewsItem, Author, Category, Media, SiteSettings } from '@/types';

class DataService {
  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  private getItem<T>(key: string, fallback: T): T {
    if (!this.isBrowser()) return fallback;
    try {
      const stored = localStorage.getItem(`sattavilakku_${key}`);
      return stored ? JSON.parse(stored) : fallback;
    } catch {
      return fallback;
    }
  }

  private setItem<T>(key: string, value: T): void {
    if (!this.isBrowser()) return;
    try {
      localStorage.setItem(`sattavilakku_${key}`, JSON.stringify(value));
    } catch (e) {
      console.warn('LocalStorage save error', e);
    }
  }

  // ISSUES
  getIssues(): Issue[] {
    return this.getItem<Issue[]>('issues', INITIAL_ISSUES);
  }

  getCurrentIssue(): Issue {
    const issues = this.getIssues();
    const published = issues.filter(i => i.status === 'published');
    return published[0] || INITIAL_ISSUES[0];
  }

  getIssueBySlug(slug: string): Issue | undefined {
    return this.getIssues().find(i => i.slug === slug);
  }

  getIssueById(id: string): Issue | undefined {
    return this.getIssues().find(i => i.id === id);
  }

  saveIssue(issue: Issue): Issue {
    const issues = this.getIssues();
    const existingIndex = issues.findIndex(i => i.id === issue.id);
    let updated: Issue[];
    if (existingIndex >= 0) {
      updated = [...issues];
      updated[existingIndex] = issue;
    } else {
      updated = [issue, ...issues];
    }
    this.setItem('issues', updated);
    return issue;
  }

  deleteIssue(id: string): void {
    const issues = this.getIssues().filter(i => i.id !== id);
    this.setItem('issues', issues);
  }

  // ARTICLES
  getArticles(): Article[] {
    return this.getItem<Article[]>('articles', INITIAL_ARTICLES);
  }

  getPublishedArticles(): Article[] {
    return this.getArticles().filter(a => a.status === 'published');
  }

  getArticleBySlug(slug: string): Article | undefined {
    return this.getArticles().find(a => a.slug === slug);
  }

  getArticleById(id: string): Article | undefined {
    return this.getArticles().find(a => a.id === id);
  }

  getArticlesByCategory(category: string): Article[] {
    const published = this.getPublishedArticles();
    if (category === 'all' || !category) return published;
    return published.filter(a => a.category.toLowerCase() === category.toLowerCase());
  }

  saveArticle(article: Article): Article {
    const articles = this.getArticles();
    const existingIndex = articles.findIndex(a => a.id === article.id);
    let updated: Article[];
    if (existingIndex >= 0) {
      updated = [...articles];
      updated[existingIndex] = article;
    } else {
      updated = [article, ...articles];
    }
    this.setItem('articles', updated);
    return article;
  }

  deleteArticle(id: string): void {
    const articles = this.getArticles().filter(a => a.id !== id);
    this.setItem('articles', articles);
  }

  // NEWS
  getNews(): NewsItem[] {
    return this.getItem<NewsItem[]>('news', INITIAL_NEWS);
  }

  getPublishedNews(): NewsItem[] {
    return this.getNews().filter(n => n.status === 'published');
  }

  getBreakingNews(): NewsItem[] {
    return this.getPublishedNews().filter(n => n.isBreaking);
  }

  getNewsByCategory(category: string): NewsItem[] {
    const published = this.getPublishedNews();
    if (category === 'all' || !category) return published;
    return published.filter(n => n.category.toLowerCase() === category.toLowerCase());
  }

  getNewsReviewItems(): NewsItem[] {
    return this.getItem<NewsItem[]>('news_review', INITIAL_NEWS_REVIEW);
  }

  saveNews(newsItem: NewsItem): NewsItem {
    const allNews = this.getNews();
    const existingIndex = allNews.findIndex(n => n.id === newsItem.id);
    let updated: NewsItem[];
    if (existingIndex >= 0) {
      updated = [...allNews];
      updated[existingIndex] = newsItem;
    } else {
      updated = [newsItem, ...allNews];
    }
    this.setItem('news', updated);
    return newsItem;
  }

  updateReviewItem(item: NewsItem): void {
    const reviewItems = this.getNewsReviewItems();
    const updated = reviewItems.map(i => (i.id === item.id ? item : i));
    this.setItem('news_review', updated);
  }

  approveAndPublishNews(item: NewsItem): void {
    // 1. Remove from review list
    const reviewItems = this.getNewsReviewItems().filter(i => i.id !== item.id);
    this.setItem('news_review', reviewItems);

    // 2. Add to published news
    const publishedItem: NewsItem = {
      ...item,
      status: 'published',
      publishedAt: new Date().toISOString(),
      reviewedBy: 'முதன்மை ஆசிரியர்',
      reviewedAt: new Date().toISOString(),
    };
    this.saveNews(publishedItem);
  }

  rejectNews(id: string): void {
    const reviewItems = this.getNewsReviewItems().filter(i => i.id !== id);
    this.setItem('news_review', reviewItems);
  }

  // AUTHORS
  getAuthors(): Author[] {
    return this.getItem<Author[]>('authors', INITIAL_AUTHORS);
  }

  saveAuthor(author: Author): Author {
    const authors = this.getAuthors();
    const idx = authors.findIndex(a => a.id === author.id);
    let updated: Author[];
    if (idx >= 0) {
      updated = [...authors];
      updated[idx] = author;
    } else {
      updated = [...authors, author];
    }
    this.setItem('authors', updated);
    return author;
  }

  deleteAuthor(id: string): void {
    const authors = this.getAuthors().filter(a => a.id !== id);
    this.setItem('authors', authors);
  }

  // CATEGORIES
  getCategories(): Category[] {
    return this.getItem<Category[]>('categories', INITIAL_CATEGORIES);
  }

  saveCategory(cat: Category): Category {
    const categories = this.getCategories();
    const idx = categories.findIndex(c => c.id === cat.id);
    let updated: Category[];
    if (idx >= 0) {
      updated = [...categories];
      updated[idx] = cat;
    } else {
      updated = [...categories, cat];
    }
    this.setItem('categories', updated);
    return cat;
  }

  deleteCategory(id: string): void {
    const categories = this.getCategories().filter(c => c.id !== id);
    this.setItem('categories', categories);
  }

  // MEDIA
  getMedia(): Media[] {
    return this.getItem<Media[]>('media', INITIAL_MEDIA);
  }

  saveMedia(media: Media): Media {
    const all = this.getMedia();
    const updated = [media, ...all];
    this.setItem('media', updated);
    return media;
  }

  deleteMedia(id: string): void {
    const all = this.getMedia().filter(m => m.id !== id);
    this.setItem('media', all);
  }

  // SETTINGS
  getSettings(): SiteSettings {
    return this.getItem<SiteSettings>('settings', INITIAL_SITE_SETTINGS);
  }

  saveSettings(settings: SiteSettings): SiteSettings {
    this.setItem('settings', settings);
    return settings;
  }
}

export const dataService = new DataService();
