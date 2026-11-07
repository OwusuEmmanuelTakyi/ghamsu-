-- =============================================================================
-- 0004_activities_registration.sql
-- Major activities become event-like pages at /activities/:slug, with an
-- online registration form. Run AFTER 0001-0003, in the Supabase SQL editor.
--
-- Column notes
--   * major_activities.location is the venue (it already existed).
--   * major_activities.description stays the short summary used on cards;
--     the new body column holds the full rich-text description (TipTap JSON).
--   * The banner image uses the existing image_path / image_url / image_alt,
--     plus the new image_focus. Thumbnails follow the thumbs/<path> convention.
--
-- Every registration rule (published, open, before the deadline, not full,
-- one registration per phone number) is enforced here in the database, so it
-- holds no matter what a browser sends.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- New activity columns
-- -----------------------------------------------------------------------------

alter table public.major_activities
  add column slug                  text,
  add column starts_at             timestamptz,
  add column ends_at               timestamptz,
  add column image_focus           jsonb,
  add column body                  jsonb,
  add column fee_text              text,
  add column audience              text,
  add column contact_name          text,
  add column contact_phone         text,
  add column registration_open     boolean not null default false,
  add column registration_deadline timestamptz,
  add column capacity              integer;

-- Slugs for the activities seeded in 0003 (and any added since).
update public.major_activities
set slug = coalesce(
  nullif(trim(both '-' from lower(regexp_replace(title, '[^a-zA-Z0-9]+', '-', 'g'))), ''),
  'activity-' || left(id::text, 8)
)
where slug is null;

-- Make any accidental duplicates unique: second copy gets -2, and so on.
with numbered as (
  select id, slug, row_number() over (partition by slug order by created_at, id) as n
  from public.major_activities
)
update public.major_activities a
set slug = left(numbered.slug, 90) || '-' || numbered.n
from numbered
where a.id = numbered.id and numbered.n > 1;

alter table public.major_activities
  alter column slug set not null,
  add constraint major_activities_slug_key unique (slug),
  add constraint major_activities_slug_check
    check (slug = lower(slug) and slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and length(slug) <= 96),
  add constraint major_activities_dates_check
    check (ends_at is null or starts_at is null or ends_at >= starts_at),
  add constraint major_activities_body_check
    check (body is null or (jsonb_typeof(body) = 'object' and body ->> 'type' = 'doc')),
  add constraint major_activities_capacity_check
    check (capacity is null or capacity > 0);

comment on column public.major_activities.location is 'The venue.';
comment on column public.major_activities.description is 'Short summary for cards.';
comment on column public.major_activities.body is 'Full description (TipTap JSON) for /activities/:slug.';

-- -----------------------------------------------------------------------------
-- Registrations
-- -----------------------------------------------------------------------------

create table public.activity_registrations (
  id               uuid primary key default gen_random_uuid(),
  activity_id      uuid not null references public.major_activities (id) on delete cascade,
  full_name        text not null check (char_length(full_name) between 2 and 120),
  -- Stored as +233 followed by 9 digits; the trigger below normalises input.
  phone            text not null check (phone ~ '^\+233[2-5][0-9]{8}$'),
  email            text not null check (char_length(email) <= 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  gender           text not null check (gender in ('male', 'female')),
  local            text not null check (char_length(local) between 2 and 150),
  diocese          text not null check (char_length(diocese) between 2 and 100),
  level            text not null check (char_length(level) between 1 and 60),
  role             text not null check (role in ('member', 'executive', 'patron', 'guest')),
  how_did_you_hear text check (how_did_you_hear is null or char_length(how_did_you_hear) <= 100),
  notes            text check (notes is null or char_length(notes) <= 1000),
  created_at       timestamptz not null default now(),
  constraint activity_registrations_one_per_phone unique (activity_id, phone)
);
comment on table public.activity_registrations is
  'Sign-ups for major activities. Visitors can only insert, under the rules in prepare_activity_registration().';

create index activity_registrations_activity_idx on public.activity_registrations (activity_id, created_at desc);

-- Whether an activity accepts registrations right now. Also used by the policy.
create function private.activity_accepts_registrations(p_activity_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.major_activities a
    where a.id = p_activity_id
      and a.status = 'published'::public.content_status
      and a.registration_open
      and (a.registration_deadline is null or now() <= a.registration_deadline)
      and (a.capacity is null or (
        select count(*) from public.activity_registrations r where r.activity_id = a.id
      ) < a.capacity)
  )
$$;

-- Normalises the input and enforces the rules with a clear message for each
-- case. Locking the activity row serialises sign-ups, so the capacity can't be
-- exceeded by two people registering at the same moment.
create function private.prepare_activity_registration()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  activity record;
  taken integer;
  digits text;
begin
  digits := regexp_replace(coalesce(new.phone, ''), '[^0-9]', '', 'g');
  if digits ~ '^0[2-5][0-9]{8}$' then
    new.phone := '+233' || substr(digits, 2);
  elsif digits ~ '^233[2-5][0-9]{8}$' then
    new.phone := '+' || digits;
  else
    raise exception 'Please enter a valid Ghana phone number, for example 024 123 4567 or +233 24 123 4567.'
      using errcode = '22023', hint = 'invalid_phone';
  end if;

  new.full_name        := btrim(regexp_replace(coalesce(new.full_name, ''), '\s+', ' ', 'g'));
  new.email            := lower(btrim(coalesce(new.email, '')));
  new.gender           := lower(btrim(coalesce(new.gender, '')));
  new.local            := btrim(coalesce(new.local, ''));
  new.diocese          := btrim(coalesce(new.diocese, ''));
  new.level            := btrim(coalesce(new.level, ''));
  new.role             := lower(btrim(coalesce(new.role, '')));
  new.how_did_you_hear := nullif(btrim(coalesce(new.how_did_you_hear, '')), '');
  new.notes            := nullif(btrim(coalesce(new.notes, '')), '');
  new.created_at       := now();

  select a.status, a.registration_open, a.registration_deadline, a.capacity
  into activity
  from public.major_activities a
  where a.id = new.activity_id
  for update;

  if not found or activity.status <> 'published'::public.content_status then
    raise exception 'This activity is not open for registration.'
      using errcode = 'P0001', hint = 'registration_unavailable';
  end if;
  if not activity.registration_open then
    raise exception 'Registration for this activity is closed.'
      using errcode = 'P0001', hint = 'registration_closed';
  end if;
  if activity.registration_deadline is not null and now() > activity.registration_deadline then
    raise exception 'The registration deadline for this activity has passed.'
      using errcode = 'P0001', hint = 'registration_deadline';
  end if;
  if activity.capacity is not null then
    select count(*) into taken from public.activity_registrations r where r.activity_id = new.activity_id;
    if taken >= activity.capacity then
      raise exception 'Sorry, this activity is full.'
        using errcode = 'P0001', hint = 'registration_full';
    end if;
  end if;

  return new;
end;
$$;

create trigger prepare_activity_registration
  before insert on public.activity_registrations
  for each row execute function private.prepare_activity_registration();

-- For the public page: is registration open, and if not, why. spots_left is
-- only set when the activity has a capacity. Reveals no personal data.
create function public.activity_registration_status(p_activity_id uuid)
returns table (is_open boolean, reason text, spots_left integer)
language sql
stable
security definer
set search_path = ''
as $$
  with a as (
    select
      ma.registration_open,
      ma.registration_deadline,
      ma.capacity,
      (select count(*)::integer from public.activity_registrations r where r.activity_id = ma.id) as taken
    from public.major_activities ma
    where ma.id = p_activity_id
      and ma.status = 'published'::public.content_status
  )
  select
    a.registration_open
      and (a.registration_deadline is null or now() <= a.registration_deadline)
      and (a.capacity is null or a.taken < a.capacity),
    case
      when not a.registration_open then 'closed'
      when a.registration_deadline is not null and now() > a.registration_deadline then 'deadline'
      when a.capacity is not null and a.taken >= a.capacity then 'full'
    end,
    case when a.capacity is null then null else greatest(a.capacity - a.taken, 0) end
  from a
$$;

-- -----------------------------------------------------------------------------
-- Privileges and row-level security
-- -----------------------------------------------------------------------------

revoke all on function private.activity_accepts_registrations(uuid) from public, anon, authenticated;
revoke all on function private.prepare_activity_registration() from public, anon, authenticated;
grant execute on function private.activity_accepts_registrations(uuid) to anon, authenticated, service_role;
grant usage on schema private to anon;

revoke all on function public.activity_registration_status(uuid) from public, anon, authenticated;
grant execute on function public.activity_registration_status(uuid) to anon, authenticated, service_role;

alter table public.activity_registrations enable row level security;
revoke all on public.activity_registrations from public, anon, authenticated;
grant all on public.activity_registrations to service_role;

-- Visitors may only insert, and only these columns: never id or created_at.
grant insert (activity_id, full_name, phone, email, gender, local, diocese, level, role, how_did_you_hear, notes)
  on public.activity_registrations to anon, authenticated;
grant select, delete on public.activity_registrations to authenticated;

-- Second layer behind the trigger above.
create policy activity_registrations_public_insert on public.activity_registrations
  for insert to anon, authenticated
  with check (private.activity_accepts_registrations(activity_id));

-- No select, update or delete policy for visitors: they can never read back
-- anyone's registration, including their own.
create policy activity_registrations_staff_read on public.activity_registrations
  for select to authenticated
  using ((select private.is_staff()));

create policy activity_registrations_admin_delete on public.activity_registrations
  for delete to authenticated
  using ((select private.is_admin()));

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
