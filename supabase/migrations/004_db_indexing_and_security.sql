-- 1. Foreign Key and Lookup Indexes (அட்டவணை குறியீடுகள்)
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

-- 2. Secure User Data (பயனர் தரவு பாதுகாப்பு)
-- Prevents users from manually promoting themselves (changing their role) or spoofing email addresses.
create or replace function public.prevent_user_self_promotion()
returns trigger as $$
begin
  -- If role is changing, check if updater is an admin
  if NEW.role <> OLD.role then
    if (select role from public.users where id = auth.uid()) <> 'admin' then
      raise exception 'உரிமைகளை மாற்ற உங்களுக்கு அனுமதி இல்லை (You cannot change your own role)';
    end if;
  end if;

  -- If email is changing, check if updater is an admin
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
