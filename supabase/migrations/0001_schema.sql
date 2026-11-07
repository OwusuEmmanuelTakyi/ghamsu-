-- =============================================================================
-- 0001_schema.sql
-- GHAMSU: tables, enums, indexes, triggers, roles, admin bootstrap, counters.
-- RLS is enabled in 0002_rls.sql. Do not expose this schema until 0002 has run.
--
-- Conventions
--   * Image columns come in sets: <name>_path (path inside the 'media' bucket),
--     <name>_alt, <name>_caption, <name>_focus.
--   * <name>_focus is jsonb holding Sanity's image data:
--     {"hotspot": {"x","y","width","height"}, "crop": {"top","bottom","left","right"}}
--   * legacy_sanity_id holds the Sanity _id. It makes the Phase 2 import
--     re-runnable and keeps the browser's existing liked_<_id> keys working.
--   * Content defaults to 'draft'. Fields Sanity required are only enforced on
--     publish, so a half-written draft can still be saved.
-- =============================================================================

begin;

create schema if not exists private;
comment on schema private is
  'Helpers for RLS and triggers. Not exposed through the Data API.';

-- -----------------------------------------------------------------------------
-- Enums
-- -----------------------------------------------------------------------------

create type public.app_role       as enum ('admin', 'editor');
create type public.content_status as enum ('draft', 'published');
create type public.post_type      as enum ('news', 'article');
create type public.media_type     as enum ('video', 'audio');

-- -----------------------------------------------------------------------------
-- Roles
-- -----------------------------------------------------------------------------

-- role is NULL until an admin assigns one. A NULL role has no staff access, so
-- an auth user existing never grants anything by itself.
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  full_name  text,
  role       public.app_role,
  is_active  boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
comment on table public.profiles is
  'One row per auth user. Created by trigger. Only admins may change role or is_active.';

create index profiles_role_idx on public.profiles (role) where role is not null;

-- -----------------------------------------------------------------------------
-- Sanity content types
-- -----------------------------------------------------------------------------

create table public.authors (
  id               uuid primary key default gen_random_uuid(),
  legacy_sanity_id text unique,
  name             text not null,
  photo_path       text,
  photo_alt        text,
  photo_caption    text,
  photo_focus      jsonb,
  bio              text,
  position         text,
  status           public.content_status not null default 'draft',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Sanity news, article and blog share one table and one /blogs/:slug namespace.
-- Legacy blog documents become post_type 'article' with status 'draft'.
create table public.posts (
  id                  uuid primary key default gen_random_uuid(),
  legacy_sanity_id    text unique,
  legacy_sanity_type  text check (legacy_sanity_type in ('news', 'article', 'blog')),
  post_type           public.post_type not null,
  status              public.content_status not null default 'draft',
  title               text not null,
  slug                text not null unique
                        check (slug = lower(slug) and slug !~ '\s' and length(slug) between 1 and 96),
  excerpt             text,
  -- TipTap / ProseMirror document: {"type":"doc","content":[...]}
  content             jsonb
                        check (content is null or (jsonb_typeof(content) = 'object' and content ->> 'type' = 'doc')),
  author_id           uuid references public.authors (id) on delete set null,
  author_name         text,          -- Sanity reporter / authorName
  author_detail       text,          -- Sanity reporterPosition / authorLocal
  category            text,          -- Sanity newsCategory / articleCategory / category
  cover_image_path    text,
  cover_image_alt     text,
  cover_image_caption text,
  cover_image_focus   jsonb,
  read_time_minutes   integer check (read_time_minutes is null or read_time_minutes >= 0),
  featured            boolean not null default false,
  view_count          integer not null default 0 check (view_count >= 0),
  like_count          integer not null default 0 check (like_count >= 0),
  published_at        timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint posts_category_valid check (
    category is null
    or (post_type = 'news'    and category in ('announcement', 'event-coverage', 'campus-news', 'union-update'))
    or (post_type = 'article' and category in ('faith', 'leadership', 'campus-life', 'devotionals'))
  ),
  constraint posts_publish_requirements check (
    status = 'draft' or (
      published_at is not null
      and excerpt is not null
      and content is not null
      and cover_image_path is not null
      and (author_name is not null or author_id is not null)
    )
  )
);
comment on column public.posts.category is
  'The real category. Sanity queries aliased category to the literal "news" for news posts; Phase 3 handles that in the app.';

-- Sanity news.mediaAttachments[]
create table public.post_media_attachments (
  id          uuid primary key default gen_random_uuid(),
  post_id     uuid not null references public.posts (id) on delete cascade,
  media_type  public.media_type not null,
  label       text not null,
  url         text not null check (url ~* '^https?://'),
  description text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.events (
  id                uuid primary key default gen_random_uuid(),
  legacy_sanity_id  text unique,
  status            public.content_status not null default 'draft',
  title             text not null,
  event_date        timestamptz,
  venue             text,
  flyer_path        text,
  flyer_alt         text,
  flyer_caption     text,
  flyer_focus       jsonb,
  description       text,
  event_type        text check (event_type in ('conference', 'worship', 'outreach', 'fellowship', 'training', 'other')),
  registration_url  text check (registration_url is null or registration_url ~* '^https?://'),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),

  constraint events_publish_requirements check (
    status = 'draft' or (event_date is not null and venue is not null and flyer_path is not null)
  )
);

create table public.sermons (
  id                  uuid primary key default gen_random_uuid(),
  legacy_sanity_id    text unique,
  status              public.content_status not null default 'draft',
  title               text not null,
  preacher            text,
  sermon_date         timestamptz,
  media_type          public.media_type,
  video_url           text check (video_url is null or video_url ~* '^https?://'),
  audio_url           text check (audio_url is null or audio_url ~* '^https?://'),
  thumbnail_path      text,
  thumbnail_alt       text,
  thumbnail_caption   text,
  thumbnail_focus     jsonb,
  scripture_reference text,
  description         text,
  series              text,
  duration            text,          -- free text such as 45:30, as in Sanity
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint sermons_publish_requirements check (
    status = 'draft' or (
      preacher is not null
      and sermon_date is not null
      and (
        (media_type = 'video' and video_url is not null)
        or (media_type = 'audio' and audio_url is not null)
      )
    )
  )
);

-- An album card linking to an external album. It does not hold the photos.
create table public.galleries (
  id                 uuid primary key default gen_random_uuid(),
  legacy_sanity_id   text unique,
  status             public.content_status not null default 'draft',
  title              text not null,
  description        text,
  cover_image_path   text,
  cover_image_alt    text,
  cover_image_caption text,
  cover_image_focus  jsonb,
  photo_count        integer check (photo_count is null or photo_count >= 1),
  album_date         timestamptz,
  album_url          text check (album_url is null or album_url ~* '^https?://'),
  category           text check (category in ('Conference', 'Worship', 'Outreach', 'Music', 'Study', 'Events', 'Training', 'Recreation')),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint galleries_publish_requirements check (
    status = 'draft' or (
      description is not null and cover_image_path is not null and photo_count is not null
      and album_date is not null and album_url is not null and category is not null
    )
  )
);

-- Category values are kept exactly as stored in Sanity, because Contact.tsx
-- matches these strings literally.
create table public.executives (
  id               uuid primary key default gen_random_uuid(),
  legacy_sanity_id text unique,
  status           public.content_status not null default 'draft',
  name             text not null,
  position         text,
  image_path       text,
  image_alt        text,
  image_caption    text,
  image_focus      jsonb,
  phone            text,
  email            text check (email is null or email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  whatsapp         text check (whatsapp is null or whatsapp ~ '^\d+$'),
  sort_order       integer check (sort_order is null or sort_order > 0),
  category         text check (category in ('connexional', 'Connexional Boards', 'Diocese', 'local')),
  bio              text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint executives_publish_requirements check (
    status = 'draft' or (
      position is not null and image_path is not null and sort_order is not null and category is not null
    )
  )
);

create table public.testimonials (
  id               uuid primary key default gen_random_uuid(),
  legacy_sanity_id text unique,
  status           public.content_status not null default 'draft',
  name             text not null,
  photo_path       text,
  photo_alt        text,
  photo_caption    text,
  photo_focus      jsonb,
  role             text,
  local            text,
  testimony        text,
  rating           integer not null default 5 check (rating between 1 and 5),
  featured         boolean not null default false,
  testimonial_date timestamptz,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint testimonials_publish_requirements check (status = 'draft' or testimony is not null)
);

create table public.departments (
  id               uuid primary key default gen_random_uuid(),
  legacy_sanity_id text unique,
  status           public.content_status not null default 'draft',
  name             text not null,
  image_path       text,
  image_alt        text,
  image_caption    text,
  image_focus      jsonb,
  description      text,
  leader_id        uuid references public.executives (id) on delete set null,
  activities       text[] not null default '{}',
  color            text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now(),

  constraint departments_publish_requirements check (status = 'draft' or description is not null)
);

-- Sanity active == true maps to status 'published'.
create table public.scripture_quotes (
  id               uuid primary key default gen_random_uuid(),
  legacy_sanity_id text unique,
  status           public.content_status not null default 'draft',
  quote_text       text not null,
  reference        text not null,
  sort_order       integer,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- Sanity active == true maps to status 'published'. The current entry is the
-- newest published row by entry_date, matching GHAMSU_TODAY_QUERY.
create table public.ghamsu_today (
  id                  uuid primary key default gen_random_uuid(),
  legacy_sanity_id    text unique,
  status              public.content_status not null default 'draft',
  theme_title         text,
  theme_description   text,
  scripture_reference text,
  entry_date          timestamptz,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

create table public.ghamsu_today_items (
  id              uuid primary key default gen_random_uuid(),
  ghamsu_today_id uuid not null references public.ghamsu_today (id) on delete cascade,
  slot            text not null check (slot in ('happening_now', 'later_today')),
  title           text,
  time_text       text,   -- free text; only later_today items used it in Sanity
  location        text,
  sort_order      integer not null default 0,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Private personal data. Admin only (see 0002). No form writes here yet.
create table public.subscribers (
  id               uuid primary key default gen_random_uuid(),
  legacy_sanity_id text unique,
  email            text not null unique check (email = lower(email) and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  subscribed_at    timestamptz not null default now(),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Content that is currently hardcoded in React
-- -----------------------------------------------------------------------------

-- One-off settings. Only rows with is_public = true are readable by visitors.
create table public.site_settings (
  key         text primary key,
  value       jsonb not null,
  is_public   boolean not null default false,
  description text,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.social_links (
  id         uuid primary key default gen_random_uuid(),
  platform   text not null unique,
  label      text not null,
  url        text not null check (url ~* '^https?://'),
  icon       text,                -- lucide-react icon name
  sort_order integer not null default 0,
  status     public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- icon and home_icon differ because the source uses different icons per page.
-- color is a token ('red', 'blue'), not a Tailwind class: classes that exist
-- only in the database are not compiled by Tailwind.
create table public.boards (
  id                 uuid primary key default gen_random_uuid(),
  slug               text not null unique check (slug = lower(slug) and slug !~ '\s'),
  title              text not null,
  summary            text,            -- home page card (BoardsHomeSection.tsx)
  description        text,            -- /boards card (Boards.tsx)
  detail_description text,            -- /boards/:slug (BoardDetail.tsx)
  icon               text,
  home_icon          text,
  color              text,
  member_count       integer check (member_count is null or member_count >= 0),
  vision             text,
  responsibilities   text[] not null default '{}',
  activities         text[] not null default '{}',
  sort_order         integer not null default 0,
  status             public.content_status not null default 'draft',
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Empty at launch: the code holds member counts but no member names.
create table public.board_members (
  id            uuid primary key default gen_random_uuid(),
  board_id      uuid not null references public.boards (id) on delete cascade,
  name          text not null,
  position      text,
  bio           text,
  phone         text,
  email         text check (email is null or email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  image_path    text,
  image_alt     text,
  image_caption text,
  image_focus   jsonb,
  sort_order    integer not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- Boards page "Major Activities". date_text is free text ('To be communicated').
create table public.major_activities (
  id          uuid primary key default gen_random_uuid(),
  title       text not null unique,
  date_text   text,
  location    text,
  description text,
  image_path  text,
  image_url   text check (image_url is null or image_url ~* '^https?://'),  -- external, until re-hosted
  image_alt   text,
  sort_order  integer not null default 0,
  status      public.content_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.hero_slides (
  id          uuid primary key default gen_random_uuid(),
  eyebrow     text,
  heading     text not null,      -- \n marks a line break, as in the source
  subheading  text,
  image_path  text,
  image_alt   text,
  image_focus jsonb,
  sort_order  integer not null default 0 unique,
  status      public.content_status not null default 'draft',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- The banner at the top of each inner page.
create table public.page_heroes (
  page       text primary key,
  title      text not null,
  subtitle   text,
  image_path text,
  image_url  text check (image_url is null or image_url ~* '^https?://'),   -- external, until re-hosted
  image_alt  text,
  status     public.content_status not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Stats are nullable: where the source disagrees with itself the value is NULL,
-- and the row stays 'draft' until the owner supplies the correct number.
create table public.stats (
  id            uuid primary key default gen_random_uuid(),
  section       text not null check (section in ('home', 'home_about')),
  stat_key      text not null,
  label         text not null,
  numeric_value integer,          -- for counters the page animates
  display_value text,             -- for text such as 60+ or Many
  icon          text,
  sort_order    integer not null default 0,
  status        public.content_status not null default 'draft',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  unique (section, stat_key)
);

-- Page copy that is editable but not a repeating record type of its own.
create table public.content_sections (
  id              uuid primary key default gen_random_uuid(),
  page            text not null,
  section_key     text not null,
  eyebrow         text,
  heading         text,           -- \n marks a line break, as in the source
  subheading      text,
  paragraphs      text[] not null default '{}',
  image_path      text,
  image_alt       text,
  image_focus     jsonb,
  badge_primary   text,
  badge_secondary text,
  cta_label       text,
  cta_url         text,
  sort_order      integer not null default 0,
  status          public.content_status not null default 'draft',
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now(),
  unique (page, section_key)
);

create table public.content_items (
  id          uuid primary key default gen_random_uuid(),
  section_id  uuid not null references public.content_sections (id) on delete cascade,
  title       text,
  description text,
  label       text,
  value       text,
  icon        text,
  link_url    text,
  sort_order  integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  unique (section_id, sort_order)
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

create index posts_published_feed_idx on public.posts (published_at desc) where status = 'published';
create index posts_status_idx         on public.posts (status);
create index posts_type_idx           on public.posts (post_type, published_at desc);
create index posts_category_idx       on public.posts (category);
create index posts_author_id_idx      on public.posts (author_id);
create index post_media_post_id_idx   on public.post_media_attachments (post_id, sort_order);

create index events_status_date_idx   on public.events (status, event_date);
create index sermons_status_date_idx  on public.sermons (status, sermon_date desc);
create index sermons_media_type_idx   on public.sermons (media_type);
create index galleries_status_date_idx on public.galleries (status, album_date desc);
create index galleries_category_idx   on public.galleries (category);
create index executives_category_idx  on public.executives (category, sort_order);
create index testimonials_status_date_idx on public.testimonials (status, testimonial_date desc);
create index departments_leader_id_idx on public.departments (leader_id);
create index scripture_status_order_idx on public.scripture_quotes (status, sort_order);
create index ghamsu_today_status_date_idx on public.ghamsu_today (status, entry_date desc);
create index ghamsu_today_items_parent_idx on public.ghamsu_today_items (ghamsu_today_id, slot, sort_order);
create index boards_status_order_idx  on public.boards (status, sort_order);
create index board_members_board_id_idx on public.board_members (board_id, sort_order);
create index major_activities_order_idx on public.major_activities (status, sort_order);
create index stats_section_idx        on public.stats (section, sort_order);
create index content_sections_page_idx on public.content_sections (page, sort_order);

-- -----------------------------------------------------------------------------
-- Timestamp triggers
-- -----------------------------------------------------------------------------

create function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

do $$
declare
  t text;
begin
  for t in
    select c.table_name
    from information_schema.columns c
    join information_schema.tables tb
      on tb.table_schema = c.table_schema and tb.table_name = c.table_name
    where c.table_schema = 'public'
      and c.column_name = 'updated_at'
      and tb.table_type = 'BASE TABLE'
      and c.table_name <> 'posts'
  loop
    execute format(
      'create trigger set_updated_at before update on public.%I
         for each row execute function private.set_updated_at()', t);
  end loop;
end;
$$;

-- A page view must not make a post look edited, so counter-only updates are skipped.
create trigger set_updated_at
  before update on public.posts
  for each row
  when (old.view_count is not distinct from new.view_count
        and old.like_count is not distinct from new.like_count)
  execute function private.set_updated_at();

-- Publishing without a date stamps the current time.
create function private.set_post_published_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.status = 'published' and new.published_at is null then
    new.published_at := now();
  end if;
  return new;
end;
$$;

create trigger set_post_published_at
  before insert or update of status, published_at on public.posts
  for each row execute function private.set_post_published_at();

-- -----------------------------------------------------------------------------
-- Role helpers, used by RLS in 0002
-- -----------------------------------------------------------------------------

-- SECURITY DEFINER avoids RLS recursion on profiles. Deactivated users and
-- users with an unconfirmed email have no role, and because this reads the
-- database on each call, deactivation applies immediately, not on token expiry.
create function private.current_app_role()
returns public.app_role
language sql
stable
security definer
set search_path = ''
as $$
  select p.role
  from public.profiles p
  join auth.users u on u.id = p.id
  where p.id = auth.uid()
    and p.is_active
    and u.email_confirmed_at is not null
$$;

create function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() = 'admin'::public.app_role, false)
$$;

create function private.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(private.current_app_role() in ('admin'::public.app_role, 'editor'::public.app_role), false)
$$;

-- -----------------------------------------------------------------------------
-- Admin bootstrap
-- -----------------------------------------------------------------------------

-- The ONLY path to automatic admin. Exact, case-insensitive match on one address.
-- User-supplied metadata (raw_user_meta_data) is deliberately never read, since
-- a caller can set it to anything.
create function private.bootstrap_admin_email()
returns text
language sql
immutable
set search_path = ''
as $$
  select 'ghamsupcb@gmail.com'::text
$$;

create function private.handle_new_auth_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) = private.bootstrap_admin_email() then 'admin'::public.app_role
      else null
    end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_auth_user();

-- Keeps the display copy of the email current. It never touches role, so
-- changing an account's email to the bootstrap address grants nothing.
create function private.sync_profile_email()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles set email = new.email where id = new.id;
  return new;
end;
$$;

create trigger on_auth_user_email_changed
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function private.sync_profile_email();

-- One-off backfill, for auth users created before this migration ran.
insert into public.profiles (id, email, role)
select
  u.id,
  u.email,
  case
    when lower(u.email) = private.bootstrap_admin_email() then 'admin'::public.app_role
    else null
  end
from auth.users u
on conflict (id) do update
  set role = 'admin'::public.app_role
  where lower(excluded.email) = private.bootstrap_admin_email();

-- -----------------------------------------------------------------------------
-- Profile safeguards
-- -----------------------------------------------------------------------------

-- Second layer behind RLS. Requests with no signed-in user (service role, SQL
-- editor) skip this, so the owner can always recover from a lockout.
create function private.guard_profile_changes()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;

  if tg_op = 'UPDATE'
     and (new.role is distinct from old.role or new.is_active is distinct from old.is_active)
     and not private.is_admin() then
    raise exception 'Only admins can change roles or account status'
      using errcode = '42501';
  end if;

  if old.role = 'admin'::public.app_role and old.is_active
     and (tg_op = 'DELETE'
          or new.role is distinct from 'admin'::public.app_role
          or not new.is_active) then
    -- Serializes two admins demoting each other at the same moment.
    perform pg_advisory_xact_lock(hashtext('public.profiles.active_admins'));

    if not exists (
      select 1
      from public.profiles p
      join auth.users u on u.id = p.id
      where p.id <> old.id
        and p.role = 'admin'::public.app_role
        and p.is_active
        and u.email_confirmed_at is not null
    ) then
      raise exception 'Cannot remove the last active admin'
        using errcode = '23514';
    end if;
  end if;

  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

create trigger guard_profile_changes
  before update or delete on public.profiles
  for each row execute function private.guard_profile_changes();

-- -----------------------------------------------------------------------------
-- Public counters. These replace /api/blog-stats.
-- -----------------------------------------------------------------------------

-- Only a published post can change, and only this one column. Returns the new
-- count, or NULL when no published post has this slug.
create function public.increment_post_view(post_slug text)
returns integer
language sql
security definer
set search_path = ''
as $$
  update public.posts
  set view_count = view_count + 1
  where slug = post_slug
    and status = 'published'::public.content_status
  returning view_count
$$;

-- Not in the original brief. /api/blog-stats also handled likes, so the like
-- button needs this to keep working once that endpoint is removed.
create function public.increment_post_like(post_slug text)
returns integer
language sql
security definer
set search_path = ''
as $$
  update public.posts
  set like_count = like_count + 1
  where slug = post_slug
    and status = 'published'::public.content_status
  returning like_count
$$;

-- -----------------------------------------------------------------------------
-- Function privileges. Supabase grants EXECUTE on new functions by default.
-- -----------------------------------------------------------------------------

revoke all on all functions in schema private from public, anon, authenticated;

grant usage on schema private to authenticated, service_role;
grant execute on function private.current_app_role() to authenticated, service_role;
grant execute on function private.is_admin()         to authenticated, service_role;
grant execute on function private.is_staff()         to authenticated, service_role;

revoke all on function public.increment_post_view(text) from public, anon, authenticated;
revoke all on function public.increment_post_like(text) from public, anon, authenticated;
grant execute on function public.increment_post_view(text) to anon, authenticated, service_role;
grant execute on function public.increment_post_like(text) to anon, authenticated, service_role;

commit;
