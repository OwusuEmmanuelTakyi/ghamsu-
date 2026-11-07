-- =============================================================================
-- 0002_rls.sql
-- Row-level security, table privileges and the media bucket.
--
-- The browser only ever holds the anon key, so these policies are the entire
-- security model. Hiding a button in /admin protects nothing.
--
--   anon, or signed in with no role   read published content and public settings
--   editor                            read and write content
--   admin                             editor rights, plus profiles, site_settings,
--                                     social_links and subscribers
--
-- (select private.is_staff()) is wrapped in a subquery so Postgres evaluates it
-- once per statement instead of once per row.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Privileges. Supabase's default privileges grant ALL on new tables to anon and
-- authenticated, so start from nothing and grant only what is needed.
-- -----------------------------------------------------------------------------

revoke all on all tables in schema public from public, anon, authenticated;
grant all on all tables in schema public to service_role;

-- -----------------------------------------------------------------------------
-- Tables with a status column: public reads published, staff do everything
-- -----------------------------------------------------------------------------

do $$
declare
  t text;
begin
  foreach t in array array[
    'authors', 'posts', 'events', 'sermons', 'galleries', 'executives',
    'testimonials', 'departments', 'scripture_quotes', 'ghamsu_today',
    'boards', 'major_activities', 'hero_slides', 'page_heroes', 'stats',
    'content_sections'
  ]
  loop
    execute format('alter table public.%I enable row level security', t);
    execute format('grant select on public.%I to anon, authenticated', t);

    execute format(
      'create policy %I on public.%I for select to anon, authenticated
         using (status = ''published''::public.content_status)',
      t || '_public_read', t);

    execute format(
      'create policy %I on public.%I for all to authenticated
         using ((select private.is_staff()))
         with check ((select private.is_staff()))',
      t || '_staff_all', t);

    -- posts gets narrower write grants below.
    if t <> 'posts' then
      execute format('grant insert, update, delete on public.%I to authenticated', t);
    end if;
  end loop;
end;
$$;

-- Staff cannot set counters directly. The only way to change them is the
-- increment functions, or the service role during the Phase 2 import.
-- Consequence for Phase 4: the dashboard must not include view_count or
-- like_count in its insert or update payloads.
grant delete on public.posts to authenticated;

grant insert (
  post_type, status, title, slug, excerpt, content,
  author_id, author_name, author_detail, category,
  cover_image_path, cover_image_alt, cover_image_caption, cover_image_focus,
  read_time_minutes, featured, published_at
) on public.posts to authenticated;

grant update (
  post_type, status, title, slug, excerpt, content,
  author_id, author_name, author_detail, category,
  cover_image_path, cover_image_alt, cover_image_caption, cover_image_focus,
  read_time_minutes, featured, published_at
) on public.posts to authenticated;

-- -----------------------------------------------------------------------------
-- Child tables: visible only when the parent is published
-- -----------------------------------------------------------------------------

alter table public.post_media_attachments enable row level security;
grant select on public.post_media_attachments to anon, authenticated;
grant insert, update, delete on public.post_media_attachments to authenticated;

create policy post_media_attachments_public_read on public.post_media_attachments
  for select to anon, authenticated
  using (exists (
    select 1 from public.posts p
    where p.id = post_id and p.status = 'published'::public.content_status
  ));

create policy post_media_attachments_staff_all on public.post_media_attachments
  for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

alter table public.ghamsu_today_items enable row level security;
grant select on public.ghamsu_today_items to anon, authenticated;
grant insert, update, delete on public.ghamsu_today_items to authenticated;

create policy ghamsu_today_items_public_read on public.ghamsu_today_items
  for select to anon, authenticated
  using (exists (
    select 1 from public.ghamsu_today g
    where g.id = ghamsu_today_id and g.status = 'published'::public.content_status
  ));

create policy ghamsu_today_items_staff_all on public.ghamsu_today_items
  for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

alter table public.board_members enable row level security;
grant select on public.board_members to anon, authenticated;
grant insert, update, delete on public.board_members to authenticated;

create policy board_members_public_read on public.board_members
  for select to anon, authenticated
  using (exists (
    select 1 from public.boards b
    where b.id = board_id and b.status = 'published'::public.content_status
  ));

create policy board_members_staff_all on public.board_members
  for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

alter table public.content_items enable row level security;
grant select on public.content_items to anon, authenticated;
grant insert, update, delete on public.content_items to authenticated;

create policy content_items_public_read on public.content_items
  for select to anon, authenticated
  using (exists (
    select 1 from public.content_sections s
    where s.id = section_id and s.status = 'published'::public.content_status
  ));

create policy content_items_staff_all on public.content_items
  for all to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

-- -----------------------------------------------------------------------------
-- Site settings: admins manage, the public reads rows flagged public
-- -----------------------------------------------------------------------------

alter table public.site_settings enable row level security;
grant select on public.site_settings to anon, authenticated;
grant insert, update, delete on public.site_settings to authenticated;

create policy site_settings_public_read on public.site_settings
  for select to anon, authenticated
  using (is_public);

create policy site_settings_admin_all on public.site_settings
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

alter table public.social_links enable row level security;
grant select on public.social_links to anon, authenticated;
grant insert, update, delete on public.social_links to authenticated;

create policy social_links_public_read on public.social_links
  for select to anon, authenticated
  using (status = 'published'::public.content_status);

create policy social_links_admin_all on public.social_links
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Subscribers: private personal data, admin only, no anonymous access at all.
-- A future subscribe form needs its own insert path (see MIGRATION_PLAN.md).
-- -----------------------------------------------------------------------------

alter table public.subscribers enable row level security;
grant select, insert, update, delete on public.subscribers to authenticated;

create policy subscribers_admin_all on public.subscribers
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Profiles: read your own row, admins read all and change role or status.
-- There is deliberately no self-update policy: RLS works per row, not per
-- column, so one would let any user set their own role. Rows are created and
-- removed only by the auth.users triggers, so anon, insert and delete get nothing.
-- Removing an account entirely needs the service role (see MIGRATION_PLAN.md).
-- -----------------------------------------------------------------------------

alter table public.profiles enable row level security;
grant select on public.profiles to authenticated;
grant update (full_name, role, is_active) on public.profiles to authenticated;

create policy profiles_read_own on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy profiles_admin_read_all on public.profiles
  for select to authenticated
  using ((select private.is_admin()));

create policy profiles_admin_update on public.profiles
  for update to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Storage: public-read 'media' bucket, staff-only writes
-- -----------------------------------------------------------------------------

-- 25 MB fits the largest Sanity original (20.6 MB). SVG is excluded on purpose:
-- an SVG served from a public URL can carry script.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  26214400,
  array['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- No SELECT policy for anon, deliberately. Public bucket URLs work without one,
-- and leaving it out stops visitors from listing every file, including images
-- attached to unpublished drafts. Anyone holding an exact URL can still fetch a
-- file, so nothing in this bucket is truly private.
-- Staff need SELECT because listing and upsert require it.
drop policy if exists media_staff_read   on storage.objects;
drop policy if exists media_staff_insert on storage.objects;
drop policy if exists media_staff_update on storage.objects;
drop policy if exists media_staff_delete on storage.objects;

create policy media_staff_read on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and (select private.is_staff()));

create policy media_staff_insert on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (select private.is_staff()));

create policy media_staff_update on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (select private.is_staff()))
  with check (bucket_id = 'media' and (select private.is_staff()));

create policy media_staff_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (select private.is_staff()));

-- -----------------------------------------------------------------------------
-- Safety check: fail the whole migration if any table was missed
-- -----------------------------------------------------------------------------

do $$
declare
  missing text;
begin
  select string_agg(c.relname, ', ') into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and not c.relrowsecurity;

  if missing is not null then
    raise exception 'RLS is not enabled on: %', missing;
  end if;

  select string_agg(c.relname, ', ') into missing
  from pg_class c
  join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind in ('r', 'p')
    and not exists (
      select 1 from pg_policy p where p.polrelid = c.oid
    );

  if missing is not null then
    raise exception 'No RLS policies on: %', missing;
  end if;
end;
$$;

commit;
