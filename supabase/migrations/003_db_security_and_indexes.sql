-- 1. கூடுதல் செயல்திறன் குறியீடுகள் (Performance Indexes)
create index if not exists idx_content_issue_position on public.issue_content(issue_id, "position");
create index if not exists idx_payments_user on public.payments(user_id);
create index if not exists idx_bookmarks_user on public.bookmarks(user_id);

-- 2. கூடுதல் பயனர் RLS கொள்கைகள் (Additional RLS Policies for Security)
create policy "Users can update own record" 
on public.users for update 
using (auth.uid() = id)
with check (auth.uid() = id);

-- 3. சேமிப்பக கொள்கைகள் (Supabase Storage Security Policies)
-- Note: Storage policies are applied to storage.objects.
-- This ensures public assets (like cover images) are readable, and write access is restricted.

-- Magazine Assets (Public Cover Images)
create policy "Anyone can view magazine assets"
on storage.objects for select
using (bucket_id = 'magazine-assets');

create policy "Admins can manage magazine assets"
on storage.objects for all
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('editor', 'admin')
  )
);

-- Premium PDFs (Private Subscriber Downloads)
create policy "Admins can manage premium PDFs"
on storage.objects for all
using (
  exists (
    select 1 from public.users
    where id = auth.uid()
    and role in ('editor', 'admin')
  )
);
