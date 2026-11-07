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

export type RegistrationResult =
  | { ok: true }
  | { ok: false; message: string; field?: keyof RegistrationInput; closed?: boolean }

/**
 * Sends a registration. The database decides whether it is accepted (open,
 * before the deadline, not full, not a duplicate); this only explains why not.
 */
export async function submitRegistration(activityId: string, input: RegistrationInput): Promise<RegistrationResult> {
  if (!supabase) return { ok: false, message: 'Registration is unavailable right now. Please try again later.' }
  const clean = (value: string) => value.trim()
  // No .select(): visitors may add a registration but never read one back.
  const { error } = await supabase.from('activity_registrations').insert({
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
