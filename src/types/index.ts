export type CategorySlug = 'law' | 'politics' | 'tamil-nadu' | 'india' | 'special-article' | 'magazine';

export interface Category {
  id: string;
  slug: string;
  nameTamil: string;
  nameEnglish: string;
  description: string;
  order: number;
}

export interface Author {
  id: string;
  name: string;
  role: string;
  bio: string;
  photo: string;
  articlesCount?: number;
}

export interface TableOfContentItem {
  page: number;
  title: string;
  author: string;
  category: string;
}

export interface Issue {
  id: string;
  title: string;
  issueNumber: number;
  slug: string;
  month: string;
  year: number;
  description: string;
  coverUrl: string;
  pdfUrl: string;
  publicationDate: string;
  status: 'published' | 'draft';
  pageCount: number;
  tableOfContents: TableOfContentItem[];
  createdAt: string;
}

export interface Article {
  id: string;
  issueId?: string;
  issueTitle?: string;
  pdfPage?: number;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  heroImage: string;
  category: CategorySlug | string;
  categoryNameTamil: string;
  author: Author;
  tags: string[];
  status: 'published' | 'draft';
  featured: boolean;
  isEditorial?: boolean;
  publishedAt: string;
  readTimeMinutes: number;
  views?: number;
}

export type NewsStatus = 'collected' | 'processing' | 'draft' | 'review' | 'approved' | 'rejected' | 'published';

export interface NewsItem {
  id: string;
  source: string;
  sourceUrl: string;
  originalHeadline: string;
  originalContent?: string;
  headline: string;
  summary: string;
  content: string;
  category: CategorySlug | string;
  categoryNameTamil: string;
  tags: string[];
  publishedAt: string;
  imageUrl: string;
  status: NewsStatus;
  relevanceScore: number;
  isBreaking: boolean;
  reviewedBy?: string;
  reviewedAt?: string;
  aiProcessingNotes?: string;
}

export interface Media {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'pdf';
  size: string;
  category: 'article' | 'cover' | 'author' | 'site';
  altText: string;
  createdAt: string;
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: 'Chief Editor' | 'Legal Editor' | 'Sub Editor' | 'Admin';
}

export interface SiteSettings {
  siteNameTamil: string;
  siteNameEnglish: string;
  taglineTamil: string;
  descriptionTamil: string;
  rniNumber: string;
  editorInChief: string;
  officeAddress: string;
  contactEmail: string;
  contactPhone: string;
  socialLinks: {
    facebook?: string;
    twitter?: string;
    whatsapp?: string;
    telegram?: string;
    youtube?: string;
  };
}
