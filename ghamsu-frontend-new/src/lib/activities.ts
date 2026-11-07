// Shared helpers for major activities and their registration form.
import { supabase } from './supabase'
import type { MajorActivity } from '../types/types'

// ─── Dates ─────────────────────────────────────────────────────────────────────

const dateFormat: Intl.DateTimeFormatOptions = { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
const timeFormat: Intl.DateTimeFormatOptions = { hour: 'numeric', minute: '2-digit', hour12: true }

const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString()

/** "Sat, 14 Mar 2026", falling back to the free-text date. */
export function activityDate(activity: MajorActivity): string | null {
  if (!activity.startsAt) return activity.dateText
  const start = new Date(activity.startsAt)
  const end = activity.endsAt ? new Date(activity.endsAt) : null
  const first = start.toLocaleDateString('en-GB', dateFormat)
  if (!end || sameDay(start, end)) return first
  return `${first} – ${end.toLocaleDateString('en-GB', dateFormat)}`
}

/**
 * "9:00 am – 4:00 pm" for a one-day activity. For several days the date row
 * already shows the range, so this says when it starts and ends instead.
 */
export function activityTime(activity: MajorActivity): string | null {
  if (!activity.startsAt) return null
  const startDate = new Date(activity.startsAt)
  const start = startDate.toLocaleTimeString('en-GB', timeFormat)
  if (!activity.endsAt) return start
  const endDate = new Date(activity.endsAt)
  const end = endDate.toLocaleTimeString('en-GB', timeFormat)
  if (!sameDay(startDate, endDate)) return `Starts ${start}, ends ${end}`
  return start === end ? start : `${start} – ${end}`
}

export function formatDeadline(iso: string): string {
  const date = new Date(iso)
  return `${date.toLocaleDateString('en-GB', dateFormat)}, ${date.toLocaleTimeString('en-GB', timeFormat)}`
}

/**
 * Over once its end has passed. With only a start date, it counts as running
 * until the end of that day. Activities without a date never end.
 */
export function hasEnded(activity: MajorActivity, now = new Date()): boolean {
  if (activity.endsAt) return new Date(activity.endsAt) < now
  if (!activity.startsAt) return false
  const endOfDay = new Date(activity.startsAt)
  endOfDay.setHours(23, 59, 59, 999)
  return endOfDay < now
}

/** Upcoming first (soonest first, undated last), then ended ones (most recent first). */
export function splitActivities(activities: MajorActivity[], now = new Date()) {
  const time = (a: MajorActivity) => (a.startsAt ? new Date(a.startsAt).getTime() : Number.POSITIVE_INFINITY)
  // Equal times (including two undated) keep the admin's display order.
  const byTime = (a: MajorActivity, b: MajorActivity) => (time(a) === time(b) ? 0 : time(a) - time(b))
  const upcoming = activities.filter((a) => !hasEnded(a, now)).sort(byTime)
  const past = activities.filter((a) => hasEnded(a, now)).sort((a, b) => byTime(b, a))
  return { upcoming, past }
}

/** "Title\nSat, 14 Mar 2026 · Venue\nhttps://…" for share buttons. */
export function activityShareText(activity: MajorActivity, url: string): string {
  const when = [activityDate(activity), activity.location].filter(Boolean).join(' · ')
  return [activity.title, when, url].filter(Boolean).join('\n')
}

/** Open according to the activity's own fields. Capacity is checked separately. */
export function isRegistrationOpen(activity: MajorActivity, now = new Date()): boolean {
  if (!activity.registrationOpen) return false
  return !activity.registrationDeadline || new Date(activity.registrationDeadline) >= now
}

// ─── Ghana phone numbers ───────────────────────────────────────────────────────

/** 024 123 4567, +233 24 123 4567 or 233241234567 → +233241234567. null if invalid. */
export function normalizeGhanaPhone(input: string): string | null {
  const digits = input.replace(/\D/g, '')
  if (/^0[2-5]\d{8}$/.test(digits)) return `+233${digits.slice(1)}`
  if (/^233[2-5]\d{8}$/.test(digits)) return `+${digits}`
  return null
}

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

// ─── Registration ──────────────────────────────────────────────────────────────

export interface RegistrationInput {
  full_name: string
  phone: string
  email: string
  gender: string
  local: string
  diocese: string
  level: string
  role: string
  how_did_you_hear: string
  notes: string
}

export const ROLE_OPTIONS = [
  { value: 'member', label: 'Member' },
  { value: 'executive', label: 'Executive' },
  { value: 'patron', label: 'Patron' },
  { value: 'guest', label: 'Guest' },
]

export const HEARD_OPTIONS = [
  'WhatsApp', 'Facebook', 'Instagram', 'TikTok', 'A friend', 'My local executives', 'Church announcement', 'GHAMSU website', 'Other',
]

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

/** Same rules as the database; returns a message per invalid field. */
export function validateRegistration(input: RegistrationInput): Record<string, string> {
  const errors: Record<string, string> = {}
  const name = input.full_name.trim()
  if (name.length < 2) errors.full_name = 'Please enter your full name.'
  else if (name.length > 120) errors.full_name = 'Please shorten your name to 120 characters.'
  if (!input.phone.trim()) errors.phone = 'Please enter your phone number.'
  else if (!normalizeGhanaPhone(input.phone)) errors.phone = 'Enter a Ghana number, for example 024 123 4567 or +233 24 123 4567.'
  if (!input.email.trim()) errors.email = 'Please enter your email address.'
  else if (!EMAIL.test(input.email.trim()) || input.email.trim().length > 254) errors.email = "That doesn't look like a valid email address."
  if (!['male', 'female'].includes(input.gender)) errors.gender = 'Please choose one.'
  if (input.local.trim().length < 2) errors.local = 'Please enter your local, campus or institution.'
  else if (input.local.trim().length > 150) errors.local = 'Please keep this under 150 characters.'
  if (input.diocese.trim().length < 2) errors.diocese = 'Please enter your diocese.'
  else if (input.diocese.trim().length > 100) errors.diocese = 'Please keep this under 100 characters.'
  if (!input.level.trim()) errors.level = 'Please enter your level or year.'
  else if (input.level.trim().length > 60) errors.level = 'Please keep this under 60 characters.'
  if (!ROLE_OPTIONS.some((r) => r.value === input.role)) errors.role = 'Please choose one.'
  if (input.notes.trim().length > 1000) errors.notes = 'Please keep your note under 1,000 characters.'
  return errors
}

// ─── Extra questions (migration 0006) ──────────────────────────────────────────

export type CustomFieldType =
  | 'short_text' | 'long_text' | 'number' | 'dropdown' | 'checkboxes' | 'yes_no' | 'date' | 'phone' | 'email'

export interface CustomField {
  id: string
  label: string
  field_type: CustomFieldType
  options: string[]
  required: boolean
  help_text: string | null
  sort_order: number
  deleted_at?: string | null
}

export const FIELD_TYPES: { value: CustomFieldType; label: string }[] = [
  { value: 'short_text', label: 'Short text' },
  { value: 'long_text', label: 'Long text' },
  { value: 'number', label: 'Number' },
  { value: 'dropdown', label: 'Dropdown' },
  { value: 'checkboxes', label: 'Multiple choice (checkboxes)' },
  { value: 'yes_no', label: 'Yes / no' },
  { value: 'date', label: 'Date' },
  { value: 'phone', label: 'Phone' },
  { value: 'email', label: 'Email' },
]

export const hasOptions = (type: CustomFieldType) => type === 'dropdown' || type === 'checkboxes'

/** In the form: text for most types, a list for checkboxes, 'yes' / 'no' / '' for yes/no. */
export type CustomAnswers = Record<string, string | string[]>

/** The live questions for an activity's form. Empty if there are none (or 0006 isn't applied). */
export async function fetchCustomFields(activityId: string): Promise<CustomField[]> {
  if (!supabase) return []
  const { data, error } = await supabase
    .from('activity_form_fields')
    .select('id, label, field_type, options, required, help_text, sort_order')
    .eq('activity_id', activityId)
    .is('deleted_at', null)
    .order('sort_order')
    .order('created_at')
  return error ? [] : ((data ?? []) as CustomField[])
}

const isEmpty = (value: string | string[] | undefined) =>
  value === undefined || (Array.isArray(value) ? value.length === 0 : value.trim() === '')

/** Same rules as validate_activity_custom_answers() in the database. Errors are keyed by field id. */
export function validateCustomAnswers(fields: CustomField[], answers: CustomAnswers): Record<string, string> {
  const errors: Record<string, string> = {}
  for (const field of fields) {
    const value = answers[field.id]
    if (isEmpty(value)) {
      if (field.required) errors[field.id] = field.field_type === 'checkboxes' ? 'Please choose at least one.' : field.field_type === 'dropdown' || field.field_type === 'yes_no' ? 'Please choose one.' : 'Please answer this question.'
      continue
    }
    const text = Array.isArray(value) ? '' : value.trim()
    switch (field.field_type) {
      case 'short_text': if (text.length > 300) errors[field.id] = 'Please keep this under 300 characters.'; break
      case 'long_text': if (text.length > 2000) errors[field.id] = 'Please keep this under 2,000 characters.'; break
      case 'number': if (!/^-?\d{1,12}(\.\d{1,6})?$/.test(text)) errors[field.id] = 'Please enter a number.'; break
      case 'dropdown': if (!field.options.includes(text)) errors[field.id] = 'Please choose one of the options.'; break
      case 'checkboxes': if (!Array.isArray(value) || value.some((v) => !field.options.includes(v))) errors[field.id] = 'Please choose from the options.'; break
      case 'yes_no': if (text !== 'yes' && text !== 'no') errors[field.id] = 'Please choose yes or no.'; break
      case 'date': {
        const parsed = new Date(`${text}T00:00:00Z`)
        if (!/^\d{4}-\d{2}-\d{2}$/.test(text) || Number.isNaN(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== text
          || text < '1900-01-01' || text > '2100-12-31') errors[field.id] = 'Please enter a valid date.'
        break
      }
      case 'phone': if (!normalizeGhanaPhone(text)) errors[field.id] = 'Enter a Ghana number, for example 024 123 4567.'; break
      case 'email': if (!EMAIL.test(text) || text.length > 254) errors[field.id] = "That doesn't look like a valid email address."; break
    }
  }
  return errors
}

/** The JSON sent to the database: only answered questions, with the right value types. */
export function customAnswersPayload(fields: CustomField[], answers: CustomAnswers): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const field of fields) {
    const value = answers[field.id]
    if (isEmpty(value)) continue
    if (field.field_type === 'checkboxes') out[field.id] = value
    else if (field.field_type === 'yes_no') out[field.id] = value === 'yes'
    else if (field.field_type === 'number') out[field.id] = Number((value as string).trim())
    else if (field.field_type === 'phone') out[field.id] = normalizeGhanaPhone(value as string) ?? (value as string).trim()
    else if (field.field_type === 'email') out[field.id] = (value as string).trim().toLowerCase()
    else out[field.id] = (value as string).trim()
  }
  return out
}

/** How a stored answer reads in the admin list and CSV. */
export function formatAnswer(value: unknown): string {
  if (value === undefined || value === null) return ''
  if (typeof value === 'boolean') return value ? 'Yes' : 'No'
  if (Array.isArray(value)) return value.join('; ')
  return String(value)
}

export type RegistrationResult =
  | { ok: true }
  | { ok: false; message: string; field?: keyof RegistrationInput; customField?: string; reload?: boolean; closed?: boolean }

/**
 * Sends a registration. The database decides whether it is accepted (open,
 * before the deadline, not full, not a duplicate, extra questions answered
 * properly); this only explains why not.
 */
export async function submitRegistration(
  activityId: string,
  input: RegistrationInput,
  custom?: { fields: CustomField[]; answers: CustomAnswers },
): Promise<RegistrationResult> {
  if (!supabase) return { ok: false, message: 'Registration is unavailable right now. Please try again later.' }
  const clean = (value: string) => value.trim()
  // Only sent when the activity has extra questions, so the form keeps
  // working on a database without migration 0006.
  const answers = custom?.fields.length ? { custom_answers: customAnswersPayload(custom.fields, custom.answers) } : {}
  // No .select(): visitors may add a registration but never read one back.
  const { error } = await supabase.from('activity_registrations').insert({
    ...answers,
    activity_id: activityId,
    full_name: clean(input.full_name),
    phone: normalizeGhanaPhone(input.phone) ?? clean(input.phone),
    email: clean(input.email).toLowerCase(),
    gender: input.gender,
    local: clean(input.local),
    diocese: clean(input.diocese),
    level: clean(input.level),
    role: input.role,
    how_did_you_hear: clean(input.how_did_you_hear) || null,
    notes: clean(input.notes) || null,
  })
  if (!error) return { ok: true }

  const text = `${error.message} ${error.details ?? ''} ${error.hint ?? ''}`
  if (error.code === '23505' || /one_per_phone/.test(text)) {
    return { ok: false, field: 'phone', message: 'This phone number is already registered for this activity. You only need to register once.' }
  }
  if (/custom_unknown_field/.test(text)) {
    return { ok: false, reload: true, message: 'The questions on this form have changed. Please reload the page and try again.' }
  }
  if (/custom_(required|option|invalid)/.test(text)) {
    // The database names the question in the message and gives its id in details.
    return { ok: false, customField: error.details || undefined, message: error.message }
  }
  if (/invalid_phone|valid Ghana phone/.test(text)) {
    return { ok: false, field: 'phone', message: 'Enter a Ghana number, for example 024 123 4567 or +233 24 123 4567.' }
  }
  if (/registration_full|is full/.test(text)) return { ok: false, closed: true, message: 'Sorry, this activity is now full.' }
  if (/registration_deadline|deadline/.test(text)) return { ok: false, closed: true, message: 'Sorry, the registration deadline has passed.' }
  if (/registration_closed|registration_unavailable|row-level security|42501/.test(`${text} ${error.code}`)) {
    return { ok: false, closed: true, message: 'Registration for this activity is closed.' }
  }
  if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
    return { ok: false, message: "We couldn't reach the server. Check your internet connection and try again." }
  }
  console.error('[registration]', error)
  return { ok: false, message: 'Something went wrong and your registration was not saved. Please try again.' }
}

export interface RegistrationStatus {
  isOpen: boolean
  reason: 'closed' | 'deadline' | 'full' | null
  spotsLeft: number | null
}

/** Live status from the database (includes capacity, which the page cannot count). */
export async function fetchRegistrationStatus(activityId: string): Promise<RegistrationStatus | null> {
  if (!supabase) return null
  const { data, error } = await supabase.rpc('activity_registration_status', { p_activity_id: activityId })
  if (error || !data?.length) return null
  const row = data[0]
  return { isOpen: Boolean(row.is_open), reason: row.reason ?? null, spotsLeft: row.spots_left ?? null }
}
