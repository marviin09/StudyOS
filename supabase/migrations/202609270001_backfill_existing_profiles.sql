-- Accounts created before the StudyOS tables need their own profile row.
insert into public.profiles (id,display_name)
select id,coalesce(nullif(btrim(raw_user_meta_data->>'full_name'),''),'Student')
from auth.users
on conflict (id) do nothing;
