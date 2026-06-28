-- ========================================================================
-- SATTAVILAKKU MAGAZINE - COMPLETE CONSOLIDATED DATABASE SCHEMA & SECURITY
-- ========================================================================
-- Copy and run this entire script in your Supabase SQL Editor.

-- 1. தரவு வகைகள் (Custom Enums)
do $$ 
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type user_role as enum ('reader', 'subscriber', 'editor', 'admin');
  end if;
  if not exists (select 1 from pg_type where typname = 'subscription_status') then
    create type subscription_status as enum ('active', 'cancelled', 'expired', 'trialing');
  end if;
  if not exists (select 1 from pg_type where typname = 'payment_status') then
    create type payment_status as enum ('pending', 'captured', 'failed', 'refunded');
  end if;
  if not exists (select 1 from pg_type where typname = 'issue_status') then
    create type issue_status as enum ('draft', 'published', 'archived');
  end if;
  if not exists (select 1 from pg_type where typname = 'content_type') then
    create type content_type as enum ('article', 'poem', 'editorial', 'story', 'interview');
  end if;
end $$;

-- 2. அட்டவணைகள் (Tables)

-- பயனர்கள் (Users)
create table if not exists public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- இதழ்கள் (Issues)
create table if not exists public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  volume_number int not null,
  issue_number int not null,
  cover_image_url text,
  description text,
  published_at timestamptz,
  status issue_status not null default 'draft',
  is_free boolean not null default false,
  pdf_url text,
  pdf_generated_at timestamptz,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- இதழ் உள்ளடக்கம் (Issue Content)
create table if not exists public.issue_content (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  title text not null,
  body jsonb not null,
  content_type content_type not null default 'article',
  author_name text,
  position int not null default 0,
  is_preview boolean not null default false,
  word_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- சந்தாக்கள் (Subscriptions)
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade unique,
  status subscription_status not null,
  plan_type text not null check (plan_type in ('monthly', 'annual')),
  razorpay_subscription_id text,
  razorpay_customer_id text,
  current_period_start timestamptz not null,
  current_period_end timestamptz not null,
  cancel_at_period_end boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- கொடுப்பனவுகள் (Payments)
create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount int not null,
  currency text not null default 'INR',
  status payment_status not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- புத்தகக்குறிகள் (Bookmarks)
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  issue_content_id uuid not null references public.issue_content(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, issue_content_id)
);

-- PDF பதிவிறக்கங்கள் அட்டவணை (PDF Downloads)
create table if not exists public.pdf_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  issue_id uuid not null references public.issues(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

-- 3. குறியீடுகள் (Indexes)
create index if not exists idx_issues_slug on public.issues(slug);
create index if not exists idx_issues_status_published on public.issues(status, published_at);
create index if not exists idx_content_issue_preview on public.issue_content(issue_id, is_preview);
create index if not exists idx_subs_user_status on public.subscriptions(user_id, status, current_period_end);
create index if not exists idx_content_issue_position on public.issue_content(issue_id, "position");
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);
create index if not exists idx_pdf_downloads_issue on public.pdf_downloads(issue_id);
create index if not exists idx_pdf_downloads_user on public.pdf_downloads(user_id);
create index if not exists idx_issues_created_by on public.issues(created_by);
create index if not exists idx_issues_volume_issue on public.issues(volume_number, issue_number);
create index if not exists idx_subscriptions_razorpay_sub on public.subscriptions(razorpay_subscription_id);
create index if not exists idx_subscriptions_razorpay_cust on public.subscriptions(razorpay_customer_id);
create index if not exists idx_payments_razorpay_order on public.payments(razorpay_order_id);
create index if not exists idx_payments_razorpay_payment on public.payments(razorpay_payment_id);
create index if not exists idx_payments_subscription_id on public.payments(subscription_id);
create index if not exists idx_bookmarks_issue_content_id on public.bookmarks(issue_content_id);
create index if not exists idx_issue_content_author on public.issue_content(author_name);
create index if not exists idx_issue_content_type on public.issue_content(content_type);

-- தமிழ் தேடல் குறியீடு (Tamil Full-text search index)
create extension if not exists pg_trgm;
create index if not exists idx_content_search_tamil on public.issue_content using gin (title gin_trgm_ops);

-- 4. பாதுகாப்பு மற்றும் உதவி செயல்பாடுகள் (Functions & Security Definers)

-- சந்தா உள்ளதா என சரிபார்க்கவும்
create or replace function public.is_subscribed(u_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.subscriptions
    where user_id = u_id 
    and status = 'active' 
    and current_period_end > now()
  );
end;
$$ language plpgsql security definer;

-- பயனர் பங்கினைப் பெறவும்
create or replace function public.get_user_role(u_id uuid)
returns user_role as $$
begin
  return (select role from public.users where id = u_id);
end;
$$ language plpgsql security definer;

-- புதிய பயனர் உருவாக்கும் போது தானாகச் சேர்க்கவும் மற்றும் sattavilakku@gmail.com ஐ நிர்வாகியாக்கவும்
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url, role)
  values (
    new.id, 
    new.email, 
    coalesce(
      new.raw_user_meta_data->>'display_name', 
      new.raw_user_meta_data->>'full_name',
      new.raw_user_meta_data->>'name',
      split_part(new.email, '@', 1)
    ), 
    new.raw_user_meta_data->>'avatar_url',
    case 
      when new.email = 'sattavilakku@gmail.com' then 'admin'::user_role
      else 'reader'::user_role
    end
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. தூண்டுதல்கள் (Triggers)

-- Auth User -> Public User Trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated At Trigger helper
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists tr_users_updated_at on public.users;
create trigger tr_users_updated_at before update on public.users for each row execute procedure update_updated_at_column();

drop trigger if exists tr_issues_updated_at on public.issues;
create trigger tr_issues_updated_at before update on public.issues for each row execute procedure update_updated_at_column();

drop trigger if exists tr_content_updated_at on public.issue_content;
create trigger tr_content_updated_at before update on public.issue_content for each row execute procedure update_updated_at_column();

drop trigger if exists tr_subs_updated_at on public.subscriptions;
create trigger tr_subs_updated_at before update on public.subscriptions for each row execute procedure update_updated_at_column();

-- 6. பயனர் தற்காப்பு தூண்டுதல் (Prevent self-promotion or email spoofing)
create or replace function public.prevent_user_self_promotion()
returns trigger as $$
begin
  if NEW.role <> OLD.role then
    if (select role from public.users where id = auth.uid()) <> 'admin' then
      raise exception 'உரிமைகளை மாற்ற உங்களுக்கு அனுமதி இல்லை (You cannot change your own role)';
    end if;
  end if;

  if NEW.email <> OLD.email then
    if (select role from public.users where id = auth.uid()) <> 'admin' then
      raise exception 'மின்னஞ்சலை மாற்ற உங்களுக்கு அனுமதி இல்லை (You cannot change your registered email)';
    end if;
  end if;

  return NEW;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_prevent_user_self_promotion on public.users;
create trigger tr_prevent_user_self_promotion
  before update on public.users
  for each row execute procedure public.prevent_user_self_promotion();

-- 7. வரிசை நிலை பாதுகாப்பு (RLS Policies)
alter table public.users enable row level security;
alter table public.issues enable row level security;
alter table public.issue_content enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.bookmarks enable row level security;
alter table public.pdf_downloads enable row level security;

-- Users RLS
drop policy if exists "Users can read own record" on public.users;
create policy "Users can read own record" on public.users for select using (auth.uid() = id);

drop policy if exists "Admins can read all users" on public.users;
create policy "Admins can read all users" on public.users for select using (get_user_role(auth.uid()) = 'admin');

drop policy if exists "Users can update own record" on public.users;
create policy "Users can update own record" on public.users for update using (auth.uid() = id) with check (auth.uid() = id);

-- Issues RLS
drop policy if exists "Anyone can read published issues" on public.issues;
create policy "Anyone can read published issues" on public.issues for select using (status = 'published');

drop policy if exists "Editors/Admins can manage issues" on public.issues;
create policy "Editors/Admins can manage issues" on public.issues for all using (get_user_role(auth.uid()) in ('editor', 'admin'));

-- Issue Content RLS
drop policy if exists "Anyone can read previews or free issue content" on public.issue_content;
create policy "Anyone can read previews or free issue content" on public.issue_content
  for select using (is_preview = true or exists (select 1 from public.issues where id = issue_id and is_free = true));

drop policy if exists "Subscribers can read all content" on public.issue_content;
create policy "Subscribers can read all content" on public.issue_content for select using (is_subscribed(auth.uid()));

drop policy if exists "Editors/Admins can read/manage all content" on public.issue_content;
create policy "Editors/Admins can read/manage all content" on public.issue_content for all using (get_user_role(auth.uid()) in ('editor', 'admin'));

-- Subscriptions RLS
drop policy if exists "Users can read own subscription" on public.subscriptions;
create policy "Users can read own subscription" on public.subscriptions for select using (auth.uid() = user_id);

drop policy if exists "Admins can manage all subscriptions" on public.subscriptions;
create policy "Admins can manage all subscriptions" on public.subscriptions for all using (get_user_role(auth.uid()) = 'admin');

-- Payments RLS
drop policy if exists "Users can read own payments" on public.payments;
create policy "Users can read own payments" on public.payments for select using (auth.uid() = user_id);

drop policy if exists "Admins can read all payments" on public.payments;
create policy "Admins can read all payments" on public.payments for select using (get_user_role(auth.uid()) = 'admin');

-- Bookmarks RLS
drop policy if exists "Users can manage own bookmarks" on public.bookmarks;
create policy "Users can manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);

-- PDF Downloads RLS
drop policy if exists "Users can view their own downloads" on public.pdf_downloads;
create policy "Users can view their own downloads" on public.pdf_downloads for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all downloads" on public.pdf_downloads;
create policy "Admins can view all downloads" on public.pdf_downloads for select using (get_user_role(auth.uid()) = 'admin');

drop policy if exists "Users can insert their own downloads" on public.pdf_downloads;
create policy "Users can insert their own downloads" on public.pdf_downloads for insert with check (auth.uid() = user_id);

-- ========================================================================
-- 8. சேமிப்பக பாதுகாப்பு கொள்கைகள் (Supabase Storage Security Policies)
-- ========================================================================
-- Note: Make sure you have created two buckets in Supabase Storage:
-- 1. 'magazine-assets' (Public access enabled - for cover images)
-- 2. 'premium-pdfs' (Private access enabled - for premium issue PDFs)

-- Magazine Assets Bucket Policies
drop policy if exists "Anyone can view magazine assets" on storage.objects;
create policy "Anyone can view magazine assets"
on storage.objects for select
using (bucket_id = 'magazine-assets');

drop policy if exists "Admins can manage magazine assets" on storage.objects;
create policy "Admins can manage magazine assets"
on storage.objects for all
using (bucket_id = 'magazine-assets' and exists (
  select 1 from public.users
  where id = auth.uid()
  and role in ('editor', 'admin')
));

-- Premium PDFs Bucket Policies
drop policy if exists "Admins can manage premium PDFs" on storage.objects;
create policy "Admins can manage premium PDFs"
on storage.objects for all
using (bucket_id = 'premium-pdfs' and exists (
  select 1 from public.users
  where id = auth.uid()
  and role in ('editor', 'admin')
));


-- ========================================================================
-- 9. தற்போதைய கணக்கை நிர்வாகியாக மாற்றுதல் (Promote Existing sattavilakku@gmail.com)
-- ========================================================================

-- Force insert or update user role to 'admin' for the email
insert into public.users (id, email, display_name, role)
select id, email, raw_user_meta_data->>'display_name', 'admin'::user_role
from auth.users
where email = 'sattavilakku@gmail.com'
on conflict (id) do update set role = 'admin'::user_role;
