-- 1. தரவு வகைகள் (Custom Enums)
create type user_role as enum ('reader', 'subscriber', 'editor', 'admin');
create type subscription_status as enum ('active', 'cancelled', 'expired', 'trialing');
create type payment_status as enum ('pending', 'captured', 'failed', 'refunded');
create type issue_status as enum ('draft', 'published', 'archived');
create type content_type as enum ('article', 'poem', 'editorial', 'story', 'interview');

-- 2. அட்டவணைகள் (Tables)

-- பயனர்கள் (Users)
create table public.users (
  id uuid primary key references auth.users on delete cascade,
  email text not null,
  display_name text,
  avatar_url text,
  role user_role not null default 'reader',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- இதழ்கள் (Issues)
create table public.issues (
  id uuid primary key default gen_random_uuid(),
  title text not null, -- தமிழ் தலைப்பு
  slug text not null unique,
  volume_number int not null,
  issue_number int not null,
  cover_image_url text,
  description text, -- தமிழ் விளக்கம்
  published_at timestamptz,
  status issue_status not null default 'draft',
  is_free boolean not null default false,
  created_by uuid references public.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- இதழ் உள்ளடக்கம் (Issue Content)
create table public.issue_content (
  id uuid primary key default gen_random_uuid(),
  issue_id uuid not null references public.issues(id) on delete cascade,
  title text not null, -- தமிழ் தலைப்பு
  body jsonb not null, -- Tiptap JSON
  content_type content_type not null default 'article',
  author_name text, -- தமிழ் பெயர்
  position int not null default 0,
  is_preview boolean not null default false,
  word_count int,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- சந்தாக்கள் (Subscriptions)
create table public.subscriptions (
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
create table public.payments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  subscription_id uuid references public.subscriptions(id) on delete set null,
  razorpay_order_id text,
  razorpay_payment_id text,
  razorpay_signature text,
  amount int not null, -- பைசாக்களில் (Paise)
  currency text not null default 'INR',
  status payment_status not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

-- புத்தகக்குறிகள் (Bookmarks)
create table public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  issue_content_id uuid not null references public.issue_content(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(user_id, issue_content_id)
);

-- 3. குறியீடுகள் (Indexes)
create index idx_issues_slug on public.issues(slug);
create index idx_issues_status_published on public.issues(status, published_at);
create index idx_content_issue_preview on public.issue_content(issue_id, is_preview);
create index idx_subs_user_status on public.subscriptions(user_id, status, current_period_end);

-- தமிழ் தேடல் குறியீடு (Tamil Full-text search index)
create extension if not exists pg_trgm;
create index idx_content_search_tamil on public.issue_content using gin (title gin_trgm_ops);

-- 4. செயல்பாடுகள் (Functions)

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

-- புதிய பயனர் உருவாக்கும் போது தானாகச் சேர்க்கவும்
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'display_name', 
    new.raw_user_meta_data->>'avatar_url',
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'reader'::user_role)
  );
  return new;
end;
$$ language plpgsql security definer;

-- 5. தூண்டுதல்கள் (Triggers)

-- Auth User -> Public User
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated At
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger tr_users_updated_at before update on public.users for each row execute procedure update_updated_at_column();
create trigger tr_issues_updated_at before update on public.issues for each row execute procedure update_updated_at_column();
create trigger tr_content_updated_at before update on public.issue_content for each row execute procedure update_updated_at_column();
create trigger tr_subs_updated_at before update on public.subscriptions for each row execute procedure update_updated_at_column();

-- 6. வரிசை நிலை பாதுகாப்பு (RLS Policies)

-- RLS-ஐ இயக்கவும்
alter table public.users enable row level security;
alter table public.issues enable row level security;
alter table public.issue_content enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payments enable row level security;
alter table public.bookmarks enable row level security;

-- Users Policies
create policy "Users can read own record" on public.users for select using (auth.uid() = id);
create policy "Admins can read all users" on public.users for select using (get_user_role(auth.uid()) = 'admin');

-- Issues Policies
create policy "Anyone can read published issues" on public.issues 
  for select using (status = 'published');
create policy "Editors/Admins can manage issues" on public.issues 
  for all using (get_user_role(auth.uid()) in ('editor', 'admin'));

-- Issue Content Policies
create policy "Anyone can read previews or free issue content" on public.issue_content
  for select using (
    is_preview = true 
    or exists (select 1 from public.issues where id = issue_id and is_free = true)
  );

create policy "Subscribers can read all content" on public.issue_content
  for select using (is_subscribed(auth.uid()));

create policy "Editors/Admins can read/manage all content" on public.issue_content
  for all using (get_user_role(auth.uid()) in ('editor', 'admin'));

-- Subscriptions Policies
create policy "Users can read own subscription" on public.subscriptions for select using (auth.uid() = user_id);
create policy "Admins can manage all subscriptions" on public.subscriptions for all using (get_user_role(auth.uid()) = 'admin');

-- Payments Policies
create policy "Users can read own payments" on public.payments for select using (auth.uid() = user_id);
create policy "Admins can read all payments" on public.payments for select using (get_user_role(auth.uid()) = 'admin');

-- Bookmarks Policies
create policy "Users can manage own bookmarks" on public.bookmarks for all using (auth.uid() = user_id);
