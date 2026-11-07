import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Loader2 } from 'lucide-react'
import {
  HEARD_OPTIONS, normalizeGhanaPhone, ROLE_OPTIONS, submitRegistration, validateCustomAnswers, validateRegistration,
  type CustomAnswers, type CustomField, type RegistrationInput, type RegistrationStatus,
} from '../../lib/activities'

// The registration form for a major activity. Used on /activities/:slug, and
// in the admin's "Preview form" (preview mode never sends anything).

const EMPTY: RegistrationInput = {
  full_name: '', phone: '', email: '', gender: '', local: '', diocese: '', level: '', role: '', how_did_you_hear: '', notes: '',
}

const inputClass =
  'w-full rounded-lg border bg-secondary px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none sm:py-3'

interface Props {
  activityId: string
  fields: CustomField[]
  preview?: boolean
  onSuccess: () => void
  onClosed?: (status: RegistrationStatus) => void
}

export function ActivityRegistrationForm({ activityId, fields, preview = false, onSuccess, onClosed }: Props) {
  const [values, setValues] = useState<RegistrationInput>(EMPTY)
  const [answers, setAnswers] = useState<CustomAnswers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [formError, setFormError] = useState<string | null>(null)
  const [previewOk, setPreviewOk] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const honeypot = useRef<HTMLInputElement>(null)

  const clearError = (key: string) => {
    setFormError(null)
    setPreviewOk(false)
    setErrors((prev) => { const next = { ...prev }; delete next[key]; return next })
  }
  const set = (name: keyof RegistrationInput, value: string) => {
    setValues((prev) => ({ ...prev, [name]: value }))
    clearError(name)
  }
  const answer = (id: string, value: string | string[]) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
    clearError(`custom-${id}`)
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    // In the admin preview this form sits (through a portal) inside the
    // activity editor's form; React would otherwise pass the submit up to it.
    event.stopPropagation()
    setFormError(null)

    // Bots fill every field, including this hidden one. Pretend it worked.
    if (!preview && honeypot.current?.value) return onSuccess()

    const custom = validateCustomAnswers(fields, answers)
    const found = { ...validateRegistration(values), ...Object.fromEntries(Object.entries(custom).map(([id, message]) => [`custom-${id}`, message])) }
    setErrors(found)
    if (Object.keys(found).length) {
      setFormError('Please check the highlighted fields.')
      // Inputs take focus; a group of checkboxes or yes/no is scrolled to.
      const first = document.querySelector<HTMLElement>('form [aria-invalid="true"]')
      first?.scrollIntoView({ block: 'center' })
      first?.focus({ preventScroll: true })
      return
    }
    if (preview) return setPreviewOk(true)

    setSubmitting(true)
    const result = await submitRegistration(activityId, values, { fields, answers })
    setSubmitting(false)
    if (result.ok) {
      setValues(EMPTY)
      setAnswers({})
      return onSuccess()
    }
    if (result.closed) {
      const reason = /full/.test(result.message) ? 'full' : /deadline/.test(result.message) ? 'deadline' : 'closed'
      return onClosed?.({ isOpen: false, reason, spotsLeft: reason === 'full' ? 0 : null })
    }
    if (result.field) setErrors((prev) => ({ ...prev, [result.field!]: result.message }))
    if (result.customField) setErrors((prev) => ({ ...prev, [`custom-${result.customField}`]: result.message }))
    setFormError(result.message)
  }

  const field = (name: string, label: string, control: ReactNode, required = true, hint?: string | null) => (
    <div className="space-y-1.5">
      <label htmlFor={`reg-${name}`} className="block text-sm font-medium">
        {label}{required && <span className="text-destructive"> *</span>}
      </label>
      {control}
      {hint && !errors[name] && <p className="text-xs text-muted-foreground">{hint}</p>}
      {errors[name] && <p id={`reg-${name}-error`} className="text-sm text-destructive">{errors[name]}</p>}
    </div>
  )

  const invalid = (key: string) => ({
    'aria-invalid': errors[key] ? true : undefined,
    'aria-describedby': errors[key] ? `reg-${key}-error` : undefined,
    className: `${inputClass} ${errors[key] ? 'border-destructive' : 'border-border'}`,
  })

  const props = (name: keyof RegistrationInput) => ({
    id: `reg-${name}`,
    name,
    value: values[name],
    ...invalid(name),
    onChange: (event: { target: { value: string } }) => set(name, event.target.value),
  })

  const phoneOk = values.phone && normalizeGhanaPhone(values.phone)

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      {/* Honeypot: hidden from people and screen readers, filled by bots. */}
      <div aria-hidden="true" style={{ position: 'absolute', left: '-10000px', width: 1, height: 1, overflow: 'hidden' }}>
        <label htmlFor="reg-website">Website</label>
        <input ref={honeypot} id="reg-website" name="website" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {field('full_name', 'Full name', <input {...props('full_name')} autoComplete="name" maxLength={120} />)}
      {field('phone', 'Phone number',
        <input {...props('phone')} type="tel" autoComplete="tel" inputMode="tel" placeholder="024 123 4567" />,
        true, phoneOk ? `Saved as ${phoneOk}` : 'A Ghana number, for example 024 123 4567 or +233 24 123 4567.')}
      {field('email', 'Email', <input {...props('email')} type="email" autoComplete="email" inputMode="email" maxLength={254} />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('gender', 'Gender',
          <select {...props('gender')}>
            <option value="">Choose…</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>)}
        {field('role', 'I am a',
          <select {...props('role')}>
            <option value="">Choose…</option>
            {ROLE_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>)}
      </div>
      {field('local', 'Local, campus or institution', <input {...props('local')} maxLength={150} placeholder="UG Local" />)}
      <div className="grid gap-4 sm:grid-cols-2">
        {field('diocese', 'Diocese', <input {...props('diocese')} maxLength={100} placeholder="Accra" />)}
        {field('level', 'Level or year', <input {...props('level')} maxLength={60} placeholder="Level 200" />)}
      </div>
      {field('how_did_you_hear', 'How did you hear about this?',
        <select {...props('how_did_you_hear')}>
          <option value="">Choose…</option>
          {HEARD_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>, false)}
      {field('notes', 'Anything we should know?', <textarea {...props('notes')} rows={3} maxLength={1000} className={`${props('notes').className} resize-none`} />, false,
        'For example, dietary or accessibility needs.')}

      {/* Extra questions set by the organisers, after the default ones. */}
      {fields.map((f) => {
        const key = `custom-${f.id}`
        const value = answers[f.id]
        const common = { id: `reg-${key}`, name: key, ...invalid(key) }
        const text = typeof value === 'string' ? value : ''
        let control: ReactNode
        switch (f.field_type) {
          case 'long_text':
            control = <textarea {...common} rows={3} maxLength={2000} value={text} onChange={(e) => answer(f.id, e.target.value)} className={`${common.className} resize-none`} />
            break
          case 'number':
            control = <input {...common} type="text" inputMode="decimal" value={text} onChange={(e) => answer(f.id, e.target.value)} />
            break
          case 'date':
            control = <input {...common} type="date" min="1900-01-01" max="2100-12-31" value={text} onChange={(e) => answer(f.id, e.target.value)} />
            break
          case 'phone':
            control = <input {...common} type="tel" inputMode="tel" placeholder="024 123 4567" value={text} onChange={(e) => answer(f.id, e.target.value)} />
            break
          case 'email':
            control = <input {...common} type="email" inputMode="email" maxLength={254} value={text} onChange={(e) => answer(f.id, e.target.value)} />
            break
          case 'dropdown':
            control = (
              <select {...common} value={text} onChange={(e) => answer(f.id, e.target.value)}>
                <option value="">Choose…</option>
                {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            )
            break
          case 'checkboxes': {
            const chosen = Array.isArray(value) ? value : []
            return (
              <fieldset key={f.id} className="space-y-2" aria-invalid={errors[key] ? true : undefined} aria-describedby={errors[key] ? `reg-${key}-error` : undefined}>
                <legend className="mb-1.5 block text-sm font-medium">{f.label}{f.required && <span className="text-destructive"> *</span>}</legend>
                {f.options.map((o, i) => (
                  <label key={o} className="flex items-center gap-3 text-sm">
                    <input type="checkbox" id={i === 0 ? `reg-${key}` : undefined} checked={chosen.includes(o)} className="h-4 w-4 accent-[#003D82]"
                      onChange={(e) => answer(f.id, e.target.checked ? [...chosen, o] : chosen.filter((c) => c !== o))} />
                    {o}
                  </label>
                ))}
                {f.help_text && !errors[key] && <p className="text-xs text-muted-foreground">{f.help_text}</p>}
                {errors[key] && <p id={`reg-${key}-error`} className="text-sm text-destructive">{errors[key]}</p>}
              </fieldset>
            )
          }
          case 'yes_no':
            return (
              <fieldset key={f.id} className="space-y-2" aria-invalid={errors[key] ? true : undefined} aria-describedby={errors[key] ? `reg-${key}-error` : undefined}>
                <legend className="mb-1.5 block text-sm font-medium">{f.label}{f.required && <span className="text-destructive"> *</span>}</legend>
                <div className="flex gap-6">
                  {['yes', 'no'].map((choice) => (
                    <label key={choice} className="flex items-center gap-2 text-sm">
                      <input type="radio" name={key} id={choice === 'yes' ? `reg-${key}` : undefined} value={choice} checked={text === choice}
                        className="h-4 w-4 accent-[#003D82]" onChange={() => answer(f.id, choice)} />
                      {choice === 'yes' ? 'Yes' : 'No'}
                    </label>
                  ))}
                </div>
                {f.help_text && !errors[key] && <p className="text-xs text-muted-foreground">{f.help_text}</p>}
                {errors[key] && <p id={`reg-${key}-error`} className="text-sm text-destructive">{errors[key]}</p>}
              </fieldset>
            )
          default:
            control = <input {...common} type="text" maxLength={300} value={text} onChange={(e) => answer(f.id, e.target.value)} />
        }
        return <div key={f.id}>{field(key, f.label, control, f.required, f.help_text)}</div>
      })}

      {formError && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive" role="alert">{formError}</p>}
      {previewOk && (
        <p className="rounded-lg bg-green-600/10 p-3 text-sm text-green-700 dark:text-green-400" role="status">
          Preview: every answer is valid. On the website, this would register the person. Nothing was sent.
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-accent py-3.5 text-sm font-semibold uppercase tracking-wider text-accent-foreground transition-colors hover:bg-accent/90 disabled:opacity-60"
      >
        {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {submitting ? 'Registering…' : 'Register'}
      </button>
      <p className="text-center text-xs text-muted-foreground">
        Your details are only shared with the GHAMSU organisers of this activity.
      </p>
    </form>
  )
}
