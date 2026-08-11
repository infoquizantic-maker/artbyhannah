-- ART by Hannaah — require MFA (aal2) for admin writes
--
-- ⚠️ DO NOT RUN THIS until you have enrolled TOTP MFA on the admin
-- account (Dashboard → Authentication → MFA, or in-app via
-- supabase.auth.mfa.enroll()) AND confirmed you can log in and reach
-- aal2. Running this before that will lock the admin account out of
-- every write (insert/update/delete) on every table, since is_admin()
-- will always return false without a completed second factor.
--
-- Once MFA is enrolled and verified working, run this in
-- Dashboard → SQL Editor to make the database itself refuse admin
-- writes unless the session actually completed MFA — not just the
-- login form.

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (array['artbyhannah29@gmail.com'])
     and coalesce((auth.jwt() -> 'aal')::text, '""') = '"aal2"';
$$;
