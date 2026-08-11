-- ART by Hannaah — Supabase schema
-- Run this once in your project's SQL Editor (Supabase Dashboard → SQL Editor → New query).
-- Safe to re-run: everything is IF NOT EXISTS / CREATE OR REPLACE.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table if not exists public.artworks (
  id           uuid primary key default gen_random_uuid(),
  title        text not null,
  category     text not null,
  price        numeric not null default 0,
  description  text,
  images       jsonb not null default '[]'::jsonb,  -- [{ "url": "...", "path": "..." }, ...]
  cover_image  text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

create table if not exists public.testimonials (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  rating      int not null default 5,
  text        text not null,
  date_label  text,
  created_at  timestamptz not null default now()
);

create table if not exists public.contact_messages (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,
  email         text not null,
  subject       text,
  message       text,
  status        text not null default 'unread',
  submitted_at  timestamptz not null default now()
);

create table if not exists public.custom_requests (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text,
  phone         text,
  size          text,
  style         text,
  budget        text,
  description   text,
  deadline      text,
  status        text not null default 'pending',
  submitted_at  timestamptz not null default now()
);

create table if not exists public.inquiries (
  id          uuid primary key default gen_random_uuid(),
  name        text,
  email       text,
  phone       text,
  message     text,
  items       jsonb not null default '[]'::jsonb,   -- [{ "id": "...", "title": "..." }, ...]
  status      text not null default 'new',
  created_at  timestamptz not null default now()
);

-- keep updated_at fresh on artworks
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists artworks_set_updated_at on public.artworks;
create trigger artworks_set_updated_at
  before update on public.artworks
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------
-- Admin check
-- Add more addresses to this array if you want additional admin logins.
-- Keep this in sync with ADMIN_EMAILS in src/supabaseClient.js.
-- ---------------------------------------------------------------------

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '') = any (array['artbyhannah29@gmail.com']);
$$;

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.artworks         enable row level security;
alter table public.testimonials     enable row level security;
alter table public.contact_messages enable row level security;
alter table public.custom_requests  enable row level security;
alter table public.inquiries        enable row level security;

-- Artworks: public read, admin-only write
drop policy if exists "artworks_public_read" on public.artworks;
create policy "artworks_public_read" on public.artworks
  for select using (true);

drop policy if exists "artworks_admin_write" on public.artworks;
create policy "artworks_admin_write" on public.artworks
  for all using (public.is_admin()) with check (public.is_admin());

-- Testimonials: public read, admin-only write
drop policy if exists "testimonials_public_read" on public.testimonials;
create policy "testimonials_public_read" on public.testimonials
  for select using (true);

drop policy if exists "testimonials_admin_write" on public.testimonials;
create policy "testimonials_admin_write" on public.testimonials
  for all using (public.is_admin()) with check (public.is_admin());

-- Contact messages: anyone can submit (insert), only admin can read/update/delete
drop policy if exists "contact_public_insert" on public.contact_messages;
create policy "contact_public_insert" on public.contact_messages
  for insert with check (true);

drop policy if exists "contact_admin_manage" on public.contact_messages;
create policy "contact_admin_manage" on public.contact_messages
  for select using (public.is_admin());

drop policy if exists "contact_admin_update" on public.contact_messages;
create policy "contact_admin_update" on public.contact_messages
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "contact_admin_delete" on public.contact_messages;
create policy "contact_admin_delete" on public.contact_messages
  for delete using (public.is_admin());

-- Custom requests: anyone can submit (insert), only admin can read/update/delete
drop policy if exists "custom_public_insert" on public.custom_requests;
create policy "custom_public_insert" on public.custom_requests
  for insert with check (true);

drop policy if exists "custom_admin_select" on public.custom_requests;
create policy "custom_admin_select" on public.custom_requests
  for select using (public.is_admin());

drop policy if exists "custom_admin_update" on public.custom_requests;
create policy "custom_admin_update" on public.custom_requests
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "custom_admin_delete" on public.custom_requests;
create policy "custom_admin_delete" on public.custom_requests
  for delete using (public.is_admin());

-- Inquiries: anyone can submit (insert), only admin can read/update/delete
drop policy if exists "inquiries_public_insert" on public.inquiries;
create policy "inquiries_public_insert" on public.inquiries
  for insert with check (true);

drop policy if exists "inquiries_admin_select" on public.inquiries;
create policy "inquiries_admin_select" on public.inquiries
  for select using (public.is_admin());

drop policy if exists "inquiries_admin_update" on public.inquiries;
create policy "inquiries_admin_update" on public.inquiries
  for update using (public.is_admin()) with check (public.is_admin());

drop policy if exists "inquiries_admin_delete" on public.inquiries;
create policy "inquiries_admin_delete" on public.inquiries
  for delete using (public.is_admin());

-- ---------------------------------------------------------------------
-- Realtime (so Admin.jsx's live inbox counts / lists keep working)
-- ---------------------------------------------------------------------
alter publication supabase_realtime add table public.artworks;
alter publication supabase_realtime add table public.testimonials;
alter publication supabase_realtime add table public.contact_messages;
alter publication supabase_realtime add table public.custom_requests;
alter publication supabase_realtime add table public.inquiries;
