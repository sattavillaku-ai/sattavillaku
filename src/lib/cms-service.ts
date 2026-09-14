import { createClient as createBrowserClient } from '@/lib/supabase/client';
import { Category, Author, Tag, Article, Media, Issue, TableOfContentItem, IssueStatus, NewsSource, NewsItem, NewsDraft } from '@/types';
import { SupabaseClient } from '@supabase/supabase-js';

// Helper to get supabase client
function getClient(client?: SupabaseClient) {
  return client || createBrowserClient();
}

// Helper to check if string is valid UUID
export function isUuid(str?: string | null): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str.trim());
}

export function generateSlug(text: string): string {
  if (!text) return `item-${Date.now()}`;
  let slug = text
    .trim()
    .toLowerCase()
    .replace(/[\s\t\n]+/g, '-')
    .replace(/[^\p{L}\p{N}\-_]/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  if (!slug) {
    slug = `item-${Date.now()}`;
  }
  return slug;
}


/* =========================================================
   CATEGORIES CRUD (public.categories)
   ========================================================= */

export async function fetchCategories(client?: SupabaseClient): Promise<Category[]> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Error fetching categories:', error.message);
    throw new Error('பிரிவுகளை ஏற்றுவதில் பிழை ஏற்பட்டது.');
  }

  return (data || []).map((c) => ({
    id: c.id,
    name: c.name,
    name_en: c.name_en,
    slug: c.slug,
    description: c.description,
    display_order: c.display_order,
    created_at: c.created_at,
    updated_at: c.updated_at,
    // compatibility
    nameTamil: c.name,
    nameEnglish: c.name_en || '',
    order: c.display_order,
  }));
}

export async function createCategory(
  category: { name: string; name_en?: string; slug: string; description?: string; display_order?: number },
  client?: SupabaseClient
): Promise<Category> {
  const supabase = getClient(client);
  const slug = generateSlug(category.slug || category.name);

  const { data, error } = await supabase
    .from('categories')
    .insert([
      {
        name: category.name.trim(),
        name_en: category.name_en?.trim() || null,
        slug,
        description: category.description?.trim() || null,
        display_order: category.display_order ?? 0,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating category:', error.message);
    throw new Error('பிரிவைச் சேமிக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
  }

  return {
    id: data.id,
    name: data.name,
    name_en: data.name_en,
    slug: data.slug,
    description: data.description,
    display_order: data.display_order,
    nameTamil: data.name,
    nameEnglish: data.name_en || '',
    order: data.display_order,
  };
}

export async function updateCategory(
  id: string,
  category: { name: string; name_en?: string; slug: string; description?: string; display_order?: number },
  client?: SupabaseClient
): Promise<Category> {
  const supabase = getClient(client);
  const slug = generateSlug(category.slug || category.name);

  const { data, error } = await supabase
    .from('categories')
    .update({
      name: category.name.trim(),
      name_en: category.name_en?.trim() || null,
      slug,
      description: category.description?.trim() || null,
      display_order: category.display_order ?? 0,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating category:', error.message);
    throw new Error('பிரிவைத் திருத்த முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
  }

  return {
    id: data.id,
    name: data.name,
    name_en: data.name_en,
    slug: data.slug,
    description: data.description,
    display_order: data.display_order,
    nameTamil: data.name,
    nameEnglish: data.name_en || '',
    order: data.display_order,
  };
}

export async function deleteCategory(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  const { error } = await supabase.from('categories').delete().eq('id', id);

  if (error) {
    console.error('Error deleting category:', error.message);
    throw new Error('பிரிவை நீக்க முடியவில்லை. தயவுசெய்து மீண்டும் முயற்சிக்கவும்.');
  }
}

/* =========================================================
   AUTHORS CRUD (public.authors)
   ========================================================= */

export async function fetchAuthors(client?: SupabaseClient): Promise<Author[]> {
  const supabase = getClient(client);
  const { data: authors, error } = await supabase
    .from('authors')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    console.error('Error fetching authors:', error.message);
    throw new Error('ஆசிரியர்களை ஏற்றுவதில் பிழை ஏற்பட்டது.');
  }

  // Get article counts for each author
  const { data: articleCounts } = await supabase
    .from('articles')
    .select('author_id');

  const countMap: Record<string, number> = {};
  if (articleCounts) {
    articleCounts.forEach((a) => {
      if (a.author_id) {
        countMap[a.author_id] = (countMap[a.author_id] || 0) + 1;
      }
    });
  }

  return (authors || []).map((a) => ({
    id: a.id,
    name: a.name,
    name_en: a.name_en,
    role: a.role || 'கட்டுரையாளர்',
    photo_url: a.photo_url || null,
    bio: a.bio || null,
    email: a.email || null,
    created_at: a.created_at,
    updated_at: a.updated_at,
    // compatibility
    photo: a.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    articlesCount: countMap[a.id] || 0,
  }));
}

export async function createAuthor(
  author: { name: string; name_en?: string; role: string; photo_url?: string; bio?: string; email?: string },
  client?: SupabaseClient
): Promise<Author> {
  const supabase = getClient(client);

  const { data, error } = await supabase
    .from('authors')
    .insert([
      {
        name: author.name.trim(),
        name_en: author.name_en?.trim() || null,
        role: author.role.trim(),
        photo_url: author.photo_url?.trim() || null,
        bio: author.bio?.trim() || null,
        email: author.email?.trim() || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating author:', error.message);
    throw new Error('எழுத்தாளரைச் சேமிக்க முடியவில்லை.');
  }

  return {
    id: data.id,
    name: data.name,
    name_en: data.name_en,
    role: data.role,
    photo_url: data.photo_url,
    bio: data.bio,
    email: data.email,
    photo: data.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
    articlesCount: 0,
  };
}

export async function updateAuthor(
  id: string,
  author: { name: string; name_en?: string; role: string; photo_url?: string; bio?: string; email?: string },
  client?: SupabaseClient
): Promise<Author> {
  const supabase = getClient(client);

  const { data, error } = await supabase
    .from('authors')
    .update({
      name: author.name.trim(),
      name_en: author.name_en?.trim() || null,
      role: author.role.trim(),
      photo_url: author.photo_url?.trim() || null,
      bio: author.bio?.trim() || null,
      email: author.email?.trim() || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating author:', error.message);
    throw new Error('எழுத்தாளர் விவரங்களைத் திருத்த முடியவில்லை.');
  }

  return {
    id: data.id,
    name: data.name,
    name_en: data.name_en,
    role: data.role,
    photo_url: data.photo_url,
    bio: data.bio,
    email: data.email,
    photo: data.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  };
}

export async function deleteAuthor(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  const { error } = await supabase.from('authors').delete().eq('id', id);

  if (error) {
    console.error('Error deleting author:', error.message);
    throw new Error('எழுத்தாளரை நீக்க முடியவில்லை.');
  }
}

/* =========================================================
   TAGS & ARTICLE_TAGS CRUD (public.tags & public.article_tags)
   ========================================================= */

export async function fetchTags(client?: SupabaseClient): Promise<Tag[]> {
  const supabase = getClient(client);
  const { data, error } = await supabase.from('tags').select('*').order('name', { ascending: true });

  if (error) {
    console.error('Error fetching tags:', error.message);
    return [];
  }

  return data || [];
}

export async function ensureTag(name: string, client?: SupabaseClient): Promise<Tag> {
  const supabase = getClient(client);
  const trimmed = name.trim();
  const slug = generateSlug(trimmed);

  // Try finding existing
  const { data: existing } = await supabase
    .from('tags')
    .select('*')
    .or(`name.eq."${trimmed}",slug.eq."${slug}"`)
    .maybeSingle();

  if (existing) return existing;

  // Insert new
  const { data: created, error } = await supabase
    .from('tags')
    .insert([{ name: trimmed, slug }])
    .select()
    .single();

  if (error || !created) {
    // Retry finding in case of race condition
    const { data: retry } = await supabase.from('tags').select('*').eq('slug', slug).maybeSingle();
    if (retry) return retry;
    throw new Error(`குறிச்சொல் சேமிக்க முடியவில்லை: ${name}`);
  }

  return created;
}

export async function syncArticleTags(articleId: string, tagNames: string[], client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  const cleanTags = Array.from(new Set(tagNames.map((t) => t.trim()).filter(Boolean)));

  // 1. Resolve all tag records
  const resolvedTags: Tag[] = [];
  for (const name of cleanTags) {
    try {
      const tag = await ensureTag(name, supabase);
      resolvedTags.push(tag);
    } catch (e) {
      console.warn('Could not ensure tag:', name, e);
    }
  }

  // 2. Fetch existing relations
  const { data: existingLinks } = await supabase
    .from('article_tags')
    .select('tag_id')
    .eq('article_id', articleId);

  const existingTagIds = new Set((existingLinks || []).map((l) => l.tag_id));
  const newTagIds = new Set(resolvedTags.map((t) => t.id));

  // 3. Remove deleted links
  const toDelete = Array.from(existingTagIds).filter((id) => !newTagIds.has(id));
  if (toDelete.length > 0) {
    await supabase
      .from('article_tags')
      .delete()
      .eq('article_id', articleId)
      .in('tag_id', toDelete);
  }

  // 4. Insert new links
  const toInsert = Array.from(newTagIds)
    .filter((id) => !existingTagIds.has(id))
    .map((tag_id) => ({ article_id: articleId, tag_id }));

  if (toInsert.length > 0) {
    await supabase.from('article_tags').insert(toInsert);
  }
}

export async function updateTag(
  id: string,
  tag: { name: string; slug?: string },
  client?: SupabaseClient
): Promise<Tag> {
  const supabase = getClient(client);
  const trimmed = tag.name.trim();
  const slug = generateSlug(tag.slug || trimmed);

  const { data, error } = await supabase
    .from('tags')
    .update({ name: trimmed, slug })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating tag:', error.message);
    throw new Error('குறிச்சொல்லைப் புதுப்பிக்க முடியவில்லை.');
  }

  return data;
}

export async function deleteTag(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  // Delete related article_tags first
  await supabase.from('article_tags').delete().eq('tag_id', id);
  const { error } = await supabase.from('tags').delete().eq('id', id);

  if (error) {
    console.error('Error deleting tag:', error.message);
    throw new Error('குறிச்சொல்லை நீக்க முடியவில்லை.');
  }
}

/* =========================================================
   ARTICLES CRUD (public.articles)
   ========================================================= */

export async function fetchArticles(
  options?: {
    status?: string;
    categoryId?: string;
    search?: string;
    limit?: number;
    offset?: number;
    sortBy?: 'published_at' | 'created_at' | 'views' | 'oldest' | 'updated_at';
  },
  client?: SupabaseClient
): Promise<Article[]> {
  const supabase = getClient(client);

  let query = supabase
    .from('articles')
    .select(`
      *,
      category:category_id ( id, name, name_en, slug ),
      author:author_id ( id, name, name_en, role, photo_url ),
      issue:issue_id ( id, title, issue_number, month, year ),
      article_tags (
        tag:tag_id ( id, name, slug )
      )
    `);

  // Sorting
  if (options?.sortBy === 'views') {
    query = query.order('views', { ascending: false }).order('published_at', { ascending: false });
  } else if (options?.sortBy === 'oldest') {
    query = query.order('published_at', { ascending: true, nullsFirst: false });
  } else if (options?.sortBy === 'updated_at') {
    query = query.order('updated_at', { ascending: false });
  } else if (options?.sortBy === 'created_at') {
    query = query.order('created_at', { ascending: false });
  } else {
    // Default publication freshness: published_at DESC, then created_at DESC
    query = query.order('published_at', { ascending: false, nullsFirst: false }).order('created_at', { ascending: false });
  }

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.categoryId && options.categoryId !== 'all') {
    if (isUuid(options.categoryId)) {
      query = query.eq('category_id', options.categoryId);
    } else {
      // Find category ID by slug
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', options.categoryId)
        .maybeSingle();

      if (catData?.id) {
        query = query.eq('category_id', catData.id);
      }
    }
  }

  if (options?.search && options.search.trim()) {
    const term = options.search.trim();
    query = query.or(`title.ilike.%${term}%,excerpt.ilike.%${term}%,author_name.ilike.%${term}%`);
  }

  if (typeof options?.limit === 'number' && options.limit > 0) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching articles:', error.message);
    throw new Error('கட்டுரைகளை ஏற்றுவதில் பிழை ஏற்பட்டது.');
  }


  return (data || []).map((item) => {
    const rawTags = (item.article_tags || [])
      .map((at: any) => at.tag?.name)
      .filter(Boolean);

    const authorObj: Author = item.author
      ? {
          id: item.author.id,
          name: item.author.name,
          name_en: item.author.name_en,
          role: item.author.role,
          photo_url: item.author.photo_url,
          photo: item.author.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        }
      : {
          id: 'unassigned',
          name: item.author_name || 'ஆசிரியர் குழு',
          role: 'ஆசிரியர்',
          photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        };

    const categorySlug = item.category?.slug || 'law';
    const categoryName = item.category?.name || 'சட்டம்';

    const heroImg =
      item.hero_image_url ||
      item.image_url ||
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80';

    return {
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt || '',
      content: item.content || '',
      hero_image_url: heroImg,
      image_url: heroImg,
      hero_media_id: item.hero_media_id,
      category_id: item.category_id,
      author_id: item.author_id,
      author_name: item.author_name || authorObj.name,
      issue_id: item.issue_id,
      featured: Boolean(item.featured),
      pdf_page: item.pdf_page,
      read_time_minutes: item.read_time_minutes || 5,
      status: (item.status === 'published' ? 'published' : 'draft') as 'published' | 'draft',
      published_at: item.published_at,
      created_at: item.created_at,
      updated_at: item.updated_at,
      created_by: item.created_by,
      views: Number(item.views || 0),
      // UI compatibility properties
      heroImage: heroImg,
      category: categorySlug,
      categoryNameTamil: categoryName,
      author: authorObj,
      tags: rawTags,
      issueId: item.issue_id || undefined,
      issueTitle: item.issue ? `${item.issue.title || `இதழ் ${item.issue.issue_number}`}` : undefined,
      pdfPage: item.pdf_page || undefined,
      publishedAt: item.published_at || item.created_at || new Date().toISOString(),
      readTimeMinutes: item.read_time_minutes || 5,
    };
  });
}

export async function fetchArticleById(id: string, client?: SupabaseClient): Promise<Article | null> {
  const supabase = getClient(client);

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:category_id ( id, name, name_en, slug ),
      author:author_id ( id, name, name_en, role, photo_url ),
      issue:issue_id ( id, title, issue_number, month, year ),
      article_tags (
        tag:tag_id ( id, name, slug )
      )
    `)
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  const rawTags = (data.article_tags || [])
    .map((at: any) => at.tag?.name)
    .filter(Boolean);

  const authorObj: Author = data.author
    ? {
        id: data.author.id,
        name: data.author.name,
        name_en: data.author.name_en,
        role: data.author.role,
        photo_url: data.author.photo_url,
        photo: data.author.photo_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      }
    : {
        id: 'unassigned',
        name: data.author_name || 'ஆசிரியர் குழு',
        role: 'ஆசிரியர்',
        photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      };

  const heroImg =
    data.hero_image_url ||
    data.image_url ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80';

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    hero_image_url: heroImg,
    image_url: heroImg,
    hero_media_id: data.hero_media_id,
    category_id: data.category_id,
    author_id: data.author_id,
    author_name: data.author_name || authorObj.name,
    issue_id: data.issue_id,
    featured: Boolean(data.featured),
    pdf_page: data.pdf_page,
    read_time_minutes: data.read_time_minutes || 5,
    status: (data.status === 'published' ? 'published' : 'draft') as 'published' | 'draft',
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    created_by: data.created_by,
    views: Number(data.views || 0),
    heroImage: heroImg,
    category: data.category?.slug || 'law',
    categoryNameTamil: data.category?.name || 'சட்டம்',
    author: authorObj,
    tags: rawTags,
    issueId: data.issue_id || undefined,
    issueTitle: data.issue ? `${data.issue.title || `இதழ் ${data.issue.issue_number}`}` : undefined,
    pdfPage: data.pdf_page || undefined,
    publishedAt: data.published_at || data.created_at || new Date().toISOString(),
    readTimeMinutes: data.read_time_minutes || 5,
  };
}

export async function fetchArticleBySlug(slug: string, client?: SupabaseClient): Promise<Article | null> {
  const supabase = getClient(client);

  const { data, error } = await supabase
    .from('articles')
    .select(`
      *,
      category:category_id ( id, name, name_en, slug ),
      author:author_id ( id, name, name_en, role, photo_url ),
      issue:issue_id ( id, title, issue_number, month, year ),
      article_tags (
        tag:tag_id ( id, name, slug )
      )
    `)
    .eq('slug', slug)
    .maybeSingle();

  if (error || !data) return null;

  const rawTags = (data.article_tags || [])
    .map((at: any) => at.tag?.name)
    .filter(Boolean);

  const heroImg =
    data.hero_image_url ||
    data.image_url ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=1200&auto=format&fit=crop&q=80';

  return {
    id: data.id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt || '',
    content: data.content || '',
    hero_image_url: heroImg,
    image_url: heroImg,
    hero_media_id: data.hero_media_id,
    category_id: data.category_id,
    author_id: data.author_id,
    author_name: data.author_name || (data.author?.name ?? 'ஆசிரியர் குழு'),
    issue_id: data.issue_id,
    featured: Boolean(data.featured),
    pdf_page: data.pdf_page,
    read_time_minutes: data.read_time_minutes || 5,
    status: (data.status === 'published' ? 'published' : 'draft') as 'published' | 'draft',
    published_at: data.published_at,
    created_at: data.created_at,
    updated_at: data.updated_at,
    created_by: data.created_by,
    views: Number(data.views || 0),
    heroImage: heroImg,
    category: data.category?.slug || 'law',
    categoryNameTamil: data.category?.name || 'சட்டம்',
    author: data.author
      ? {
          id: data.author.id,
          name: data.author.name,
          name_en: data.author.name_en,
          role: data.author.role,
          photo_url: data.author.photo_url,
          photo: data.author.photo_url,
        }
      : {
          id: 'unassigned',
          name: data.author_name || 'ஆசிரியர் குழு',
          role: 'ஆசிரியர்',
          photo: heroImg,
        },
    tags: rawTags,
    publishedAt: data.published_at || data.created_at || new Date().toISOString(),
    readTimeMinutes: data.read_time_minutes || 5,
  };
}

export async function saveArticle(
  article: {
    id?: string;
    title: string;
    slug?: string;
    excerpt?: string;
    content: string;
    hero_image_url?: string;
    hero_media_id?: string;
    category_id?: string;
    author_id?: string;
    author_name?: string;
    issue_id?: string;
    featured?: boolean;
    pdf_page?: number;
    read_time_minutes?: number;
    status: 'published' | 'draft' | string;
    published_at?: string | null;
    tags?: string[];
  },
  client?: SupabaseClient
): Promise<Article> {
  const supabase = getClient(client);

  if (!article.title || !article.title.trim()) {
    throw new Error('கட்டுரை தலைப்பு கட்டாயமாகும்.');
  }

  // Get authenticated user ID
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isNew = !article.id;

  // Resolve category_id: must be valid UUID or null
  let resolvedCategoryId: string | null = null;
  if (article.category_id) {
    if (isUuid(article.category_id)) {
      resolvedCategoryId = article.category_id;
    } else {
      const { data: cat } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', article.category_id)
        .maybeSingle();
      resolvedCategoryId = cat?.id || null;
    }
  }

  // Resolve author_id & author_name
  let resolvedAuthorId: string | null = null;
  let resolvedAuthorName: string | null = article.author_name || null;
  if (article.author_id) {
    if (isUuid(article.author_id)) {
      resolvedAuthorId = article.author_id;
      if (!resolvedAuthorName) {
        const { data: auth } = await supabase
          .from('authors')
          .select('name')
          .eq('id', resolvedAuthorId)
          .maybeSingle();
        if (auth?.name) resolvedAuthorName = auth.name;
      }
    } else {
      resolvedAuthorId = null;
    }
  }

  // Resolve issue_id: must be valid UUID or null
  let resolvedIssueId: string | null = null;
  if (article.issue_id && isUuid(article.issue_id)) {
    resolvedIssueId = article.issue_id;
  }

  // Resolve hero_media_id: must be valid UUID or null
  let resolvedMediaId: string | null = null;
  if (article.hero_media_id && isUuid(article.hero_media_id)) {
    resolvedMediaId = article.hero_media_id;
  }

  // Generate & ensure unique slug
  let baseSlug = generateSlug(article.slug || article.title);
  let candidateSlug = baseSlug;
  let attempts = 0;
  while (attempts < 10) {
    let checkQuery = supabase.from('articles').select('id').eq('slug', candidateSlug);
    if (!isNew && article.id) {
      checkQuery = checkQuery.neq('id', article.id);
    }
    const { data: existingSlug } = await checkQuery.maybeSingle();
    if (!existingSlug) break;
    attempts++;
    candidateSlug = `${baseSlug}-${Date.now().toString().slice(-4)}${attempts > 1 ? attempts : ''}`;
  }
  baseSlug = candidateSlug;

  const isPublished = article.status === 'published';
  const now = new Date().toISOString();

  // Published at resolution
  let resolvedPublishedAt: string | null = null;
  if (isPublished) {
    if (article.published_at) {
      resolvedPublishedAt = article.published_at;
    } else if (!isNew && article.id) {
      const { data: currentArticle } = await supabase
        .from('articles')
        .select('published_at')
        .eq('id', article.id)
        .maybeSingle();
      resolvedPublishedAt = currentArticle?.published_at || now;
    } else {
      resolvedPublishedAt = now;
    }
  } else {
    resolvedPublishedAt = null;
  }

  const payload: any = {
    title: article.title.trim(),
    slug: baseSlug,
    excerpt: article.excerpt?.trim() || null,
    content: article.content,
    hero_image_url: article.hero_image_url || null,
    image_url: article.hero_image_url || null,
    hero_media_id: resolvedMediaId,
    category_id: resolvedCategoryId,
    author_id: resolvedAuthorId,
    author_name: resolvedAuthorName || 'ஆசிரியர் குழு',
    issue_id: resolvedIssueId,
    featured: Boolean(article.featured),
    pdf_page: article.pdf_page ? Number(article.pdf_page) : null,
    read_time_minutes: article.read_time_minutes ? Number(article.read_time_minutes) : 5,
    status: article.status,
    published_at: resolvedPublishedAt,
    updated_at: now,
  };

  let savedId = article.id;

  if (isNew) {
    if (user?.id) {
      payload.created_by = user.id;
    }
    payload.created_at = now;
    payload.views = 0;

    const { data, error } = await supabase.from('articles').insert([payload]).select().single();

    if (error) {
      console.error('Error inserting article:', error.message);
      throw new Error(`கட்டுரையைச் சேமிப்பதில் பிழை ஏற்பட்டது: ${error.message}`);
    }
    savedId = data.id;
  } else {
    const { error } = await supabase.from('articles').update(payload).eq('id', article.id!);

    if (error) {
      console.error('Error updating article:', error.message);
      throw new Error(`கட்டுரையைப் புதுப்பிப்பதில் பிழை ஏற்பட்டது: ${error.message}`);
    }
  }

  // Synchronize article tags in public.article_tags
  if (savedId && article.tags) {
    await syncArticleTags(savedId, article.tags, supabase);
  }

  const fetched = await fetchArticleById(savedId!, supabase);
  if (!fetched) {
    throw new Error('கட்டுரையை மீட்டெடுப்பதில் பிழை.');
  }
  return fetched;
}

export async function deleteArticle(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);

  // 1. Delete associated tags in article_tags first to avoid foreign key constraints
  await supabase.from('article_tags').delete().eq('article_id', id);

  // 2. Delete article
  const { error } = await supabase.from('articles').delete().eq('id', id);

  if (error) {
    console.error('Error deleting article:', error.message);
    throw new Error('கட்டுரையை நீக்க முடியவில்லை.');
  }
}

export async function toggleArticlePublish(id: string, currentStatus: string, client?: SupabaseClient): Promise<string> {
  const supabase = getClient(client);
  const newStatus = currentStatus === 'published' ? 'draft' : 'published';
  const now = new Date().toISOString();

  const { error } = await supabase
    .from('articles')
    .update({
      status: newStatus,
      published_at: newStatus === 'published' ? now : null,
      updated_at: now,
    })
    .eq('id', id);

  if (error) {
    console.error('Error toggling publish status:', error.message);
    throw new Error('கட்டுரை நிலையை மாற்ற முடியவில்லை.');
  }

  return newStatus;
}

/* =========================================================
   ISSUES CRUD (public.issues)
   ========================================================= */

export function mapIssueRow(i: any): Issue {
  const cover =
    i.cover_image_url ||
    'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=800&auto=format&fit=crop&q=80';
  const toc: TableOfContentItem[] = Array.isArray(i.table_of_contents) ? i.table_of_contents : [];
  let status: IssueStatus = 'draft';
  if (i.status === 'published' || i.status === 'archived') {
    status = i.status;
  }

  return {
    id: i.id,
    title: i.title || '',
    slug: i.slug || `issue-${i.issue_number || Date.now()}`,
    issue_number: i.issue_number,
    issueNumber: i.issue_number ?? 1,
    volume_number: i.volume_number ?? 1,
    month: i.month || 'ஜூலை',
    year: i.year || (i.created_at ? new Date(i.created_at).getFullYear() : 2026),
    description: i.description || '',
    cover_image_url: i.cover_image_url,
    coverUrl: cover,
    pdf_url: i.pdf_url,
    pdfUrl: i.pdf_url || '',
    published_at: i.published_at,
    publicationDate: i.published_at || i.created_at || new Date().toISOString(),
    status,
    page_count: i.page_count,
    pageCount: Number(i.page_count) > 0 ? Number(i.page_count) : 64,
    is_free: i.is_free !== false,
    pdf_generated_at: i.pdf_generated_at,
    table_of_contents: toc,
    tableOfContents: toc,
    created_at: i.created_at,
    createdAt: i.created_at,
    updated_at: i.updated_at,
    created_by: i.created_by,
  };
}

export async function fetchIssues(
  options?: { status?: string; year?: number; search?: string; limit?: number },
  client?: SupabaseClient
): Promise<Issue[]> {
  const supabase = getClient(client);
  let query = supabase.from('issues').select('*').order('issue_number', { ascending: false });

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.year) {
    query = query.eq('year', options.year);
  }

  if (options?.search && options.search.trim()) {
    const term = options.search.trim();
    query = query.or(`title.ilike.%${term}%,description.ilike.%${term}%`);
  }

  if (typeof options?.limit === 'number' && options.limit > 0) {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching issues:', error.message);
    return [];
  }

  return (data || []).map(mapIssueRow);
}

export async function fetchPublishedIssues(
  options?: { year?: number; search?: string; limit?: number },
  client?: SupabaseClient
): Promise<Issue[]> {
  return fetchIssues({ ...options, status: 'published' }, client);
}

export async function fetchArchivedIssues(client?: SupabaseClient): Promise<Issue[]> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .in('status', ['published', 'archived'])
    .order('issue_number', { ascending: false });

  if (error) {
    console.error('Error fetching archived issues:', error.message);
    return [];
  }

  return (data || []).map(mapIssueRow);
}

export async function fetchCurrentIssue(client?: SupabaseClient): Promise<Issue | null> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .eq('status', 'published')
    .order('issue_number', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching current issue:', error.message);
    return null;
  }

  return data ? mapIssueRow(data) : null;
}

export async function fetchIssueById(id: string, client?: SupabaseClient): Promise<Issue | null> {
  const supabase = getClient(client);
  const { data, error } = await supabase.from('issues').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapIssueRow(data);
}

export async function fetchIssueBySlug(slug: string, client?: SupabaseClient): Promise<Issue | null> {
  const supabase = getClient(client);
  const { data, error } = await supabase.from('issues').select('*').eq('slug', slug).maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapIssueRow(data);
}

export async function saveIssue(
  issue: {
    id?: string;
    title: string;
    slug?: string;
    volume_number?: number;
    issue_number: number;
    month?: string;
    year?: number;
    description?: string;
    cover_image_url?: string;
    pdf_url?: string;
    published_at?: string | null;
    status: IssueStatus | string;
    is_free?: boolean;
    page_count?: number;
    table_of_contents?: TableOfContentItem[];
  },
  client?: SupabaseClient
): Promise<Issue> {
  const supabase = getClient(client);

  if (!issue.title || !issue.title.trim()) {
    throw new Error('இதழ் தலைப்பு கட்டாயமாகும்.');
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isNew = !issue.id;

  // Generate & ensure unique slug
  let baseSlug = generateSlug(issue.slug || issue.title || `issue-${issue.issue_number}`);
  let candidateSlug = baseSlug;
  let attempts = 0;
  while (attempts < 10) {
    let checkQuery = supabase.from('issues').select('id').eq('slug', candidateSlug);
    if (!isNew && issue.id) {
      checkQuery = checkQuery.neq('id', issue.id);
    }
    const { data: existingSlug } = await checkQuery.maybeSingle();
    if (!existingSlug) break;
    attempts++;
    candidateSlug = `${baseSlug}-${Date.now().toString().slice(-4)}${attempts > 1 ? attempts : ''}`;
  }
  baseSlug = candidateSlug;

  const isPublished = issue.status === 'published';
  const now = new Date().toISOString();

  let resolvedPublishedAt: string | null = issue.published_at || null;
  if (isPublished && !resolvedPublishedAt) {
    resolvedPublishedAt = now;
  }

  const payload: any = {
    title: issue.title.trim(),
    slug: baseSlug,
    issue_number: Number(issue.issue_number) || 1,
    volume_number: Number(issue.volume_number) || 1,
    month: issue.month?.trim() || 'ஜூலை',
    year: Number(issue.year) || new Date().getFullYear(),
    description: issue.description?.trim() || '',
    cover_image_url: issue.cover_image_url?.trim() || null,
    pdf_url: issue.pdf_url?.trim() || null,
    status: issue.status,
    is_free: issue.is_free !== false,
    page_count: Number(issue.page_count) || 0,
    table_of_contents: issue.table_of_contents || [],
    published_at: resolvedPublishedAt,
    updated_at: now,
  };

  if (isNew) {
    payload.created_at = now;
    if (user?.id) payload.created_by = user.id;

    const { data, error } = await supabase.from('issues').insert([payload]).select().single();
    if (error) {
      console.error('Error creating issue:', error.message);
      throw new Error(`இதழைச் சேமிக்க முடியவில்லை: ${error.message}`);
    }
    return mapIssueRow(data);
  } else {
    const { data, error } = await supabase
      .from('issues')
      .update(payload)
      .eq('id', issue.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating issue:', error.message);
      throw new Error(`இதழைப் புதுப்பிக்க முடியவில்லை: ${error.message}`);
    }
    return mapIssueRow(data);
  }
}

export async function toggleIssuePublish(
  id: string,
  currentStatus: IssueStatus,
  client?: SupabaseClient
): Promise<IssueStatus> {
  const supabase = getClient(client);
  const newStatus: IssueStatus = currentStatus === 'published' ? 'draft' : 'published';
  const now = new Date().toISOString();

  const updateData: any = {
    status: newStatus,
    updated_at: now,
  };

  if (newStatus === 'published') {
    updateData.published_at = now;
  }

  const { error } = await supabase.from('issues').update(updateData).eq('id', id);

  if (error) {
    console.error('Error toggling issue publish status:', error.message);
    throw new Error('இதழ் நிலையை மாற்ற முடியவில்லை.');
  }

  return newStatus;
}

export async function archiveIssue(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  const { error } = await supabase
    .from('issues')
    .update({ status: 'archived', updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    console.error('Error archiving issue:', error.message);
    throw new Error('இதழைக் காப்பகப்படுத்த முடியவில்லை.');
  }
}

export async function deleteIssue(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);

  // Check and delete issue_content first if any
  try {
    await supabase.from('issue_content').delete().eq('issue_id', id);
  } catch (e) {
    console.warn('Could not clean issue_content:', e);
  }

  const { error } = await supabase.from('issues').delete().eq('id', id);

  if (error) {
    console.error('Error deleting issue:', error.message);
    throw new Error('இதழை நீக்க முடியவில்லை.');
  }
}

/* =========================================================
   DASHBOARD STATS (Aggregated Real Supabase Counts)
   ========================================================= */

export interface DashboardStats {
  currentIssue: Issue | null;
  totalArticles: number;
  publishedArticlesCount: number;
  draftArticlesCount: number;
  totalIssuesCount: number;
  publishedIssuesCount: number;
  newsReviewCount: number;
  collectedNewsCount: number;
  newsSourcesCount: number;
  publishedNewsCount: number;
  recentArticles: Article[];
  recentIssues: Issue[];
  recentNewsDrafts: any[];
}

export async function fetchDashboardStats(client?: SupabaseClient): Promise<DashboardStats> {
  const supabase = getClient(client);

  // Parallel count queries for optimal performance
  const [
    articlesPublishedRes,
    articlesDraftRes,
    totalArticlesRes,
    issuesTotalRes,
    issuesPublishedRes,
    issuesListRes,
    newsReviewRes,
    newsCollectedRes,
    newsSourcesRes,
    newsPublishedRes,
    newsDraftsPendingRes,
    recentArticles,
    recentNewsDraftsRes,
  ] = await Promise.all([
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('articles').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
    supabase.from('articles').select('id', { count: 'exact', head: true }),
    supabase.from('issues').select('id', { count: 'exact', head: true }),
    supabase.from('issues').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('issues').select('*').order('issue_number', { ascending: false }).limit(4),
    supabase.from('news_items').select('id', { count: 'exact', head: true }).in('status', ['review', 'draft']),
    supabase.from('news_items').select('id', { count: 'exact', head: true }).eq('status', 'collected'),
    supabase.from('news_sources').select('id', { count: 'exact', head: true }).eq('active', true),
    supabase.from('news_items').select('id', { count: 'exact', head: true }).eq('status', 'published'),
    supabase.from('news_drafts').select('id', { count: 'exact', head: true }).eq('review_status', 'pending'),
    fetchArticles({ status: 'all', limit: 5 }, supabase),
    supabase.from('news_items').select('*').in('status', ['review', 'draft', 'collected']).order('created_at', { ascending: false }).limit(4),
  ]);

  const publishedCount = articlesPublishedRes.count ?? 0;
  const draftCount = articlesDraftRes.count ?? 0;
  const totalArticles = totalArticlesRes.count ?? (publishedCount + draftCount);
  const totalIssuesCount = issuesTotalRes.count ?? 0;
  const publishedIssuesCount = issuesPublishedRes.count ?? 0;

  const issues: Issue[] = (issuesListRes.data || []).map(mapIssueRow);

  const latestIssue = issues.length > 0 ? issues[0] : null;

  return {
    currentIssue: latestIssue,
    totalArticles,
    publishedArticlesCount: publishedCount,
    draftArticlesCount: draftCount,
    totalIssuesCount,
    publishedIssuesCount,
    newsReviewCount: (newsReviewRes.count ?? 0) + (newsDraftsPendingRes.count ?? 0),
    collectedNewsCount: newsCollectedRes.count ?? 0,
    newsSourcesCount: newsSourcesRes.count ?? 0,
    publishedNewsCount: newsPublishedRes.count ?? 0,
    recentArticles,
    recentIssues: issues,
    recentNewsDrafts: recentNewsDraftsRes.data || [],
  };
}

/* =========================================================
   MEDIA CRUD (public.media)
   ========================================================= */

export async function fetchMediaList(category?: string, client?: SupabaseClient): Promise<Media[]> {
  const supabase = getClient(client);

  let query = supabase.from('media').select('*').order('created_at', { ascending: false });

  if (category && category !== 'all') {
    query = query.eq('category', category);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching media list:', error.message);
    return [];
  }

  const mediaItems = data || [];

  // Parallel usage discovery from articles, issues, and authors
  let usageMap = new Map<string, { count: number; items: { type: 'article' | 'issue' | 'author'; title: string; id: string }[] }>();

  try {
    const [articlesRes, issuesRes, authorsRes] = await Promise.all([
      supabase.from('articles').select('id, title, hero_image_url, image_url, hero_media_id'),
      supabase.from('issues').select('id, title, cover_image_url'),
      supabase.from('authors').select('id, name, photo_url'),
    ]);

    const articles = articlesRes.data || [];
    const issues = issuesRes.data || [];
    const authors = authorsRes.data || [];

    for (const m of mediaItems) {
      const uses: { type: 'article' | 'issue' | 'author'; title: string; id: string }[] = [];

      // Check articles
      articles.forEach((art) => {
        if (
          art.hero_media_id === m.id ||
          (art.hero_image_url && art.hero_image_url === m.url) ||
          (art.image_url && art.image_url === m.url)
        ) {
          uses.push({ type: 'article', title: art.title, id: art.id });
        }
      });

      // Check issues
      issues.forEach((iss) => {
        if (iss.cover_image_url && iss.cover_image_url === m.url) {
          uses.push({ type: 'issue', title: iss.title, id: iss.id });
        }
      });

      // Check authors
      authors.forEach((auth) => {
        if (auth.photo_url && auth.photo_url === m.url) {
          uses.push({ type: 'author', title: auth.name, id: auth.id });
        }
      });

      usageMap.set(m.id, { count: uses.length, items: uses });
    }
  } catch (err) {
    console.warn('Could not calculate media usages:', err);
  }

  return mediaItems.map((m) => {
    const usage = usageMap.get(m.id);
    const inferredSource = m.public_id?.includes('drive')
      ? 'Google Drive'
      : m.url?.includes('cloudinary')
      ? 'Local Upload'
      : 'Existing Library';

    return {
      id: m.id,
      name: m.name,
      url: m.url,
      public_id: m.public_id,
      category: m.category,
      mime_type: m.mime_type,
      size_bytes: m.size_bytes,
      width: m.width,
      height: m.height,
      alt_text: m.alt_text,
      created_by: m.created_by,
      created_at: m.created_at,
      updated_at: m.updated_at,
      // UI compatibility
      type: m.mime_type?.includes('pdf') ? 'pdf' : 'image',
      size: m.size_bytes ? `${(m.size_bytes / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
      altText: m.alt_text || m.name,
      source: inferredSource,
      usageCount: usage?.count || 0,
      usedBy: usage?.items || [],
    };
  });
}

export async function createMediaRecord(
  media: {
    name: string;
    url: string;
    public_id?: string;
    category?: string;
    mime_type?: string;
    size_bytes?: number;
    width?: number;
    height?: number;
    alt_text?: string;
  },
  client?: SupabaseClient
): Promise<Media> {
  const supabase = getClient(client);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data, error } = await supabase
    .from('media')
    .insert([
      {
        name: media.name.trim(),
        url: media.url.trim(),
        public_id: media.public_id || null,
        category: media.category || 'article',
        mime_type: media.mime_type || 'image/jpeg',
        size_bytes: media.size_bytes || null,
        width: media.width || null,
        height: media.height || null,
        alt_text: media.alt_text?.trim() || media.name.trim(),
        created_by: user?.id || null,
      },
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating media record:', error.message);
    throw new Error('மீடியா பதிவைச் சேமிக்க முடியவில்லை.');
  }

  return {
    id: data.id,
    name: data.name,
    url: data.url,
    public_id: data.public_id,
    category: data.category,
    mime_type: data.mime_type,
    size_bytes: data.size_bytes,
    width: data.width,
    height: data.height,
    alt_text: data.alt_text,
    created_by: data.created_by,
    created_at: data.created_at,
    type: data.mime_type?.includes('pdf') ? 'pdf' : 'image',
    size: data.size_bytes ? `${(data.size_bytes / (1024 * 1024)).toFixed(1)} MB` : '1.0 MB',
    altText: data.alt_text || data.name,
    source: data.public_id?.includes('drive') ? 'Google Drive' : 'Local Upload',
    usageCount: 0,
    usedBy: [],
  };
}

export async function deleteMediaRecord(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);

  // 1. Verify media exists
  const { data: media, error: fetchErr } = await supabase
    .from('media')
    .select('id, name, url, public_id')
    .eq('id', id)
    .maybeSingle();

  if (fetchErr || !media) {
    throw new Error('மீடியா பதிவு காணப்படவில்லை.');
  }

  // 2. Enforce Usage Safety: check if in use
  const [artCount, issCount, authCount] = await Promise.all([
    supabase
      .from('articles')
      .select('id', { count: 'exact', head: true })
      .or(`hero_media_id.eq.${id},hero_image_url.eq.${media.url},image_url.eq.${media.url}`),
    supabase
      .from('issues')
      .select('id', { count: 'exact', head: true })
      .eq('cover_image_url', media.url),
    supabase
      .from('authors')
      .select('id', { count: 'exact', head: true })
      .eq('photo_url', media.url),
  ]);

  const totalUsed = (artCount.count || 0) + (issCount.count || 0) + (authCount.count || 0);
  if (totalUsed > 0) {
    throw new Error(`இந்தப் படம் தற்போது ${totalUsed} உருப்படிகளில் பயன்படுத்தப்படுவதால் இதை நீக்க முடியாது.`);
  }

  // 3. Delete from public.media
  const { error } = await supabase.from('media').delete().eq('id', id);

  if (error) {
    console.error('Error deleting media record:', error.message);
    throw new Error('மீடியா பதிவை நீக்க முடியவில்லை.');
  }
}

/* =========================================================
   NEWS SOURCES CRUD (public.news_sources)
   ========================================================= */

export async function fetchNewsSources(client?: SupabaseClient): Promise<NewsSource[]> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('news_sources')
    .select('*')
    .order('priority', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching news sources:', error.message);
    return [];
  }

  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    feed_url: s.feed_url,
    source_type: s.source_type || 'rss',
    category: s.category || 'law',
    region: s.region || 'India',
    priority: s.priority ?? 50,
    active: s.active ?? true,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

export async function createNewsSource(
  source: {
    name: string;
    feed_url: string;
    source_type?: string;
    category?: string;
    region?: string;
    priority?: number;
    active?: boolean;
  },
  client?: SupabaseClient
): Promise<NewsSource> {
  const supabase = getClient(client);

  if (!source.name || !source.name.trim()) {
    throw new Error('செய்தி மூலத்தின் பெயர் கட்டாயமாகும்.');
  }
  if (!source.feed_url || !source.feed_url.trim()) {
    throw new Error('RSS/Feed URL கட்டாயமாகும்.');
  }

  const payload = {
    name: source.name.trim(),
    feed_url: source.feed_url.trim(),
    source_type: source.source_type || 'rss',
    category: source.category || 'law',
    region: source.region || 'India',
    priority: Number(source.priority) || 50,
    active: source.active ?? true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase.from('news_sources').insert([payload]).select().single();

  if (error) {
    console.error('Error creating news source:', error.message);
    throw new Error(`செய்தி மூலத்தை உருவாக்க முடியவில்லை: ${error.message}`);
  }

  return data;
}

export async function updateNewsSource(
  id: string,
  source: Partial<NewsSource>,
  client?: SupabaseClient
): Promise<NewsSource> {
  const supabase = getClient(client);

  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (source.name !== undefined) payload.name = source.name.trim();
  if (source.feed_url !== undefined) payload.feed_url = source.feed_url.trim();
  if (source.source_type !== undefined) payload.source_type = source.source_type;
  if (source.category !== undefined) payload.category = source.category;
  if (source.region !== undefined) payload.region = source.region;
  if (source.priority !== undefined) payload.priority = Number(source.priority);
  if (source.active !== undefined) payload.active = Boolean(source.active);

  const { data, error } = await supabase
    .from('news_sources')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating news source:', error.message);
    throw new Error(`செய்தி மூலத்தைப் புதுப்பிக்க முடியவில்லை: ${error.message}`);
  }

  return data;
}

export async function toggleNewsSourceActive(
  id: string,
  newActive: boolean,
  client?: SupabaseClient
): Promise<NewsSource> {
  const supabase = getClient(client);

  const { data, error } = await supabase
    .from('news_sources')
    .update({ active: newActive, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error toggling source active:', error.message);
    throw new Error('செய்தி மூலத்தின் நிலையை மாற்ற முடியவில்லை.');
  }

  return {
    id: data.id,
    name: data.name,
    feed_url: data.feed_url,
    source_type: data.source_type || 'rss',
    category: data.category || 'law',
    region: data.region || 'India',
    priority: data.priority ?? 50,
    active: data.active ?? true,
    created_at: data.created_at,
    updated_at: data.updated_at,
  };
}

export async function deleteNewsSource(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);

  // Safely nullify source_id on related news_items to prevent deletion of historical collected stories
  try {
    await supabase.from('news_items').update({ source_id: null }).eq('source_id', id);
  } catch (e) {
    console.warn('Could not nullify source_id in news_items:', e);
  }

  const { error } = await supabase.from('news_sources').delete().eq('id', id);

  if (error) {
    console.error('Error deleting news source:', error.message);
    throw new Error('செய்தி மூலத்தை நீக்க முடியவில்லை.');
  }
}

export async function seedDefaultSources(client?: SupabaseClient): Promise<NewsSource[]> {
  const supabase = getClient(client);
  const existing = await fetchNewsSources(supabase);

  if (existing.length > 0) {
    return existing;
  }

  const toInsert = [
    {
      name: 'Bar & Bench (Legal News)',
      feed_url: 'https://www.barandbench.com/feed',
      source_type: 'rss',
      category: 'law',
      region: 'India',
      priority: 95,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'LiveLaw (Courts & Verdicts)',
      feed_url: 'https://www.livelaw.in/rss/all-news.xml',
      source_type: 'rss',
      category: 'law',
      region: 'India',
      priority: 90,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'The Hindu (Tamil Nadu)',
      feed_url: 'https://www.thehindu.com/news/national/tamil-nadu/feeder/default.rss',
      source_type: 'rss',
      category: 'tamil-nadu',
      region: 'Tamil Nadu',
      priority: 85,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'The Hindu (National India)',
      feed_url: 'https://www.thehindu.com/news/national/feeder/default.rss',
      source_type: 'rss',
      category: 'india',
      region: 'India',
      priority: 80,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      name: 'Indian Express (Political Pulse)',
      feed_url: 'https://indianexpress.com/section/political-pulse/feed/',
      source_type: 'rss',
      category: 'politics',
      region: 'India',
      priority: 85,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  const { data, error } = await supabase.from('news_sources').insert(toInsert).select();

  if (error) {
    console.error('Error seeding news sources:', error.message);
    throw new Error('செய்தி மூலங்களை நிறுவுவதில் பிழை ஏற்பட்டது.');
  }

  return (data || []).map((s) => ({
    id: s.id,
    name: s.name,
    feed_url: s.feed_url,
    source_type: s.source_type || 'rss',
    category: s.category || 'law',
    region: s.region || 'India',
    priority: s.priority ?? 50,
    active: s.active ?? true,
    created_at: s.created_at,
    updated_at: s.updated_at,
  }));
}

/* =========================================================
   NEWS ITEMS CRUD (public.news_items)
   ========================================================= */

export function mapNewsItemRow(row: any): NewsItem {
  return {
    id: row.id,
    source_id: row.source_id,
    original_url: row.original_url || '',
    original_title: row.original_title || '',
    original_content: row.original_content || '',
    source_name: row.source_name || 'செய்தி மூலம்',
    category: row.category || 'இந்தியா',
    category_slug: row.category_slug || 'india',
    published_at: row.published_at,
    discovered_at: row.discovered_at,
    relevance_score: Number(row.relevance_score) || 50,
    duplicate_hash: row.duplicate_hash,
    status: row.status || 'collected',
    created_at: row.created_at,
    updated_at: row.updated_at,

    // UI backward compatibility
    source: row.source_name || 'செய்தி மூலம்',
    sourceUrl: row.original_url || '',
    source_url: row.original_url || '',
    headline: row.original_title || '',
    originalHeadline: row.original_title || '',
    originalContent: row.original_content || '',
    summary: row.original_content || '',
    content: row.original_content || '',
    categoryNameTamil: row.category || 'இந்தியா',
    publishedAt: row.published_at || row.created_at || new Date().toISOString(),
    relevanceScore: Number(row.relevance_score) || 50,
    tags: [row.category_slug || 'india'],
  };
}

export async function fetchNewsItems(
  options?: {
    status?: string;
    category?: string;
    sourceId?: string;
    search?: string;
    minScore?: number;
    limit?: number;
    offset?: number;
  },
  client?: SupabaseClient
): Promise<{ items: NewsItem[]; total: number }> {
  const supabase = getClient(client);

  let query = supabase.from('news_items').select('*', { count: 'exact' });

  if (options?.status && options.status !== 'all') {
    query = query.eq('status', options.status);
  }

  if (options?.category && options.category !== 'all') {
    query = query.or(`category_slug.eq.${options.category},category.eq.${options.category}`);
  }

  if (options?.sourceId && options.sourceId !== 'all') {
    query = query.eq('source_id', options.sourceId);
  }

  if (options?.minScore) {
    query = query.gte('relevance_score', options.minScore);
  }

  if (options?.search && options.search.trim()) {
    const term = options.search.trim();
    query = query.or(`original_title.ilike.%${term}%,original_content.ilike.%${term}%,source_name.ilike.%${term}%`);
  }

  // Order newest published first, then highest relevance
  query = query.order('published_at', { ascending: false });

  if (typeof options?.limit === 'number' && options.limit > 0) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching news items:', error.message);
    return { items: [], total: 0 };
  }

  return {
    items: (data || []).map(mapNewsItemRow),
    total: count ?? (data?.length || 0),
  };
}

export async function fetchNewsItemById(id: string, client?: SupabaseClient): Promise<NewsItem | null> {
  const supabase = getClient(client);
  const { data, error } = await supabase.from('news_items').select('*').eq('id', id).maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapNewsItemRow(data);
}

export async function deleteNewsItem(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  const { error } = await supabase.from('news_items').delete().eq('id', id);

  if (error) {
    console.error('Error deleting news item:', error.message);
    throw new Error('செய்தியை நீக்க முடியவில்லை.');
  }
}

export async function updateNewsItem(
  id: string,
  updates: Partial<NewsItem>,
  client?: SupabaseClient
): Promise<NewsItem> {
  const supabase = getClient(client);

  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.original_title !== undefined) payload.original_title = updates.original_title;
  else if (updates.headline !== undefined) payload.original_title = updates.headline;

  if (updates.original_content !== undefined) payload.original_content = updates.original_content;
  else if (updates.content !== undefined) payload.original_content = updates.content;
  else if (updates.summary !== undefined) payload.original_content = updates.summary;

  if (updates.category !== undefined) payload.category = updates.category;
  if (updates.category_slug !== undefined) payload.category_slug = updates.category_slug;
  if (updates.status !== undefined) payload.status = updates.status;
  if (updates.relevance_score !== undefined) payload.relevance_score = updates.relevance_score;
  if (updates.relevanceScore !== undefined) payload.relevance_score = updates.relevanceScore;

  const { data, error } = await supabase
    .from('news_items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating news item:', error.message);
    throw new Error('செய்தியைப் புதுப்பிக்க முடியவில்லை: ' + error.message);
  }

  return mapNewsItemRow(data);
}

/* =========================================================
   NEWS DRAFTS CRUD (public.news_drafts)
   ========================================================= */

export function mapNewsDraftRow(row: any): NewsDraft {
  const item = row.news_item || row.news_items || null;
  return {
    id: row.id,
    news_item_id: row.news_item_id,
    tamil_headline: row.tamil_headline || '',
    tamil_summary: row.tamil_summary || '',
    tamil_content: row.tamil_content || '',
    category_id: row.category_id || null,
    category: row.category || item?.category || 'இந்தியா',
    category_slug: row.category_slug || item?.category_slug || 'india',
    tags: Array.isArray(row.tags) ? row.tags : [],
    image_url: row.image_url || null,
    ai_model: row.ai_model || 'gemini-1.5-flash',
    review_status: row.review_status || 'pending',
    reviewed_by: row.reviewed_by || null,
    review_notes: row.review_notes || null,
    reviewed_at: row.reviewed_at || null,
    created_at: row.created_at,
    updated_at: row.updated_at,

    // Joined fields for UI convenience
    news_item: item ? mapNewsItemRow(item) : null,
    source_name: item?.source_name || row.source_name || '',
    original_url: item?.original_url || row.original_url || '',
    original_title: item?.original_title || row.original_title || '',
    original_content: item?.original_content || row.original_content || '',
    source_published_at: item?.published_at || null,
  };
}

export async function fetchNewsDrafts(
  options?: {
    review_status?: string;
    category_id?: string;
    search?: string;
    limit?: number;
    offset?: number;
  },
  client?: SupabaseClient
): Promise<{ drafts: NewsDraft[]; total: number }> {
  const supabase = getClient(client);

  let query = supabase
    .from('news_drafts')
    .select('*, news_items (*)', { count: 'exact' });

  if (options?.review_status && options.review_status !== 'all') {
    query = query.eq('review_status', options.review_status);
  }

  if (options?.category_id && options.category_id !== 'all') {
    query = query.eq('category_id', options.category_id);
  }

  if (options?.search && options.search.trim()) {
    const term = options.search.trim();
    query = query.or(`tamil_headline.ilike.%${term}%,tamil_summary.ilike.%${term}%`);
  }

  query = query.order('created_at', { ascending: false });

  if (typeof options?.limit === 'number' && options.limit > 0) {
    const from = options.offset || 0;
    const to = from + options.limit - 1;
    query = query.range(from, to);
  }

  const { data, count, error } = await query;

  if (error) {
    console.error('Error fetching news drafts:', error.message);
    return { drafts: [], total: 0 };
  }

  return {
    drafts: (data || []).map(mapNewsDraftRow),
    total: count ?? (data?.length || 0),
  };
}

export async function fetchNewsDraftById(
  id: string,
  client?: SupabaseClient
): Promise<NewsDraft | null> {
  const supabase = getClient(client);
  const { data, error } = await supabase
    .from('news_drafts')
    .select('*, news_items (*)')
    .eq('id', id)
    .maybeSingle();

  if (error || !data) {
    return null;
  }

  return mapNewsDraftRow(data);
}

export async function saveNewsDraft(
  draft: {
    id?: string;
    news_item_id: string;
    tamil_headline: string;
    tamil_summary: string;
    tamil_content: string;
    category_id?: string | null;
    tags?: string[];
    image_url?: string | null;
    ai_model?: string;
    review_status?: string;
    review_notes?: string | null;
    reviewed_by?: string | null;
    reviewed_at?: string | null;
  },
  client?: SupabaseClient
): Promise<NewsDraft> {
  const supabase = getClient(client);
  const now = new Date().toISOString();

  const payload: any = {
    news_item_id: draft.news_item_id,
    tamil_headline: draft.tamil_headline.trim(),
    tamil_summary: draft.tamil_summary.trim(),
    tamil_content: draft.tamil_content.trim(),
    category_id: draft.category_id || null,
    tags: draft.tags || [],
    image_url: draft.image_url || null,
    ai_model: draft.ai_model || 'gemini-1.5-flash',
    review_status: draft.review_status || 'pending',
    review_notes: draft.review_notes || null,
    reviewed_by: draft.reviewed_by || null,
    reviewed_at: draft.reviewed_at || null,
    updated_at: now,
  };

  if (draft.id) {
    const { data, error } = await supabase
      .from('news_drafts')
      .update(payload)
      .eq('id', draft.id)
      .select('*, news_items (*)')
      .single();

    if (error) {
      console.error('Error updating news draft:', error.message);
      throw new Error(`செய்தி வரைவைப் புதுப்பிக்க முடியவில்லை: ${error.message}`);
    }
    return mapNewsDraftRow(data);
  } else {
    payload.created_at = now;
    const { data, error } = await supabase
      .from('news_drafts')
      .insert([payload])
      .select('*, news_items (*)')
      .single();

    if (error) {
      console.error('Error creating news draft:', error.message);
      throw new Error(`செய்தி வரைவைச் சேமிக்க முடியவில்லை: ${error.message}`);
    }
    return mapNewsDraftRow(data);
  }
}

export async function updateNewsDraft(
  id: string,
  updates: Partial<NewsDraft>,
  client?: SupabaseClient
): Promise<NewsDraft> {
  const supabase = getClient(client);

  const payload: any = {
    updated_at: new Date().toISOString(),
  };

  if (updates.tamil_headline !== undefined) payload.tamil_headline = updates.tamil_headline.trim();
  if (updates.tamil_summary !== undefined) payload.tamil_summary = updates.tamil_summary.trim();
  if (updates.tamil_content !== undefined) payload.tamil_content = updates.tamil_content.trim();
  if (updates.category_id !== undefined) payload.category_id = updates.category_id;
  if (updates.tags !== undefined) payload.tags = updates.tags;
  if (updates.image_url !== undefined) payload.image_url = updates.image_url;
  if (updates.review_status !== undefined) payload.review_status = updates.review_status;
  if (updates.review_notes !== undefined) payload.review_notes = updates.review_notes;
  if (updates.reviewed_by !== undefined) payload.reviewed_by = updates.reviewed_by;
  if (updates.reviewed_at !== undefined) payload.reviewed_at = updates.reviewed_at;

  const { data, error } = await supabase
    .from('news_drafts')
    .update(payload)
    .eq('id', id)
    .select('*, news_items (*)')
    .single();

  if (error) {
    console.error('Error updating news draft:', error.message);
    throw new Error('செய்தி வரைவைப் புதுப்பிக்க முடியவில்லை: ' + error.message);
  }

  return mapNewsDraftRow(data);
}

export async function deleteNewsDraft(id: string, client?: SupabaseClient): Promise<void> {
  const supabase = getClient(client);
  const { error } = await supabase.from('news_drafts').delete().eq('id', id);

  if (error) {
    console.error('Error deleting news draft:', error.message);
    throw new Error('செய்தி வரைவை நீக்க முடியவில்லை: ' + error.message);
  }
}

export async function publishNewsDraft(
  draftId: string,
  client?: SupabaseClient
): Promise<{ articleId: string; slug: string }> {
  const supabase = getClient(client);

  // 1. Fetch draft with parent news_item
  const draft = await fetchNewsDraftById(draftId, supabase);
  if (!draft) {
    throw new Error('பிரசுரிப்பதற்கான செய்தி வரைவு கிடைக்கவில்லை.');
  }

  // 2. Prepare article content with transparent source attribution
  let sourceAttributionHtml = '';
  if (draft.source_name || draft.original_url) {
    sourceAttributionHtml = `\n\n<hr class="my-6 border-border" />\n<p class="text-xs text-muted-foreground"><strong>செய்தி மூலம்:</strong> ${draft.source_name || 'அதிகாரப்பூர்வ தகவல்'}${draft.original_url ? ` | <a href="${draft.original_url}" target="_blank" rel="noopener noreferrer" class="underline hover:text-primary">அசல் செய்தி இணைப்பு</a>` : ''}</p>`;
  }

  const articleContent = `${draft.tamil_content}${sourceAttributionHtml}`;

  // 3. Save as published article in public.articles using existing saveArticle
  const savedArticle = await saveArticle(
    {
      title: draft.tamil_headline,
      excerpt: draft.tamil_summary,
      content: articleContent,
      category_id: draft.category_id || undefined,
      hero_image_url: draft.image_url || undefined,
      tags: draft.tags,
      status: 'published',
      published_at: new Date().toISOString(),
    },
    supabase
  );

  const now = new Date().toISOString();

  // 4. Update news_draft review_status to 'published'
  await supabase
    .from('news_drafts')
    .update({
      review_status: 'published',
      reviewed_at: now,
      updated_at: now,
    })
    .eq('id', draftId);

  // 5. Update news_items status to 'published'
  if (draft.news_item_id) {
    await supabase
      .from('news_items')
      .update({
        status: 'published',
        updated_at: now,
      })
      .eq('id', draft.news_item_id);
  }

  return { articleId: savedArticle.id, slug: savedArticle.slug };
}

export async function fetchPublishedPublicNews(
  options?: { categorySlug?: string; limit?: number },
  client?: SupabaseClient
): Promise<NewsItem[]> {
  const supabase = getClient(client);

  try {
    // 1. Fetch live news items from public.news_items
    let newsQuery = supabase
      .from('news_items')
      .select('*')
      .in('status', ['published', 'collected'])
      .order('published_at', { ascending: false });

    if (options?.categorySlug && options.categorySlug !== 'all') {
      newsQuery = newsQuery.or(`category_slug.eq.${options.categorySlug},category.eq.${options.categorySlug}`);
    }

    if (options?.limit) {
      newsQuery = newsQuery.limit(options.limit);
    }

    const { data: newsItems, error: newsErr } = await newsQuery;
    if (newsErr) {
      console.warn('Warning querying news_items:', newsErr.message);
    }

    // 2. Fetch published articles from public.articles with correct relation syntax
    let articlesQuery = supabase
      .from('articles')
      .select('*, category:category_id ( id, name, name_en, slug )')
      .eq('status', 'published')
      .order('published_at', { ascending: false });

    if (options?.limit) {
      articlesQuery = articlesQuery.limit(options.limit);
    }

    const { data: articles, error: artErr } = await articlesQuery;
    if (artErr) {
      console.warn('Warning querying articles in fetchPublishedPublicNews:', artErr.message);
    }

    const mappedArticles: NewsItem[] = (articles || [])
      .filter((a) => {
        if (!options?.categorySlug || options.categorySlug === 'all') return true;
        return a.category?.slug === options.categorySlug;
      })
      .map((a) => ({
        id: a.id,
        source: 'சட்டவிளக்கு தலையங்கம்',
        sourceUrl: `/articles/${a.slug}`,
        headline: a.title,
        originalHeadline: a.title,
        originalContent: a.content,
        summary: a.excerpt || (a.content ? a.content.slice(0, 200) : ''),
        content: a.content,
        category: a.category?.slug || 'law',
        category_slug: a.category?.slug || 'law',
        categoryNameTamil: a.category?.name || 'சட்டம்',
        publishedAt: a.published_at || a.created_at || new Date().toISOString(),
        published_at: a.published_at || a.created_at || new Date().toISOString(),
        imageUrl: a.hero_image_url || a.image_url || undefined,
        relevanceScore: 95,
        relevance_score: 95,
        status: 'published',
        tags: Array.isArray(a.tags) ? a.tags : [],
      }));

    const mappedNewsItems: NewsItem[] = (newsItems || []).map(mapNewsItemRow);

    // Merge both, sorted newest published first
    const combined = [...mappedNewsItems, ...mappedArticles].sort((a, b) => {
      const dateA = new Date(a.published_at || a.publishedAt || 0).getTime();
      const dateB = new Date(b.published_at || b.publishedAt || 0).getTime();
      return dateB - dateA;
    });

    if (combined.length > 0) {
      return options?.limit && options.limit > 0 ? combined.slice(0, options.limit) : combined;
    }

    return [];
  } catch (err: any) {
    console.error('Error fetching published public news:', err);
    return [];
  }
}

export async function fetchRelatedContentForArticle(
  options: {
    articleId: string;
    categoryId?: string | null;
    categorySlug?: string;
    tags?: string[];
    limit?: number;
  },
  client?: SupabaseClient
): Promise<{ relatedArticles: Article[]; relatedNews: NewsItem[] }> {
  const maxLimit = options.limit || 3;

  try {
    // 1. Fetch matching published articles by category
    const articles = await fetchArticles(
      {
        categoryId: options.categoryId || undefined,
        status: 'published',
        limit: maxLimit * 2,
      },
      client
    ).catch(() => []);

    const filteredArticles = articles.filter((a) => a.id !== options.articleId);

    // Prioritize articles that share tags
    const scoredArticles = filteredArticles.sort((a, b) => {
      const aOverlap = (a.tags || []).filter((t: string) => (options.tags || []).includes(t)).length;
      const bOverlap = (b.tags || []).filter((t: string) => (options.tags || []).includes(t)).length;
      return bOverlap - aOverlap;
    });

    const relatedArticles = scoredArticles.slice(0, maxLimit);

    // 2. Fetch matching news items
    const relatedNews = await fetchPublishedPublicNews(
      { categorySlug: options.categorySlug || 'all', limit: maxLimit },
      client
    ).catch(() => []);

    const filteredNews = relatedNews
      .filter((n) => n.id !== options.articleId && n.sourceUrl !== `/articles/${options.articleId}`)
      .slice(0, maxLimit);

    return {
      relatedArticles,
      relatedNews: filteredNews,
    };
  } catch (err) {
    console.error('Error fetching related content:', err);
    return {
      relatedArticles: [],
      relatedNews: [],
    };
  }
}

export async function fetchTopArticlesByViews(
  limit: number = 5,
  client?: SupabaseClient
): Promise<Article[]> {
  try {
    const articles = await fetchArticles(
      {
        status: 'published',
        limit: limit * 2,
      },
      client
    ).catch(() => []);

    return articles
      .sort((a, b) => (b.views || 0) - (a.views || 0))
      .slice(0, limit);
  } catch (err) {
    console.error('Error fetching top articles by views:', err);
    return [];
  }
}


