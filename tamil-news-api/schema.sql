-- ==========================================
-- Tamil News Aggregation System (news_items Table)
-- Supabase PostgreSQL Schema
-- ==========================================

-- 1. Create the primary news_items table
create table if not exists public.news_items (
    id uuid primary key default gen_random_uuid(),

    title text not null,
    url text not null unique,

    source text,
    category text,

    published_at timestamptz,
    fetched_at timestamptz default now(),

    language text default 'ta',

    image_url text,
    summary text,

    created_at timestamptz default now()
);

-- 2. Performance Indexes for filtering, sorting and deduplication
create index if not exists idx_news_items_url on public.news_items (url);
create index if not exists idx_news_items_category on public.news_items (category);
create index if not exists idx_news_items_published_at on public.news_items (published_at desc);
create index if not exists idx_news_items_fetched_at on public.news_items (fetched_at desc);

-- 3. Row Level Security (RLS) configuration
alter table public.news_items enable row level security;

-- Allow public read access to all news
create policy "Allow public read access to news_items"
    on public.news_items
    for select
    using (true);

-- Allow authenticated/service role to insert and update
create policy "Allow service role full access to news_items"
    on public.news_items
    for all
    using (true)
    with check (true);

-- ==========================================
-- Optional: If extending an existing CMS news_items table
-- ==========================================
-- alter table public.news_items add column if not exists title text;
-- alter table public.news_items add column if not exists url text;
-- alter table public.news_items add column if not exists source text;
-- alter table public.news_items add column if not exists summary text;
-- alter table public.news_items add column if not exists image_url text;
-- alter table public.news_items add column if not exists language text default 'ta';
-- alter table public.news_items add column if not exists fetched_at timestamptz default now();
