-- Update handle_new_user to correctly parse metadata from Google OAuth (full_name, name) as fallback for display_name
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
      when new.email in ('sattavilakku@gmail.com', 'sattavillaku@gmail.com') then 'admin'::public.user_role
      else 'reader'::public.user_role
    end
  );
  return new;
end;
$$ language plpgsql security definer;
