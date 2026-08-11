-- ART by Hannaah — Supabase Storage setup
-- Run AFTER creating the "artworks" bucket in the dashboard
-- (Storage → New bucket → name: artworks → Public bucket: ON).
-- Doing it in the dashboard lets you set the file-size limit and allowed
-- MIME types in the UI; the policies below are what actually gate uploads.

-- Public read for anyone (the gallery is public)
drop policy if exists "artworks_bucket_public_read" on storage.objects;
create policy "artworks_bucket_public_read" on storage.objects
  for select
  using (bucket_id = 'artworks');

-- Only the admin can upload
drop policy if exists "artworks_bucket_admin_insert" on storage.objects;
create policy "artworks_bucket_admin_insert" on storage.objects
  for insert
  with check (bucket_id = 'artworks' and public.is_admin());

-- Only the admin can overwrite/rename
drop policy if exists "artworks_bucket_admin_update" on storage.objects;
create policy "artworks_bucket_admin_update" on storage.objects
  for update
  using (bucket_id = 'artworks' and public.is_admin())
  with check (bucket_id = 'artworks' and public.is_admin());

-- Only the admin can delete
drop policy if exists "artworks_bucket_admin_delete" on storage.objects;
create policy "artworks_bucket_admin_delete" on storage.objects
  for delete
  using (bucket_id = 'artworks' and public.is_admin());
