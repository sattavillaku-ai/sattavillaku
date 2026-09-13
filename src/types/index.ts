export type CategorySlug = 'law' | 'politics' | 'tamil-nadu' | 'india' | 'special-article' | 'magazine';

export interface Category {
  id: string;
  name?: string;
  name_en?: string | null;
  slug: string;
  description?: string | null;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
  // UI backward compatibility
  nameTamil?: string;
  nameEnglish?: string;
  order?: number;
}

export interface Author {
  id: string;
  name: string;
  name_en?: string | null;
  role: string;
  photo_url?: string | null;
  bio?: string | null;
  email?: string | null;
  created_at?: string;
  updated_at?: string;
  // UI backward compatibility
  photo?: string;
  articlesCount?: number;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
}

export interface ArticleTag {
  article_id: string;
  tag_id: string;
}

export interface TableOfContentItem {
  page: number;
  title: string;
  author?: string;
  category?: string;
}

export type IssueStatus = 'published' | 'draft' | 'archived';

export interface Issue {
  id: string;
  title: string;
  issue_number?: number;
  issueNumber: number;
  slug: string;
  month: string;
  year: number;
  volume_number?: number;
  description: string;
  cover_image_url?: string | null;
  coverUrl: string;
  pdf_url?: string | null;
  pdfUrl: string;
  published_at?: string | null;
  publicationDate?: string;
  status: IssueStatus;
  page_count?: number;
  pageCount: number;
  is_free?: boolean;
  pdf_generated_at?: string | null;
  table_of_contents?: TableOfContentItem[];
  tableOfContents: TableOfContentItem[];
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  created_by?: string | null;
}

export interface IssueContent {
  id: string;
  issue_id: string;
  title: string;
  body?: any;
  content_type?: string;
  author_name?: string;
  position?: number;
  is_preview?: boolean;
  word_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image_url?: string | null;
  hero_image_url?: string | null;
  hero_media_id?: string | null;
  category_id?: string | null;
  author_id?: string | null;
  author_name?: string | null;
  issue_id?: string | null;
  featured: boolean;
  pdf_page?: number | null;
  read_time_minutes?: number | null;
  status: 'published' | 'draft';
  published_at?: string | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  views?: number;
  // UI convenience properties
  heroImage: string;
  category: CategorySlug | string;
  categoryNameTamil?: string;
  author: Author;
  tags: string[];
  issueId?: string;
  issueTitle?: string;
  pdfPage?: number;
  isEditorial?: boolean;
  publishedAt: string;
  readTimeMinutes: number;
}

export type NewsStatus = 'collected' | 'processing' | 'draft' | 'review' | 'approved' | 'rejected' | 'published';

export interface NewsSource {
  id: string;
  name: string;
  feed_url: string;
  source_type: 'rss' | string;
  category: string;
  region: string;
  priority: number;
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface NewsItem {
  id: string;
  source: string;
  sourceUrl?: string;
  source_url?: string;
  originalHeadline: string;
  original_headline?: string;
  originalContent: string;
  headline: string;
  summary: string;
  content: string;
  category: string;
  categoryNameTamil: string;
  tags: string[];
  publishedAt: string;
  imageUrl?: string;
  image_url?: string;
  relevanceScore: number;
  status: 'review' | 'published' | 'draft' | 'archived' | 'collected' | 'processing' | string;
  isBreaking?: boolean;
  is_breaking?: boolean;
  reviewedBy?: string;
  reviewed_by?: string;
  reviewedAt?: string;
  aiProcessingNotes?: string;
  ai_processing_notes?: string;

  // DB columns (public.news_items)
  source_id?: string | null;
  original_url?: string;
  original_title?: string;
  original_content?: string | null;
  source_name?: string;
  category_slug?: string;
  published_at?: string | null;
  discovered_at?: string;
  relevance_score?: number;
  duplicate_hash?: string;
  created_at?: string;
  updated_at?: string;
}

export type NewsDraftReviewStatus = 'pending' | 'approved' | 'rejected' | 'published';

export interface NewsDraft {
  id: string;
  news_item_id: string;
  tamil_headline: string;
  tamil_summary: string;
  tamil_content: string;
  category_id?: string | null;
  category?: string;
  category_slug?: string;
  tags: string[];
  image_url?: string | null;
  ai_model: string;
  review_status: NewsDraftReviewStatus | string;
  reviewed_by?: string | null;
  review_notes?: string | null;
  reviewed_at?: string | null;
  created_at?: string;
  updated_at?: string;

  // Joined/related metadata for editorial desk UI
  news_item?: NewsItem | null;
  source_name?: string;
  original_url?: string;
  original_title?: string;
  original_content?: string;
  source_published_at?: string;
}

export interface NewsCollectionResult {
  sourcesChecked: number;
  storiesFound: number;
  storiesInserted: number;
  itemsAdded: number;
  duplicatesSkipped: number;
  irrelevantSkipped: number;
  lowScoreFiltered: number;
  errors: { sourceName: string; feedUrl: string; message: string }[];
}

export interface Media {
  id: string;
  name: string;
  url: string;
  public_id?: string | null;
  category: string;
  mime_type?: string | null;
  size_bytes?: number | null;
  width?: number | null;
  height?: number | null;
  alt_text?: string | null;
  created_by?: string | null;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  // UI compatibility aliases
  type?: 'image' | 'pdf' | string;
  size?: string;
  altText?: string;
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
