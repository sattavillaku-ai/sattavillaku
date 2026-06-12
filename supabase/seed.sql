-- மாதிரி தரவுகள் (Seed Data)

-- 1. நிர்வாகி பயனர் (Admin User)
-- Note: In a real Supabase environment, you would insert into auth.users first.
-- This is a placeholder for the public.users record.
insert into public.users (id, email, display_name, role)
values ('00000000-0000-0000-0000-000000000000', 'admin@tamilmagazine.com', 'நிர்வாகி', 'admin');

-- 2. இதழ்கள் (Issues)
insert into public.issues (id, title, slug, volume_number, issue_number, description, status, is_free, published_at)
values 
('a1111111-1111-1111-1111-111111111111', 'வைகறைத் தென்றல் - இதழ் 1', 'vaigai-thendral-1', 1, 1, 'புதிய பயணத்தின் முதல் அடி.', 'published', true, now()),
('a2222222-2222-2222-2222-222222222222', 'சங்கத் தமிழ் - இதழ் 2', 'sangam-tamil-2', 1, 2, 'சங்க இலக்கியங்களின் சிறப்புகள்.', 'published', false, now() - interval '1 month'),
('a3333333-3333-3333-3333-333333333333', 'அறிவியல் உலகம் - இதழ் 3', 'science-world-3', 1, 3, 'நவீன அறிவியலும் தமிழும்.', 'published', false, now() - interval '2 months');

-- 3. இதழ் உள்ளடக்கம் (Issue Content)
insert into public.issue_content (issue_id, title, author_name, content_type, position, is_preview, body)
values
-- Issue 1 Content
('a1111111-1111-1111-1111-111111111111', 'ஆசிரியர் உரை', 'ஆசிரியர்', 'editorial', 1, true, '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "அனைவருக்கும் வணக்கம்..."}]}]}'),
('a1111111-1111-1111-1111-111111111111', 'பாரதியார் கவிதைகள்', 'சுப்பிரமணிய பாரதியார்', 'poem', 2, true, '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "அச்சமில்லை அச்சமில்லை..."}]}]}'),

-- Issue 2 Content
('a2222222-2222-2222-2222-222222222222', 'புறநானூறு ஒரு பார்வை', 'முனைவர் க. மணி', 'article', 1, true, '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "யாதும் ஊரே யாவரும் கேளிர்..."}]}]}'),
('a2222222-2222-2222-2222-222222222222', 'சிறுவன் மற்றும் சிங்கம்', 'பாரதிதாசன்', 'story', 2, false, '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "ஒரு ஊரில் ஒரு சிறுவன் இருந்தான்..."}]}]}'),

-- Issue 3 Content
('a3333333-3333-3333-3333-333333333333', 'விண்வெளி ஆய்வு', 'இஸ்ரோ விஞ்ஞானி', 'article', 1, true, '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "நிலவில் மனிதன் தடம் பதித்த கதை..."}]}]}'),
('a3333333-3333-3333-3333-333333333333', 'நேர்காணல்: இளையராஜா', 'குழுவினர்', 'interview', 2, false, '{"type": "doc", "content": [{"type": "paragraph", "content": [{"type": "text", "text": "இசைப் பயணம் பற்றிய உரையாடல்..."}]}]}');
