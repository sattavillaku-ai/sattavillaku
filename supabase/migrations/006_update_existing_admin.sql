-- Promote the existing registered account for sattavilakku@gmail.com to admin
UPDATE public.users 
SET role = 'admin'::user_role 
WHERE email = 'sattavilakku@gmail.com';
