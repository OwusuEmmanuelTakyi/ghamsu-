-- =============================================================================
-- 0005_executive_submissions.sql
-- Executives submit their own profiles through a shareable link; an admin
-- approves each one before it appears on the site. Run AFTER 0001-0004, in
-- the Supabase SQL editor.
--
-- Also makes executives' "show my phone / email" choices binding in the
-- database: visitors can no longer read executives.phone, .email or
-- .whatsapp, only the public_* copies, which are empty when hidden.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Executives: privacy choices, enforced for visitors
-- -----------------------------------------------------------------------------

alter table public.executives
  add column show_phone boolean not null default true,
  add column show_email boolean not null default true,
  -- Computed by the database; empty when the person chose to hide them.
  -- WhatsApp is a phone number, so it follows show_phone.
  add column public_phone    text generated always as (case when show_phone then phone end) stored,
  add column public_email    text generated always as (case when show_email then email end) stored,
  add column public_whatsapp text generated always as (case when show_phone then whatsapp end) stored;

-- Visitors may read every column except the raw contact details. Signed-in
-- users keep full access (sign-ups are disabled; only invited staff exist).
revoke select on public.executives from anon;
grant select (
  id, legacy_sanity_id, status, name, position, image_path, image_alt, image_caption, image_focus,
  sort_order, category, bio, show_phone, show_email, public_phone, public_email, public_whatsapp,
  created_at, updated_at
) on public.executives to anon;

-- -----------------------------------------------------------------------------
-- Invite links
-- -----------------------------------------------------------------------------

create table public.executive_invite_links (
  id              uuid primary key default gen_random_uuid(),
  label           text not null check (char_length(label) between 2 and 120),
  -- 64 hex characters from two random UUIDs: about 244 random bits.
  token           text not null unique
                    default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', '')
                    check (token ~ '^[a-f0-9]{64}$'),
  preset_category text check (preset_category in ('connexional', 'Connexional Boards', 'Diocese', 'local')),
  preset_board_id uuid references public.boards (id) on delete set null,
  expires_at      timestamptz,
  max_submissions integer check (max_submissions is null or max_submissions > 0),
  active          boolean not null default true,
  created_by      uuid references auth.users (id) on delete set null default auth.uid(),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create trigger set_updated_at before update on public.executive_invite_links
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Submissions
-- -----------------------------------------------------------------------------

create table public.executive_submissions (
  id               uuid primary key default gen_random_uuid(),
  link_id          uuid references public.executive_invite_links (id) on delete set null,
  full_name        text not null check (char_length(full_name) between 2 and 120),
  position         text not null check (char_length(position) between 2 and 120),
  category         text not null check (category in ('connexional', 'Connexional Boards', 'Diocese', 'local')),
  board_id         uuid references public.boards (id) on delete set null,
  location         text not null check (char_length(location) between 2 and 150),
  phone            text not null check (phone ~ '^\+233[2-5][0-9]{8}$'),
  email            text not null check (char_length(email) <= 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  whatsapp         text check (whatsapp is null or whatsapp ~ '^233[2-5][0-9]{8}$'),
  bio              text check (bio is null or char_length(bio) <= 1000),
  -- Paths inside the private executive-submissions bucket.
  photo_path       text not null,
  photo_thumb_path text,
  consent          boolean not null check (consent),
  show_phone       boolean not null default false,
  show_email       boolean not null default false,
  status           text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  rejection_reason text check (rejection_reason is null or char_length(rejection_reason) <= 500),
  reviewed_by      uuid references auth.users (id) on delete set null,
  reviewed_at      timestamptz,
  executive_id     uuid references public.executives (id) on delete set null,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create trigger set_updated_at before update on public.executive_submissions
  for each row execute function private.set_updated_at();

create index executive_submissions_status_idx on public.executive_submissions (status, created_at desc);
create index executive_submissions_link_idx on public.executive_submissions (link_id);

-- One pending submission per phone number per link (approved or rejected
-- ones don't block a fresh submission).
create unique index executive_submissions_one_pending_per_phone
  on public.executive_submissions (link_id, phone) where status = 'pending';

-- -----------------------------------------------------------------------------
-- Link checks
-- -----------------------------------------------------------------------------

-- A link accepts submissions while active, unexpired and under its limit.
create function private.invite_token_is_valid(p_token text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.executive_invite_links l
    where l.token = p_token
      and l.active
      and (l.expires_at is null or now() < l.expires_at)
      and (l.max_submissions is null or (
        select count(*) from public.executive_submissions s where s.link_id = l.id
      ) < l.max_submissions)
  )
$$;

-- What the public form needs to know about a link, and nothing else.
create function public.executive_invite_info(p_token text)
returns table (is_valid boolean, label text, preset_category text, board_title text)
language sql
stable
security definer
set search_path = ''
as $$
  select
    private.invite_token_is_valid(p_token),
    l.label,
    l.preset_category,
    b.title
  from public.executive_invite_links l
  left join public.boards b on b.id = l.preset_board_id
  where l.token = p_token
$$;

-- -----------------------------------------------------------------------------
-- The only way visitors can add a submission
-- -----------------------------------------------------------------------------

create function public.submit_executive_profile(p_token text, p_submission jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  link record;
  taken integer;
  v_phone text;
  v_whatsapp text;
  v_category text;
  v_photo text := btrim(coalesce(p_submission ->> 'photo_path', ''));
  v_thumb text := nullif(btrim(coalesce(p_submission ->> 'photo_thumb_path', '')), '');
  v_id uuid;
  digits text;
  photo_rule text;
begin
  -- Lock the link so the submission limit can't be exceeded by two people at once.
  select * into link from public.executive_invite_links where token = p_token for update;
  if not found or not link.active or (link.expires_at is not null and now() >= link.expires_at) then
    raise exception 'This link is no longer active.' using errcode = 'P0001', hint = 'link_inactive';
  end if;
  if link.max_submissions is not null then
    select count(*) into taken from public.executive_submissions where link_id = link.id;
    if taken >= link.max_submissions then
      raise exception 'This link is no longer active.' using errcode = 'P0001', hint = 'link_full';
    end if;
  end if;

  if coalesce((p_submission ->> 'consent')::boolean, false) is not true then
    raise exception 'Please agree to your details being shown on the website.' using errcode = 'P0001', hint = 'consent_required';
  end if;

  digits := regexp_replace(coalesce(p_submission ->> 'phone', ''), '[^0-9]', '', 'g');
  if digits ~ '^0[2-5][0-9]{8}$' then v_phone := '+233' || substr(digits, 2);
  elsif digits ~ '^233[2-5][0-9]{8}$' then v_phone := '+' || digits;
  else raise exception 'Please enter a valid Ghana phone number.' using errcode = '22023', hint = 'invalid_phone';
  end if;

  digits := regexp_replace(coalesce(p_submission ->> 'whatsapp', ''), '[^0-9]', '', 'g');
  if digits = '' then v_whatsapp := null;
  elsif digits ~ '^0[2-5][0-9]{8}$' then v_whatsapp := '233' || substr(digits, 2);
  elsif digits ~ '^233[2-5][0-9]{8}$' then v_whatsapp := digits;
  else raise exception 'Please enter a valid Ghana WhatsApp number.' using errcode = '22023', hint = 'invalid_whatsapp';
  end if;

  -- A preset category on the link always wins over anything sent.
  v_category := coalesce(link.preset_category, p_submission ->> 'category');

  -- The photo must be in this link's folder of the private bucket, and uploaded.
  photo_rule := '^' || link.token || '/[0-9a-f-]{36}\.(webp|jpg)$';
  if v_photo !~ photo_rule or not exists (
    select 1 from storage.objects o where o.bucket_id = 'executive-submissions' and o.name = v_photo
  ) then
    raise exception 'Please add a photo.' using errcode = 'P0001', hint = 'photo_missing';
  end if;
  if v_thumb is not null and v_thumb <> regexp_replace(v_photo, '\.(webp|jpg)$', '.thumb.\1') then
    v_thumb := null;
  end if;

  if exists (
    select 1 from public.executive_submissions
    where link_id = link.id and phone = v_phone and status = 'pending'
  ) then
    raise exception 'A profile with this phone number is already waiting for approval.'
      using errcode = '23505', hint = 'duplicate_pending';
  end if;

  insert into public.executive_submissions (
    link_id, full_name, position, category, board_id, location, phone, email, whatsapp, bio,
    photo_path, photo_thumb_path, consent, show_phone, show_email
  ) values (
    link.id,
    btrim(regexp_replace(coalesce(p_submission ->> 'full_name', ''), '\s+', ' ', 'g')),
    btrim(coalesce(p_submission ->> 'position', '')),
    v_category,
    link.preset_board_id,
    btrim(coalesce(p_submission ->> 'location', '')),
    v_phone,
    lower(btrim(coalesce(p_submission ->> 'email', ''))),
    v_whatsapp,
    nullif(btrim(coalesce(p_submission ->> 'bio', '')), ''),
    v_photo,
    v_thumb,
    true,
    coalesce((p_submission ->> 'show_phone')::boolean, false),
    coalesce((p_submission ->> 'show_email')::boolean, false)
  )
  returning id into v_id;

  return v_id;
end;
$$;

-- -----------------------------------------------------------------------------
-- Review (admins, or the service role for scripted tests)
-- -----------------------------------------------------------------------------

create function private.can_review()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select private.is_admin()
    or coalesce(nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role', '') = 'service_role'
$$;

-- Creates the published executive (and board member, if the link named a
-- board) and marks the submission approved, all in one transaction. The
-- photo must already be copied into the public media bucket (image_path).
create function public.approve_executive_submission(p_submission_id uuid, p_executive jsonb)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  sub record;
  v_executive_id uuid;
  v_category text := p_executive ->> 'category';
  v_show_phone boolean := coalesce((p_executive ->> 'show_phone')::boolean, false);
  v_show_email boolean := coalesce((p_executive ->> 'show_email')::boolean, false);
begin
  if not private.can_review() then
    raise exception 'Only admins can approve submissions.' using errcode = '42501';
  end if;

  select * into sub from public.executive_submissions where id = p_submission_id for update;
  if not found then
    raise exception 'That submission no longer exists.' using errcode = 'P0001', hint = 'not_found';
  end if;
  if sub.status <> 'pending' then
    raise exception 'This submission has already been reviewed.' using errcode = 'P0001', hint = 'already_reviewed';
  end if;
  if coalesce(p_executive ->> 'image_path', '') = '' then
    raise exception 'The photo has not been copied yet.' using errcode = 'P0001', hint = 'photo_missing';
  end if;

  insert into public.executives (
    status, name, position, category, image_path, image_alt, image_focus,
    phone, email, whatsapp, bio, show_phone, show_email, sort_order
  ) values (
    'published',
    btrim(p_executive ->> 'name'),
    btrim(p_executive ->> 'position'),
    v_category,
    p_executive ->> 'image_path',
    coalesce(nullif(btrim(p_executive ->> 'image_alt'), ''), btrim(p_executive ->> 'name')),
    p_executive -> 'image_focus',
    nullif(btrim(p_executive ->> 'phone'), ''),
    nullif(lower(btrim(p_executive ->> 'email')), ''),
    nullif(btrim(p_executive ->> 'whatsapp'), ''),
    nullif(btrim(p_executive ->> 'bio'), ''),
    v_show_phone,
    v_show_email,
    -- Last in its category.
    coalesce((select max(e.sort_order) from public.executives e where e.category = v_category), 0) + 1
  )
  returning id into v_executive_id;

  if sub.board_id is not null then
    insert into public.board_members (board_id, name, position, image_path, image_alt, image_focus, phone, email, sort_order)
    values (
      sub.board_id,
      btrim(p_executive ->> 'name'),
      btrim(p_executive ->> 'position'),
      p_executive ->> 'image_path',
      coalesce(nullif(btrim(p_executive ->> 'image_alt'), ''), btrim(p_executive ->> 'name')),
      p_executive -> 'image_focus',
      -- Board members are always public, so only copy what the person chose to show.
      case when v_show_phone then nullif(btrim(p_executive ->> 'phone'), '') end,
      case when v_show_email then nullif(lower(btrim(p_executive ->> 'email')), '') end,
      coalesce((select max(m.sort_order) from public.board_members m where m.board_id = sub.board_id), 0) + 1
    );
  end if;

  update public.executive_submissions
  set status = 'approved', executive_id = v_executive_id, reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_submission_id;

  return v_executive_id;
end;
$$;

create function public.reject_executive_submission(p_submission_id uuid, p_reason text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not private.can_review() then
    raise exception 'Only admins can reject submissions.' using errcode = '42501';
  end if;
  update public.executive_submissions
  set status = 'rejected', rejection_reason = nullif(btrim(coalesce(p_reason, '')), ''),
      reviewed_by = auth.uid(), reviewed_at = now()
  where id = p_submission_id and status = 'pending';
  if not found then
    raise exception 'This submission has already been reviewed or no longer exists.' using errcode = 'P0001', hint = 'already_reviewed';
  end if;
end;
$$;

-- -----------------------------------------------------------------------------
-- Privileges and row-level security
-- -----------------------------------------------------------------------------

revoke all on function private.invite_token_is_valid(text) from public, anon, authenticated;
revoke all on function private.can_review() from public, anon, authenticated;
grant execute on function private.invite_token_is_valid(text) to anon, authenticated, service_role;
grant execute on function private.can_review() to authenticated, service_role;

revoke all on function public.executive_invite_info(text) from public, anon, authenticated;
revoke all on function public.submit_executive_profile(text, jsonb) from public, anon, authenticated;
revoke all on function public.approve_executive_submission(uuid, jsonb) from public, anon, authenticated;
revoke all on function public.reject_executive_submission(uuid, text) from public, anon, authenticated;
grant execute on function public.executive_invite_info(text) to anon, authenticated, service_role;
grant execute on function public.submit_executive_profile(text, jsonb) to anon, authenticated, service_role;
grant execute on function public.approve_executive_submission(uuid, jsonb) to authenticated, service_role;
grant execute on function public.reject_executive_submission(uuid, text) to authenticated, service_role;

-- Links: admins only. Visitors never see this table.
alter table public.executive_invite_links enable row level security;
revoke all on public.executive_invite_links from public, anon, authenticated;
grant select, insert, update, delete on public.executive_invite_links to authenticated;
grant all on public.executive_invite_links to service_role;

create policy executive_invite_links_admin_all on public.executive_invite_links
  for all to authenticated
  using ((select private.is_admin()))
  with check ((select private.is_admin()));

-- Submissions: staff read, admins delete. Inserts happen only through
-- submit_executive_profile(); review only through the two functions above.
alter table public.executive_submissions enable row level security;
revoke all on public.executive_submissions from public, anon, authenticated;
grant select, delete on public.executive_submissions to authenticated;
grant all on public.executive_submissions to service_role;

create policy executive_submissions_staff_read on public.executive_submissions
  for select to authenticated
  using ((select private.is_staff()));

create policy executive_submissions_admin_delete on public.executive_submissions
  for delete to authenticated
  using ((select private.is_admin()));

-- -----------------------------------------------------------------------------
-- Storage: a private bucket for submitted photos
-- -----------------------------------------------------------------------------

-- 5 MB is generous for the browser-resized copies (originals are limited to
-- 5 MB before resizing, in the form).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('executive-submissions', 'executive-submissions', false, 5242880, array['image/webp', 'image/jpeg'])
on conflict (id) do update
  set public = false,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists executive_submissions_upload on storage.objects;
drop policy if exists executive_submissions_staff_read on storage.objects;
drop policy if exists executive_submissions_admin_delete on storage.objects;

-- Visitors may only add files named <valid token>/<uuid>.(webp|jpg) or
-- <valid token>/<uuid>.thumb.(webp|jpg). There is no select, update or delete
-- policy for them, so they cannot read, list, replace or remove anything.
create policy executive_submissions_upload on storage.objects
  for insert to anon, authenticated
  with check (
    bucket_id = 'executive-submissions'
    and name ~ '^[a-f0-9]{64}/[0-9a-f-]{36}(\.thumb)?\.(webp|jpg)$'
    and private.invite_token_is_valid(split_part(name, '/', 1))
  );

create policy executive_submissions_staff_read on storage.objects
  for select to authenticated
  using (bucket_id = 'executive-submissions' and (select private.is_staff()));

create policy executive_submissions_admin_delete on storage.objects
  for delete to authenticated
  using (bucket_id = 'executive-submissions' and (select private.is_admin()));

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
