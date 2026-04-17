-- Replace the email below with the real administrator account email.
-- Run after the user has already signed up and a row exists in public.profiles.

update public.profiles
set is_admin = true
where email = 'admin@example.com';

-- Optional verification:
select id, email, name, is_admin
from public.profiles
where email = 'admin@example.com';

-- Optional revoke example:
-- update public.profiles
-- set is_admin = false
-- where email = 'admin@example.com';
