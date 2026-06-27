-- 1. Automatic Admin Assignment trigger update
-- Automatically assign the 'admin' role to the specified admin email address: sattavilakku@gmail.com
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, email, display_name, avatar_url, role)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'display_name', 
    new.raw_user_meta_data->>'avatar_url',
    case 
      when new.email = 'sattavilakku@gmail.com' then 'admin'::user_role
      else coalesce((new.raw_user_meta_data->>'role')::user_role, 'reader'::user_role)
    end
  );
  return new;
end;
$$ language plpgsql security definer;
