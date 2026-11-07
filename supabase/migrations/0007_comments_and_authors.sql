-- =============================================================================
-- 0007_comments_and_authors.sql
-- 1. Published posts must have an author name (Reporter for news, Author for
--    articles). Drafts may have none.
-- 2. Public comments on posts, with one level of replies, moderation and
--    staff replies.
-- Run AFTER 0001-0006, in the Supabase SQL editor.
--
-- Privacy: visitors are never granted the author_email, author_user_id or
-- ip_hash columns. They read comments through the post_comments_public view,
-- which only has safe columns and only shows visible comments on published
-- posts. They can only add comments through add_post_comment(), which does
-- every check (published, comments open, lengths, email, no links, rate limits).
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- 1. Author name required on published posts
-- -----------------------------------------------------------------------------

-- Published posts that only have an author profile get its name.
update public.posts p
set author_name = a.name
from public.authors a
where p.author_id = a.id
  and p.status = 'published'::public.content_status
  and nullif(btrim(coalesce(p.author_name, '')), '') is null;

do $$
declare
  missing text;
begin
  select string_agg(format('"%s"', title), ', ') into missing
  from public.posts
  where status = 'published'::public.content_status and nullif(btrim(coalesce(author_name, '')), '') is null;
  if missing is not null then
    raise exception 'These published posts have no author name: %. Add one (or unpublish them) in the admin, then run this migration again.', missing;
  end if;
end;
$$;

alter table public.posts
  add column comments_open boolean not null default true,
  -- Stricter than posts_publish_requirements, which also accepted an author
  -- profile alone or a name of only spaces.
  add constraint posts_published_author_name
    check (status = 'draft'::public.content_status or nullif(btrim(author_name), '') is not null),
  add constraint posts_author_name_length check (author_name is null or char_length(author_name) <= 120),
  add constraint posts_author_detail_length check (author_detail is null or char_length(author_detail) <= 120);

comment on column public.posts.author_name is 'Shown as "Reporter" on news and "Author" on articles. Required to publish.';
comment on column public.posts.author_detail is 'Optional position or local, for example "UG Local" or "Communications Officer".';
comment on column public.posts.comments_open is 'Whether visitors can add comments to this post.';

grant select (comments_open) on public.posts to anon, authenticated;
grant insert (comments_open), update (comments_open) on public.posts to authenticated;

-- -----------------------------------------------------------------------------
-- 2. Comments
-- -----------------------------------------------------------------------------

create table public.post_comments (
  id             uuid primary key default gen_random_uuid(),
  post_id        uuid not null references public.posts (id) on delete cascade,
  -- Replies point at a top-level comment (one level deep, see the trigger).
  parent_id      uuid references public.post_comments (id) on delete cascade,
  author_name    text not null check (char_length(author_name) between 2 and 60),
  -- Never public. Empty only on staff replies.
  author_email   text check (author_email is null or (char_length(author_email) <= 254 and author_email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$')),
  body           text not null check (char_length(body) between 2 and 1500),
  is_staff_reply boolean not null default false,
  author_user_id uuid references auth.users (id) on delete set null,
  status         text not null default 'visible' check (status in ('visible', 'pending', 'hidden')),
  -- SHA-256 of the visitor's IP address, only for the rate limit. Never public.
  ip_hash        text,
  created_at     timestamptz not null default now(),
  constraint post_comments_visitor_email check (is_staff_reply or author_email is not null)
);
comment on table public.post_comments is
  'Comments on posts. Visitors read post_comments_public and write through add_post_comment(); they can never read author_email.';

create index post_comments_post_idx on public.post_comments (post_id, created_at desc);
create index post_comments_pending_idx on public.post_comments (created_at desc) where status = 'pending';
create index post_comments_email_rate_idx on public.post_comments (post_id, author_email, created_at);
create index post_comments_ip_rate_idx on public.post_comments (ip_hash, created_at) where ip_hash is not null;

-- One level of replies, on the same post.
create function private.check_comment_parent()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  parent record;
begin
  if new.parent_id is null then
    return new;
  end if;
  select c.post_id, c.parent_id into parent from public.post_comments c where c.id = new.parent_id;
  if not found then
    raise exception 'The comment you are replying to no longer exists.' using errcode = '22023', hint = 'invalid_parent';
  end if;
  if parent.parent_id is not null then
    raise exception 'Replies can only be one level deep.' using errcode = '22023', hint = 'invalid_parent';
  end if;
  if parent.post_id <> new.post_id then
    raise exception 'A reply must be on the same post as the comment.' using errcode = '22023', hint = 'invalid_parent';
  end if;
  return new;
end;
$$;

create trigger check_comment_parent
  before insert or update of parent_id, post_id on public.post_comments
  for each row execute function private.check_comment_parent();

-- The moderation setting. Public, so the form can say comments need approval.
insert into public.site_settings (key, is_public, description, value) values
  ('comments', true, 'Comment moderation. When require_approval is true, new visitor comments wait for approval.',
   '{"require_approval": false}'::jsonb)
on conflict (key) do nothing;

-- -----------------------------------------------------------------------------
-- Adding comments (visitors)
-- -----------------------------------------------------------------------------

create function public.add_post_comment(
  p_post_id   uuid,
  p_name      text,
  p_email     text,
  p_body      text,
  p_parent_id uuid default null
)
returns table (comment_id uuid, comment_status text)
language plpgsql
security definer
set search_path = ''
as $$
declare
  -- Web links: a scheme, www., common short links, or a word followed
  -- directly by a common domain ending. Endings that are also everyday words
  -- after a missing space (".me", ".co", ".live") are left out on purpose,
  -- so "I came.Me too" isn't refused. Keep in step with LINK_PATTERN in
  -- src/lib/comments.ts.
  link_pattern constant text :=
    '(https?://|www\.|(wa|t)\.me/|bit\.ly/|[a-z0-9-]+\.(com|net|org|info|biz|io|xyz|ru|online|site|website|top|shop|store|click|tk|ml|ga|cf|gq|edu|gov|gh|uk)(\M|/))';
  v_name     text;
  v_email    text;
  v_body     text;
  v_post     record;
  v_parent   record;
  v_parent_id uuid;
  v_headers  json;
  v_ip       text;
  v_ip_hash  text;
  v_recent   integer;
  v_approval boolean;
  v_status   text;
  v_id       uuid;
begin
  v_name  := btrim(regexp_replace(coalesce(p_name, ''), '\s+', ' ', 'g'));
  v_email := lower(btrim(coalesce(p_email, '')));
  -- Keep line breaks, but no more than one blank line in a row.
  v_body  := btrim(regexp_replace(regexp_replace(coalesce(p_body, ''), E'\r\n?', E'\n', 'g'), E'\n{3,}', E'\n\n', 'g'));

  select p.status, p.comments_open into v_post from public.posts p where p.id = p_post_id;
  if not found or v_post.status <> 'published'::public.content_status then
    raise exception 'This post is not available for comments.' using errcode = 'P0001', hint = 'comments_unavailable';
  end if;
  if not v_post.comments_open then
    raise exception 'Comments are closed on this post.' using errcode = 'P0001', hint = 'comments_closed';
  end if;

  if char_length(v_name) not between 2 and 60 then
    raise exception 'Please enter a name between 2 and 60 characters.' using errcode = '22023', hint = 'invalid_name';
  end if;
  if char_length(v_email) > 254 or v_email !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
    raise exception 'Please enter a valid email address.' using errcode = '22023', hint = 'invalid_email';
  end if;
  if char_length(v_body) < 2 then
    raise exception 'Please write a comment.' using errcode = '22023', hint = 'invalid_body';
  end if;
  if char_length(v_body) > 1500 then
    raise exception 'Please keep your comment under 1,500 characters.' using errcode = '22023', hint = 'invalid_body';
  end if;
  if v_body ~* link_pattern or v_name ~* link_pattern then
    raise exception 'Links aren''t allowed in comments. Please remove any web addresses and try again.'
      using errcode = '22023', hint = 'comment_link';
  end if;

  -- Replies go under the top-level comment, which must be visible.
  if p_parent_id is not null then
    select c.id, c.parent_id, c.post_id into v_parent from public.post_comments c where c.id = p_parent_id;
    if not found then
      raise exception 'You can only reply to a comment that is shown on this post.' using errcode = '22023', hint = 'invalid_parent';
    end if;
    v_parent_id := coalesce(v_parent.parent_id, v_parent.id);
    if v_parent.post_id <> p_post_id or not exists (
      select 1 from public.post_comments c where c.id = v_parent_id and c.status = 'visible'
    ) then
      raise exception 'You can only reply to a comment that is shown on this post.' using errcode = '22023', hint = 'invalid_parent';
    end if;
  end if;

  -- Rate limits. The lock makes simultaneous posts from one email wait their turn.
  perform pg_advisory_xact_lock(hashtext('post_comments:' || v_email));
  select count(*) into v_recent from public.post_comments c
  where c.post_id = p_post_id and c.author_email = v_email and c.created_at > now() - interval '10 minutes';
  if v_recent >= 3 then
    raise exception 'You''ve posted several comments here in a short time. Please wait a few minutes and try again.'
      using errcode = 'P0001', hint = 'rate_limited';
  end if;

  -- The visitor's IP address, as PostgREST passes it on. Only a hash is kept.
  begin
    v_headers := nullif(current_setting('request.headers', true), '')::json;
  exception when others then
    v_headers := null;
  end;
  v_ip := nullif(btrim(coalesce(
    v_headers ->> 'cf-connecting-ip',
    split_part(v_headers ->> 'x-forwarded-for', ',', 1),
    v_headers ->> 'x-real-ip',
    ''
  )), '');
  if v_ip is not null then
    v_ip_hash := encode(sha256(convert_to('ghamsu-comments:' || v_ip, 'UTF8')), 'hex');
    -- Generous, because many students share one campus connection.
    select count(*) into v_recent from public.post_comments c
    where c.ip_hash = v_ip_hash and c.created_at > now() - interval '10 minutes';
    if v_recent >= 20 then
      raise exception 'Too many comments have been sent from your connection recently. Please wait a few minutes and try again.'
        using errcode = 'P0001', hint = 'rate_limited';
    end if;
  end if;

  v_approval := coalesce((select (s.value ->> 'require_approval')::boolean from public.site_settings s where s.key = 'comments'), false);
  v_status := case when v_approval then 'pending' else 'visible' end;

  insert into public.post_comments (post_id, parent_id, author_name, author_email, body, status, ip_hash)
  values (p_post_id, v_parent_id, v_name, v_email, v_body, v_status, v_ip_hash)
  returning id into v_id;

  return query select v_id, v_status;
end;
$$;

-- -----------------------------------------------------------------------------
-- Staff replies (shown with the GHAMSU badge, under the staff member's name)
-- -----------------------------------------------------------------------------

create function public.add_staff_reply(p_comment_id uuid, p_body text)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_body   text;
  v_target record;
  v_top    uuid;
  v_name   text;
  v_email  text;
  v_id     uuid;
begin
  if not private.is_staff() then
    raise exception 'Only GHAMSU staff can post staff replies.' using errcode = '42501';
  end if;

  v_body := btrim(regexp_replace(regexp_replace(coalesce(p_body, ''), E'\r\n?', E'\n', 'g'), E'\n{3,}', E'\n\n', 'g'));
  if char_length(v_body) not between 2 and 1500 then
    raise exception 'A reply must be between 2 and 1,500 characters.' using errcode = '22023', hint = 'invalid_body';
  end if;

  select c.id, c.parent_id, c.post_id into v_target from public.post_comments c where c.id = p_comment_id;
  if not found then
    raise exception 'That comment no longer exists.' using errcode = '22023', hint = 'invalid_parent';
  end if;
  v_top := coalesce(v_target.parent_id, v_target.id);
  if not exists (select 1 from public.post_comments c where c.id = v_top and c.status = 'visible') then
    raise exception 'Approve the comment before replying to it.' using errcode = '22023', hint = 'parent_not_visible';
  end if;

  select nullif(btrim(p.full_name), ''), p.email into v_name, v_email from public.profiles p where p.id = auth.uid();
  v_name := left(coalesce(v_name, 'GHAMSU'), 60);
  if char_length(v_name) < 2 then
    v_name := 'GHAMSU';
  end if;

  insert into public.post_comments (post_id, parent_id, author_name, author_email, body, is_staff_reply, author_user_id, status)
  values (v_target.post_id, v_top, v_name, v_email, v_body, true, auth.uid(), 'visible')
  returning id into v_id;
  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- What visitors can read
-- -----------------------------------------------------------------------------

-- security_invoker: the visitor's own privileges and RLS apply, so this can
-- never show more than the column grants and policies below allow.
create view public.post_comments_public with (security_invoker = true) as
select c.id, c.post_id, c.parent_id, c.author_name, c.body, c.is_staff_reply, c.created_at
from public.post_comments c
join public.posts p on p.id = c.post_id and p.status = 'published'::public.content_status
where c.status = 'visible'
  and (c.parent_id is null or exists (
    select 1 from public.post_comments pc where pc.id = c.parent_id and pc.status = 'visible'
  ));
comment on view public.post_comments_public is 'Visible comments on published posts, without email addresses.';

create view public.post_comment_counts with (security_invoker = true) as
select post_id, count(*)::integer as comment_count
from public.post_comments_public
group by post_id;

-- -----------------------------------------------------------------------------
-- Privileges and row-level security
-- -----------------------------------------------------------------------------

revoke all on function private.check_comment_parent() from public, anon, authenticated;
revoke all on function public.add_post_comment(uuid, text, text, text, uuid) from public, anon, authenticated;
grant execute on function public.add_post_comment(uuid, text, text, text, uuid) to anon, authenticated, service_role;
revoke all on function public.add_staff_reply(uuid, text) from public, anon, authenticated;
grant execute on function public.add_staff_reply(uuid, text) to authenticated, service_role;

alter table public.post_comments enable row level security;
revoke all on public.post_comments from public, anon, authenticated;
grant all on public.post_comments to service_role;
-- Visitors: only the safe columns (the view needs them). No author_email,
-- author_user_id or ip_hash, and no insert, update or delete at all.
grant select (id, post_id, parent_id, author_name, body, is_staff_reply, status, created_at)
  on public.post_comments to anon;
-- Staff: read everything, change only the status, delete. Replies go
-- through add_staff_reply().
grant select, delete on public.post_comments to authenticated;
grant update (status) on public.post_comments to authenticated;

revoke all on public.post_comments_public, public.post_comment_counts from public, anon, authenticated;
grant select on public.post_comments_public, public.post_comment_counts to anon, authenticated, service_role;

create policy post_comments_public_read on public.post_comments
  for select to anon
  using (
    status = 'visible'
    and exists (select 1 from public.posts p where p.id = post_id and p.status = 'published'::public.content_status)
  );

-- Signed-in users only see comments if they are staff, so a signed-in
-- account without a role can't read email addresses either.
create policy post_comments_staff_read on public.post_comments
  for select to authenticated
  using ((select private.is_staff()));

create policy post_comments_staff_update on public.post_comments
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

create policy post_comments_staff_delete on public.post_comments
  for delete to authenticated
  using ((select private.is_staff()));

-- -----------------------------------------------------------------------------
-- Safety check, as in 0002
-- -----------------------------------------------------------------------------

do $$
declare
  missing text;
begin
  select string_agg(c.relname, ', ') into missing
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind in ('r', 'p') and not c.relrowsecurity;
  if missing is not null then
    raise exception 'RLS is not enabled on: %', missing;
  end if;
end;
$$;

commit;
