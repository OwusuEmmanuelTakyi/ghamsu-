-- =============================================================================
-- 0006_activity_custom_fields.sql
-- Extra registration questions per major activity. Run AFTER 0004 (and 0005),
-- in the Supabase SQL editor.
--
--   * activity_form_fields holds each activity's extra questions.
--   * activity_registrations.custom_answers holds the answers, keyed by the
--     question's id (not its label), so renaming a question keeps old answers.
--   * A question that already has answers is "removed" by setting deleted_at,
--     so its label stays available to show next to those answers.
--   * The database checks every answer on insert: required questions answered,
--     dropdown and checkbox answers among the allowed options, and the right
--     kind of value for each type. A browser can't get round these checks.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- Question definitions
-- -----------------------------------------------------------------------------

-- Options must be a JSON array of distinct, non-empty strings; only the
-- dropdown and checkbox types have (and need) them.
create function private.valid_field_options(p_type text, p_options jsonb)
returns boolean
language sql
immutable
set search_path = ''
as $$
  select case
    when p_options is null or jsonb_typeof(p_options) <> 'array' then false
    when p_type in ('dropdown', 'checkboxes') then
      jsonb_array_length(p_options) between 1 and 50
      and not exists (
        select 1 from jsonb_array_elements(p_options) o
        where jsonb_typeof(o) <> 'string'
           or btrim(o #>> '{}') = ''
           or o #>> '{}' <> btrim(o #>> '{}')
           or char_length(o #>> '{}') > 200
      )
      and (select count(distinct o #>> '{}') from jsonb_array_elements(p_options) o) = jsonb_array_length(p_options)
    else jsonb_array_length(p_options) = 0
  end
$$;

create table public.activity_form_fields (
  id          uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.major_activities (id) on delete cascade,
  label       text not null check (char_length(btrim(label)) between 1 and 200),
  field_type  text not null check (field_type in (
                'short_text', 'long_text', 'number', 'dropdown', 'checkboxes', 'yes_no', 'date', 'phone', 'email')),
  options     jsonb not null default '[]'::jsonb,
  required    boolean not null default false,
  help_text   text check (help_text is null or char_length(help_text) <= 300),
  sort_order  integer not null default 0,
  deleted_at  timestamptz,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint activity_form_fields_options_check check (private.valid_field_options(field_type, options))
);
comment on table public.activity_form_fields is
  'Extra registration questions for a major activity. deleted_at marks a question removed after people had answered it.';

create index activity_form_fields_activity_idx on public.activity_form_fields (activity_id, sort_order);

create trigger set_updated_at before update on public.activity_form_fields
  for each row execute function private.set_updated_at();

-- -----------------------------------------------------------------------------
-- Answers
-- -----------------------------------------------------------------------------

alter table public.activity_registrations
  add column custom_answers jsonb not null default '{}'::jsonb,
  add constraint activity_registrations_custom_answers_check
    check (jsonb_typeof(custom_answers) = 'object' and octet_length(custom_answers::text) <= 20000);

comment on column public.activity_registrations.custom_answers is
  'Answers to activity_form_fields, as { "<field id>": value }. Checked by validate_activity_custom_answers().';

-- Checks and cleans the answers. Runs after prepare_activity_registration
-- (triggers on the same event fire in name order), so the activity is
-- already known to be open. Each error names the question and carries its id
-- in DETAIL, so the form can highlight the right field.
create function private.validate_activity_custom_answers()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  answers jsonb := coalesce(new.custom_answers, '{}'::jsonb);
  cleaned jsonb := '{}'::jsonb;
  f       record;
  v       jsonb;
  t       text;
  digits  text;
  ok      boolean;
  answer_key text;
begin
  if jsonb_typeof(answers) <> 'object' then
    raise exception 'The answers to the extra questions are not in the expected format.'
      using errcode = '22023', hint = 'custom_invalid';
  end if;

  -- Answers to questions that don't exist (or were removed) are refused, so
  -- a stale or tampered form can't store arbitrary data.
  for answer_key in select jsonb_object_keys(answers) loop
    if not exists (
      select 1 from public.activity_form_fields ff
      where ff.activity_id = new.activity_id and ff.deleted_at is null and ff.id::text = answer_key
    ) then
      raise exception 'The questions on this form have changed. Please reload the page and try again.'
        using errcode = '22023', hint = 'custom_unknown_field';
    end if;
  end loop;

  for f in
    select ff.id, ff.label, ff.field_type, ff.options, ff.required
    from public.activity_form_fields ff
    where ff.activity_id = new.activity_id and ff.deleted_at is null
    order by ff.sort_order, ff.created_at
  loop
    v := answers -> f.id::text;

    -- Empty answers count as no answer.
    if v is null
       or jsonb_typeof(v) = 'null'
       or (jsonb_typeof(v) = 'string' and btrim(v #>> '{}') = '')
       or (jsonb_typeof(v) = 'array' and jsonb_array_length(v) = 0) then
      if f.required then
        raise exception 'Please answer "%".', f.label
          using errcode = '22023', hint = 'custom_required', detail = f.id::text;
      end if;
      continue;
    end if;

    case f.field_type
      when 'short_text', 'long_text' then
        if jsonb_typeof(v) <> 'string' then
          raise exception 'Please type an answer for "%".', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;
        t := btrim(v #>> '{}');
        if char_length(t) > (case when f.field_type = 'short_text' then 300 else 2000 end) then
          raise exception 'Your answer to "%" is too long.', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;
        v := to_jsonb(t);

      when 'number' then
        t := btrim(v #>> '{}');
        if jsonb_typeof(v) not in ('number', 'string') or t !~ '^-?[0-9]{1,12}(\.[0-9]{1,6})?$' then
          raise exception 'Please enter a number for "%".', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;
        v := to_jsonb(t::numeric);

      when 'dropdown' then
        if jsonb_typeof(v) <> 'string' or not (f.options ? (v #>> '{}')) then
          raise exception 'Please choose one of the options for "%".', f.label using errcode = '22023', hint = 'custom_option', detail = f.id::text;
        end if;

      when 'checkboxes' then
        if jsonb_typeof(v) <> 'array' or exists (
          select 1 from jsonb_array_elements(v) e
          where jsonb_typeof(e) <> 'string' or not (f.options ? (e #>> '{}'))
        ) then
          raise exception 'Please choose from the options for "%".', f.label using errcode = '22023', hint = 'custom_option', detail = f.id::text;
        end if;
        -- No duplicates, in the order the options are listed.
        select jsonb_agg(o.value order by o.ord) into v
        from jsonb_array_elements_text(f.options) with ordinality as o(value, ord)
        where v ? o.value;

      when 'yes_no' then
        if jsonb_typeof(v) <> 'boolean' then
          raise exception 'Please answer yes or no for "%".', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;

      when 'date' then
        t := v #>> '{}';
        ok := false;
        if jsonb_typeof(v) = 'string' and t ~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then
          begin
            -- Impossible dates such as 2026-02-30 fail the cast.
            ok := t::date between date '1900-01-01' and date '2100-12-31';
          exception when others then
            ok := false;
          end;
        end if;
        if not ok then
          raise exception 'Please enter a valid date for "%".', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;

      when 'phone' then
        digits := regexp_replace(coalesce(v #>> '{}', ''), '[^0-9]', '', 'g');
        if jsonb_typeof(v) <> 'string' then
          digits := '';
        end if;
        if digits ~ '^0[2-5][0-9]{8}$' then
          v := to_jsonb('+233' || substr(digits, 2));
        elsif digits ~ '^233[2-5][0-9]{8}$' then
          v := to_jsonb('+' || digits);
        else
          raise exception 'Please enter a valid Ghana phone number for "%".', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;

      when 'email' then
        t := lower(btrim(v #>> '{}'));
        if jsonb_typeof(v) <> 'string' or char_length(t) > 254 or t !~ '^[^\s@]+@[^\s@]+\.[^\s@]+$' then
          raise exception 'Please enter a valid email address for "%".', f.label using errcode = '22023', hint = 'custom_invalid', detail = f.id::text;
        end if;
        v := to_jsonb(t);
    end case;

    cleaned := cleaned || jsonb_build_object(f.id::text, v);
  end loop;

  new.custom_answers := cleaned;
  return new;
end;
$$;

-- 'validate_…' sorts after 'prepare_…', so this runs second.
create trigger validate_activity_custom_answers
  before insert on public.activity_registrations
  for each row execute function private.validate_activity_custom_answers();

-- -----------------------------------------------------------------------------
-- Privileges and row-level security
-- -----------------------------------------------------------------------------

revoke all on function private.valid_field_options(text, jsonb) from public, anon, authenticated;
grant execute on function private.valid_field_options(text, jsonb) to anon, authenticated, service_role;
revoke all on function private.validate_activity_custom_answers() from public, anon, authenticated;

-- Visitors may now also send answers (still no id or created_at).
grant insert (custom_answers) on public.activity_registrations to anon, authenticated;

alter table public.activity_form_fields enable row level security;
revoke all on public.activity_form_fields from public, anon, authenticated;
grant all on public.activity_form_fields to service_role;
grant select on public.activity_form_fields to anon, authenticated;
grant insert, update, delete on public.activity_form_fields to authenticated;

-- Visitors see the live questions of published activities, to build the form.
create policy activity_form_fields_public_read on public.activity_form_fields
  for select to anon, authenticated
  using (
    deleted_at is null
    and exists (
      select 1 from public.major_activities a
      where a.id = activity_id and a.status = 'published'::public.content_status
    )
  );

-- Staff (editors and admins) manage questions, as they manage activities.
create policy activity_form_fields_staff_read on public.activity_form_fields
  for select to authenticated
  using ((select private.is_staff()));

create policy activity_form_fields_staff_insert on public.activity_form_fields
  for insert to authenticated
  with check ((select private.is_staff()));

create policy activity_form_fields_staff_update on public.activity_form_fields
  for update to authenticated
  using ((select private.is_staff()))
  with check ((select private.is_staff()));

create policy activity_form_fields_staff_delete on public.activity_form_fields
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
