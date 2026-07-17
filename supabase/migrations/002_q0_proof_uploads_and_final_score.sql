alter table public.submissions
  add column if not exists q0_file_url text;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'proofs',
  'proofs',
  true,
  10485760,
  array['image/png', 'image/jpeg', 'application/pdf']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Public can upload proofs" on storage.objects;
create policy "Public can upload proofs"
  on storage.objects
  for insert
  to anon
  with check (bucket_id = 'proofs');

drop policy if exists "Public can read proofs" on storage.objects;
create policy "Public can read proofs"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'proofs');
