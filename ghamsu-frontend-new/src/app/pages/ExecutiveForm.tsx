import { useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { CheckCircle2, ImagePlus, Loader2, RefreshCw } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { normalizeGhanaPhone } from '../../lib/activities'
import { checkImageFile, makeImageCopies, type ImageCopies } from '../../lib/imageResize'

// Public form for executives to submit their own profile. Reached through a
// link an admin shares; an admin approves each profile before it is shown.

const MAX_PHOTO_BYTES = 5 * 1024 * 1024
const BUCKET = 'executive-submissions'
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const CATEGORIES = [
  { value: 'connexional', label: 'Connexional Executive' },
  { value: 'Connexional Boards', label: 'Connexional Board' },
  { value: 'Diocese', label: 'Diocesan Executive' },
  { value: 'local', label: 'Local Executive' },
]

interface LinkInfo {
  isValid: boolean
  label: string
  presetCategory: string | null
  boardTitle: string | null
}

interface Values {
  full_name: string
  position: string
  category: string
  location: string
  phone: string
  email: string
  whatsapp: string
  bio: string
  consent: boolean
  show_phone: boolean
  show_email: boolean
}

const EMPTY: Values = {
  full_name: '', position: '', category: '', location: '', phone: '', email: '', whatsapp: '', bio: '',
  consent: false, show_phone: false, show_email: false,
}

/** 024 123 4567 → 233241234567 (WhatsApp links use digits with the country code). */
function whatsappDigits(input: string): string | null {
  const normalized = normalizeGhanaPhone(input)
  return normalized ? normalized.slice(1) : null
}

// Keeps search engines away from these private links.
function useNoIndex() {
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    const previous = meta?.content
    if (meta) meta.content = 'noindex, nofollow'
    const previousTitle = document.title
    document.title = 'Executive profile · GHAMSU'
    return () => {
      if (meta && previous !== undefined) meta.content = previous
      document.title = previousTitle
    }
  }, [])
}

export default function ExecutiveForm() {
  const { token = '' } = useParams<{ token: string }>()
  const [info, setInfo] = useState<LinkInfo | null | undefined>(undefined)
  const [done, setDone] = useState(false)
  useNoIndex()

  useEffect(() => {
    let cancelled = false
    async function load() {
      if (!supabase || !/^[a-f0-9]{64}$/.test(token)) return setInfo(null)
      const { data, error } = await supabase.rpc('executive_invite_info', { p_token: token })
      if (cancelled) return
      const row = !error && data?.[0]
      setInfo(row ? { isValid: Boolean(row.is_valid), label: row.label, presetCategory: row.preset_category, boardTitle: row.board_title } : null)
    }
    load()
    return () => { cancelled = true }
  }, [token])

  return (
    <div className="min-h-screen bg-secondary/40 px-4 pb-24 pt-32 sm:pt-36">
      <div className="mx-auto max-w-2xl">
        {info === undefined ? (
          <div className="flex justify-center py-24"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" /></div>
        ) : !info || !info.isValid ? (
          <Inactive />
        ) : done ? (
          <Success />
        ) : (
          <>
            <header className="mb-8 text-center">
              <div className="mx-auto mb-4 h-px w-12 bg-accent" aria-hidden="true" />
              <p className="mb-2 text-xs font-semibold uppercase tracking-[0.3em] text-accent">{info.label}</p>
              <h1 className="mb-3 text-3xl tracking-tight sm:text-4xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
                Your executive profile
              </h1>
              <p className="text-sm text-muted-foreground sm:text-base">
                Fill this in to appear on the GHAMSU website. An admin checks every profile before it is shown.
              </p>
            </header>
            <ProfileForm token={token} info={info} onDone={() => { setDone(true); window.scrollTo({ top: 0, behavior: 'smooth' }) }} />
          </>
        )}
      </div>
    </div>
  )
}

function Card({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">{children}</div>
}

function Inactive() {
  return (
    <Card>
      <div className="py-6 text-center">
        <h1 className="mb-3 text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          This link is no longer active
        </h1>
        <p className="mb-6 text-muted-foreground">
          It may have expired or already been used by everyone it was meant for. Please contact the GHAMSU office for a new link.
        </p>
        <Link to="/contact" className="inline-flex rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90">
          Contact the GHAMSU office
        </Link>
      </div>
    </Card>
  )
}

function Success() {
  return (
    <Card>
      <div className="py-6 text-center" role="status">
        <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden="true" />
        <h1 className="mb-3 text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          Thank you, your profile has been sent
        </h1>
        <p className="mb-6 text-muted-foreground">
          It will appear on the website once an admin has approved it. If anything needs changing, they will be in touch.
        </p>
        <Link to="/" className="inline-flex rounded-lg border border-border px-6 py-3 font-medium hover:border-accent">
          Go to the GHAMSU website
        </Link>
      </div>
    </Card>
  )
}

const inputClass = 'w-full rounded-lg border bg-secondary px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none sm:py-3'

function ProfileForm({ token, info, onDone }: { token: string; info: LinkInfo; onDone: () => void }) {
  const [values, setValues] = useState<Values>(EMPTY)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [photo, setPhoto] = useState<{ copies: ImageCopies; preview: string } | null>(null)
  const [preparing, setPreparing] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)
  const honeypot = useRef<HTMLInputElement>(null)

  useEffect(() => () => { if (photo) URL.revokeObjectURL(photo.preview) }, [photo])

  const set = <K extends keyof Values>(name: K, value: Values[K]) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    setFormError(null)
    setErrors((prev) => { const next = { ...prev }; delete next[name]; return next })
  }

  const pickPhoto = async (file?: File) => {
    if (!file) return
    const problem = checkImageFile(file, MAX_PHOTO_BYTES)
    if (problem) return setErrors((prev) => ({ ...prev, photo: problem }))
    setPreparing(true)
    try {
      const copies = await makeImageCopies(file)
      setPhoto({ copies, preview: URL.createObjectURL(copies.thumb.blob) })
      setErrors((prev) => { const next = { ...prev }; delete next.photo; return next })
    } catch {
      setErrors((prev) => ({ ...prev, photo: "We couldn't read that image. Please try another photo." }))
    } finally {
      setPreparing(false)
      if (fileInput.current) fileInput.current.value = ''
    }
  }

  const validate = () => {
    const found: Record<string, string> = {}
    const len = (v: string) => v.trim().length
    if (len(values.full_name) < 2) found.full_name = 'Please enter your full name.'
    if (len(values.position) < 2) found.position = 'Please enter your position.'
    if (!info.presetCategory && !values.category) found.category = 'Please choose one.'
    if (len(values.location) < 2) found.location = 'Please enter your diocese, local or institution.'
    if (!normalizeGhanaPhone(values.phone)) found.phone = 'Enter a Ghana number, for example 024 123 4567 or +233 24 123 4567.'
    if (!EMAIL.test(values.email.trim())) found.email = 'Please enter a valid email address.'
    if (values.whatsapp.trim() && !whatsappDigits(values.whatsapp)) found.whatsapp = 'Enter a Ghana number, or leave this empty.'
    if (len(values.bio) > 1000) found.bio = 'Please keep your bio under 1,000 characters.'
    if (!photo) found.photo = 'Please add a photo of yourself.'
    if (!values.consent) found.consent = 'Please tick this box so we can show your profile.'
    return found
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    setFormError(null)
    // Bots fill every field, including this hidden one. Pretend it worked.
    if (honeypot.current?.value) return onDone()

    const found = validate()
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please check the highlighted fields.')
      document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
      return
    }
    if (!supabase || !photo) return

    setSubmitting(true)
    try {
      // Photos go into this link's folder of the private bucket.
      const id = crypto.randomUUID()
      const ext = photo.copies.extension
      const photoPath = `${token}/${id}.${ext}`
      const thumbPath = `${token}/${id}.thumb.${ext}`
      const storage = supabase.storage.from(BUCKET)
      const options = { contentType: photo.copies.contentType, upsert: false }
      const fullUpload = await storage.upload(photoPath, photo.copies.full.blob, options)
      if (fullUpload.error) throw fullUpload.error
      const thumbUpload = await storage.upload(thumbPath, photo.copies.thumb.blob, options)

      const { error } = await supabase.rpc('submit_executive_profile', {
        p_token: token,
        p_submission: {
          full_name: values.full_name.trim(),
          position: values.position.trim(),
          category: info.presetCategory ?? values.category,
          location: values.location.trim(),
          phone: normalizeGhanaPhone(values.phone),
          email: values.email.trim().toLowerCase(),
          whatsapp: values.whatsapp.trim() ? whatsappDigits(values.whatsapp) : null,
          bio: values.bio.trim() || null,
          photo_path: photoPath,
          photo_thumb_path: thumbUpload.error ? null : thumbPath,
          consent: values.consent,
          show_phone: values.show_phone,
          show_email: values.show_email,
        },
      })
      if (error) throw error
      onDone()
    } catch (error: any) {
      const text = `${error?.message ?? ''} ${error?.hint ?? ''}`
      if (/duplicate_pending|already waiting/.test(text)) {
        setErrors((prev) => ({ ...prev, phone: 'A profile with this phone number is already waiting for approval.' }))
        setFormError('You have already sent your profile. It will appear once an admin approves it.')
      } else if (/link_inactive|link_full|no longer active|row-level security|Unauthorized|403/.test(text)) {
        setFormError('This link is no longer active. Please contact the GHAMSU office for a new link.')
      } else if (/exceeded the maximum|too large/i.test(text)) {
        setErrors((prev) => ({ ...prev, photo: 'That photo is too large. Please choose a smaller one.' }))
      } else if (/Failed to fetch|NetworkError|Load failed/i.test(text)) {
        setFormError("We couldn't reach the server. Check your internet connection and try again.")
      } else {
        console.error('[executive form]', error)
        setFormError('Something went wrong and your profile was not sent. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  const field = (name: keyof Values | 'photo', label: string, control: ReactNode, required = true, hint?: string) => (
    <div className="space-y-1.5">
      <label htmlFor={`ex-${name}`} className="block text-sm font-medium">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {control}
      {hint && !errors[name] && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors[name] && <p id={`ex-${name}-error`} className="text-sm text-destructive">{errors[name]}</p>}
    </div>
  )

  const text = (name: keyof Values, extra: Record<string, unknown> = {}) => ({
    id: `ex-${name}`,
    name,
    value: values[name] as string,
    'aria-invalid': errors[name] ? true : undefined,
    'aria-describedby': errors[name] ? `ex-${name}-error` : undefined,
    className: `${inputClass} ${errors[name] ? 'border-destructive' : 'border-border'}`,
    onChange: (event: { target: { value: string } }) => set(name, event.target.value as never),
    ...extra,
  })

  return (
    <Card>
      <form onSubmit={submit} noValidate className="space-y-5">
        <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
          <label htmlFor="ex-website">Website</label>
          <input ref={honeypot} id="ex-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
        </div>

        {/* Photo */}
        <div className="space-y-2">
          <label htmlFor="ex-photo" className="block text-sm font-medium">Your photo <span className="text-destructive">*</span></label>
          <input ref={fileInput} id="ex-photo" type="file" accept="image/*" className="sr-only"
            aria-invalid={errors.photo ? true : undefined} onChange={(event) => pickPhoto(event.target.files?.[0])} />
          {photo ? (
            <div className="flex items-center gap-4">
              <img src={photo.preview} alt="Your photo" className="h-28 w-24 rounded-lg object-cover" />
              <button type="button" onClick={() => fileInput.current?.click()} disabled={preparing}
                className="inline-flex items-center gap-2 rounded-lg border border-border px-4 py-2 text-sm hover:border-accent">
                <RefreshCw className="h-4 w-4" /> Choose another
              </button>
            </div>
          ) : (
            <button type="button" onClick={() => fileInput.current?.click()} disabled={preparing}
              className={`flex h-32 w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed text-sm text-muted-foreground hover:border-accent ${errors.photo ? 'border-destructive' : 'border-border'}`}>
              {preparing ? <Loader2 className="h-6 w-6 animate-spin" /> : <ImagePlus className="h-6 w-6" />}
              {preparing ? 'Preparing your photo…' : 'Choose a clear photo of yourself'}
            </button>
          )}
          {!errors.photo && <p className="text-xs text-muted-foreground">A JPEG, PNG or WebP image up to 5 MB.</p>}
          {errors.photo && <p className="text-sm text-destructive">{errors.photo}</p>}
        </div>

        {field('full_name', 'Full name', <input {...text('full_name', { autoComplete: 'name', maxLength: 120 })} />)}
        {field('position', 'Position', <input {...text('position', { maxLength: 120, placeholder: 'General Secretary' })} />)}
        {!info.presetCategory && field('category', 'Category',
          <select {...text('category')}>
            <option value="">Choose…</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>)}
        {info.boardTitle && <p className="rounded-lg bg-secondary p-3 text-sm">This profile is for the <strong>{info.boardTitle}</strong>.</p>}
        {field('location', 'Diocese, local or institution', <input {...text('location', { maxLength: 150, placeholder: 'Accra Diocese' })} />)}
        <div className="grid gap-5 sm:grid-cols-2">
          {field('phone', 'Phone number', <input {...text('phone', { type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '024 123 4567' })} />)}
          {field('whatsapp', 'WhatsApp number', <input {...text('whatsapp', { type: 'tel', inputMode: 'tel', placeholder: '024 123 4567' })} />, false, 'Leave empty if you don\'t use WhatsApp.')}
        </div>
        {field('email', 'Email', <input {...text('email', { type: 'email', inputMode: 'email', autoComplete: 'email', maxLength: 254 })} />)}
        {field('bio', 'Short bio', <textarea {...text('bio', { rows: 4, maxLength: 1000 })} className={`${text('bio').className} resize-none`} />, false,
          'A few sentences about yourself. Optional.')}

        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="px-1 text-sm font-medium">On the website</legend>
          <Toggle id="ex-show_phone" checked={values.show_phone} onChange={(v) => set('show_phone', v)} label="Show my phone number publicly" />
          <Toggle id="ex-show_email" checked={values.show_email} onChange={(v) => set('show_email', v)} label="Show my email publicly" />
          <p className="text-xs text-muted-foreground">If these are off, only GHAMSU admins can see your phone and email.</p>
        </fieldset>

        <div className="space-y-1.5">
          <label className="flex items-start gap-3 text-sm">
            <input type="checkbox" id="ex-consent" checked={values.consent} aria-invalid={errors.consent ? true : undefined}
              onChange={(event) => set('consent', event.target.checked)} className="mt-0.5 h-4 w-4 flex-shrink-0 accent-[#003D82]" />
            <span>I agree that my name, photo and position may be shown on the GHAMSU website. <span className="text-destructive">*</span></span>
          </label>
          {errors.consent && <p className="text-sm text-destructive">{errors.consent}</p>}
        </div>

        {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{formError}</p>}

        <button type="submit" disabled={submitting || preparing}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-semibold uppercase tracking-wider text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? 'Sending…' : 'Send my profile'}
        </button>
      </form>
    </Card>
  )
}

function Toggle({ id, checked, onChange, label }: { id: string; checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label htmlFor={id} className="flex cursor-pointer items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <input id={id} type="checkbox" role="switch" checked={checked} onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only" />
      <span aria-hidden="true"
        className="relative h-6 w-11 flex-shrink-0 rounded-full bg-muted transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform peer-checked:bg-[#003D82] peer-checked:after:translate-x-5 peer-focus-visible:ring-2 peer-focus-visible:ring-ring" />
    </label>
  )
}
