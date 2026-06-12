-- PDF டிராக்கிங் மற்றும் மெட்டாடேட்டா (PDF Tracking and Metadata)

-- 1. இதழ்கள் அட்டவணையில் PDF விவரங்களைச் சேர்க்கவும்
alter table public.issues 
add column if not exists pdf_url text,
add column if not exists pdf_generated_at timestamptz;

-- 2. PDF பதிவிறக்கங்கள் அட்டவணை (PDF Downloads Table)
create table if not exists public.pdf_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  issue_id uuid not null references public.issues(id) on delete cascade,
  downloaded_at timestamptz not null default now()
);

-- 3. குறியீடுகள் (Indexes)
create index if not exists idx_pdf_downloads_issue on public.pdf_downloads(issue_id);
create index if not exists idx_pdf_downloads_user on public.pdf_downloads(user_id);

-- 4. வரிசை நிலை பாதுகாப்பு (RLS Policies)
alter table public.pdf_downloads enable row level security;

create policy "Users can view their own downloads" 
on public.pdf_downloads for select 
using (auth.uid() = user_id);

create policy "Admins can view all downloads" 
on public.pdf_downloads for select 
using (public.get_user_role(auth.uid()) = 'admin');

create policy "Users can insert their own downloads" 
on public.pdf_downloads for insert 
with check (auth.uid() = user_id);
