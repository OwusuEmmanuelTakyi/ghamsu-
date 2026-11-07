import { useRef } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Switch } from '../../components/ui/switch'
import { Textarea } from '../../components/ui/textarea'
import { ImageField, type ImageValue } from './ImageField'
import { SortableList } from './SortableList'
import { cleanText, EMAIL_RULE, fromLocalInput, HTTP_URL_RULE, toLocalInput } from '../lib/forms'

// ─── Field definitions ─────────────────────────────────────────────────────────

export type FieldType =
  | 'text' | 'textarea' | 'url' | 'email' | 'tel' | 'number' | 'datetime'
  | 'select' | 'switch' | 'image' | 'list' | 'objects'

export interface FieldDef {
  /** Column (or JSON key). For images, the column prefix: flyer → flyer_path, flyer_alt… */
  name: string
  label: string
  type: FieldType
  required?: boolean
  /** Required only when publishing, mirroring the *_publish_requirements constraints. */
  publishRequired?: boolean
  help?: string
  placeholder?: string
  options?: { value: string; label: string }[]
  rows?: number
  min?: number
  max?: number
  integer?: boolean
  pattern?: RegExp
  patternMessage?: string
  maxLength?: number
  /** image: also store a caption / a focus point / an external-URL column */
  withCaption?: boolean
  withFocus?: boolean
  urlColumn?: string
  /** objects: the fields of each row (simple types only) */
  fields?: FieldDef[]
  /** Not a database column: handled by the resource's own hooks. */
  virtual?: boolean
  adminOnly?: boolean
  showIf?: (values: Values) => boolean
  validate?: (value: unknown, values: Values) => string | null
}

export type Values = Record<string, any>
export type Errors = Record<string, string>

// ─── Images ────────────────────────────────────────────────────────────────────

export function getImage(values: Values, field: FieldDef): ImageValue {
  const p = field.name
  return {
    path: values[`${p}_path`] ?? null,
    alt: values[`${p}_alt`] ?? null,
    caption: values[`${p}_caption`] ?? null,
    focus: values[`${p}_focus`] ?? null,
    url: field.urlColumn ? values[field.urlColumn] ?? null : null,
  }
}

function imageColumns(field: FieldDef, image: ImageValue): Values {
  const p = field.name
  const out: Values = { [`${p}_path`]: image.path ?? null, [`${p}_alt`]: cleanText(image.alt) }
  if (field.withCaption !== false && field.withCaption) out[`${p}_caption`] = cleanText(image.caption)
  if (field.withFocus !== false) out[`${p}_focus`] = image.focus ?? null
  if (field.urlColumn) out[field.urlColumn] = image.url ?? null
  return out
}

// ─── Conversion between rows and form values ──────────────────────────────────

const isEmpty = (value: unknown) =>
  value === null || value === undefined || (typeof value === 'string' && value.trim() === '') ||
  (Array.isArray(value) && value.length === 0)

/** Database row (or JSON setting) → form values. */
export function toFormValues(fields: FieldDef[], row: Values): Values {
  const values: Values = { ...row }
  for (const field of fields) {
    const raw = row[field.name]
    switch (field.type) {
      case 'datetime': values[field.name] = toLocalInput(raw); break
      case 'number': values[field.name] = raw === null || raw === undefined ? '' : String(raw); break
      case 'switch': values[field.name] = Boolean(raw); break
      case 'list': values[field.name] = Array.isArray(raw) ? raw : []; break
      case 'objects': values[field.name] = Array.isArray(raw) ? raw.map((r) => ({ ...r, __key: newKey() })) : []; break
      case 'image': break
      default: if (!field.virtual) values[field.name] = raw ?? ''
    }
  }
  return values
}

/** Form values → database columns (or JSON keys). Virtual fields are left out. */
export function toPayload(fields: FieldDef[], values: Values): Values {
  const out: Values = {}
  for (const field of fields) {
    if (field.virtual) continue
    const value = values[field.name]
    switch (field.type) {
      case 'image': Object.assign(out, imageColumns(field, getImage(values, field))); break
      case 'number': out[field.name] = value === '' || value === null || value === undefined ? null : Number(value); break
      case 'datetime': out[field.name] = fromLocalInput(value ?? ''); break
      case 'switch': out[field.name] = Boolean(value); break
      case 'list':
        out[field.name] = (value ?? []).map((item: string) => item.trim()).filter(Boolean)
        break
      case 'objects':
        out[field.name] = (value ?? [])
          .map((row: Values) => {
            const clean: Values = {}
            for (const sub of field.fields ?? []) clean[sub.name] = cleanText(row[sub.name])
            return clean
          })
          .filter((row: Values) => Object.values(row).some((v) => v !== null))
        break
      default: out[field.name] = cleanText(value)
    }
  }
  return out
}

// ─── Validation (the same rules as the database) ──────────────────────────────

export function validate(fields: FieldDef[], values: Values, { publishing = false } = {}): Errors {
  const errors: Errors = {}
  for (const field of fields) {
    if (field.showIf && !field.showIf(values)) continue
    const value = values[field.name]

    if (field.type === 'image') {
      const image = getImage(values, field)
      const hasImage = Boolean(image.path || image.url)
      if (!hasImage && (field.required || (publishing && field.publishRequired))) {
        errors[field.name] = publishing && !field.required ? 'Add an image before publishing.' : 'Please add an image.'
      } else if (hasImage && !cleanText(image.alt)) {
        errors[field.name] = 'Add alt text describing the image.'
      }
      continue
    }

    if (isEmpty(value)) {
      if (field.required) errors[field.name] = 'This field is required.'
      else if (publishing && field.publishRequired) errors[field.name] = 'Needed before publishing.'
      continue
    }

    const text = typeof value === 'string' ? value.trim() : value
    if (field.type === 'url' && !HTTP_URL_RULE.test(text)) errors[field.name] = 'Links must start with http:// or https://.'
    if (field.type === 'email' && !EMAIL_RULE.test(text)) errors[field.name] = "That doesn't look like a valid email address."
    if (field.type === 'number') {
      const n = Number(text)
      if (Number.isNaN(n)) errors[field.name] = 'Please enter a number.'
      else if (field.integer && !Number.isInteger(n)) errors[field.name] = 'Please enter a whole number.'
      else if (field.min !== undefined && n < field.min) errors[field.name] = `Must be at least ${field.min}.`
      else if (field.max !== undefined && n > field.max) errors[field.name] = `Must be at most ${field.max}.`
    }
    if (field.pattern && typeof text === 'string' && !field.pattern.test(text)) {
      errors[field.name] = field.patternMessage ?? "This value isn't in the right format."
    }
    if (field.maxLength && typeof text === 'string' && text.length > field.maxLength) {
      errors[field.name] = `Keep this under ${field.maxLength} characters.`
    }
    if (field.type === 'objects') {
      for (const row of value as Values[]) {
        for (const sub of field.fields ?? []) {
          const v = cleanText(row[sub.name])
          if (!v) continue
          if (sub.type === 'url' && !HTTP_URL_RULE.test(v)) errors[field.name] = `${sub.label}: links must start with http:// or https://.`
          if (sub.type === 'email' && !EMAIL_RULE.test(v)) errors[field.name] = `${sub.label}: "${v}" isn't a valid email address.`
        }
      }
    }
    const custom = field.validate?.(value, values)
    if (custom) errors[field.name] = custom
  }
  return errors
}

// ─── Rendering ─────────────────────────────────────────────────────────────────

export const selectClass =
  'h-9 w-full rounded-md border border-input bg-input-background px-3 text-sm outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 dark:bg-input/30'

interface FieldInputProps {
  field: FieldDef
  values: Values
  onChange: (changes: Values) => void
  error?: string
  idPrefix?: string
}

export function FieldInput({ field, values, onChange, error, idPrefix = 'f' }: FieldInputProps) {
  const id = `${idPrefix}-${field.name}`
  const value = values[field.name]
  const required = field.required ? <span className="text-destructive"> *</span> : null
  const describedBy = field.help ? `${id}-help` : undefined
  const invalid = Boolean(error) || undefined

  if (field.type === 'image') {
    return (
      <ImageField
        id={id}
        label={field.label}
        value={getImage(values, field)}
        required={field.required}
        withCaption={Boolean(field.withCaption)}
        withFocus={field.withFocus !== false}
        error={error}
        onChange={(image) => onChange(imageColumns({ ...field, withCaption: true }, image))}
      />
    )
  }

  if (field.type === 'switch') {
    return (
      <div className="flex items-start justify-between gap-4 rounded-lg border border-border p-3">
        <div>
          <Label htmlFor={id}>{field.label}</Label>
          {field.help && <p id={describedBy} className="mt-1 text-xs text-muted-foreground">{field.help}</p>}
        </div>
        <Switch id={id} checked={Boolean(value)} onCheckedChange={(checked) => onChange({ [field.name]: checked })} />
      </div>
    )
  }

  let control
  switch (field.type) {
    case 'textarea':
      control = (
        <Textarea id={id} rows={field.rows ?? 4} value={value ?? ''} placeholder={field.placeholder}
          aria-invalid={invalid} aria-describedby={describedBy}
          onChange={(event) => onChange({ [field.name]: event.target.value })} />
      )
      break
    case 'select':
      control = (
        <select id={id} className={selectClass} value={value ?? ''} aria-invalid={invalid} aria-describedby={describedBy}
          onChange={(event) => onChange({ [field.name]: event.target.value })}>
          <option value="">{field.placeholder ?? 'Choose…'}</option>
          {field.options?.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
        </select>
      )
      break
    case 'list':
      control = (
        <StringList id={id} items={value ?? []} placeholder={field.placeholder}
          onChange={(items) => onChange({ [field.name]: items })} />
      )
      break
    case 'objects':
      control = (
        <ObjectList id={id} field={field} rows={value ?? []} onChange={(rows) => onChange({ [field.name]: rows })} />
      )
      break
    default: {
      const inputType = ({ url: 'url', email: 'email', tel: 'tel', number: 'number', datetime: 'datetime-local' } as Record<string, string>)[field.type] ?? 'text'
      control = (
        <Input id={id} type={inputType} value={value ?? ''} placeholder={field.placeholder}
          min={field.min} max={field.max} step={field.type === 'number' ? (field.integer ? 1 : 'any') : undefined}
          inputMode={field.type === 'number' ? (field.integer ? 'numeric' : 'decimal') : undefined}
          aria-invalid={invalid} aria-describedby={describedBy}
          onChange={(event) => onChange({ [field.name]: event.target.value })} />
      )
    }
  }

  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{field.label}{required}</Label>
      {control}
      {field.help && <p id={describedBy} className="text-xs text-muted-foreground">{field.help}</p>}
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

// ─── List editors ──────────────────────────────────────────────────────────────

let keyCounter = 0
const newKey = () => `k${++keyCounter}`

function StringList({ id, items, onChange, placeholder }: {
  id: string; items: string[]; onChange: (items: string[]) => void; placeholder?: string
}) {
  // Stable keys that travel with each item, so inputs keep focus while typing
  // and while reordering.
  const keys = useRef<string[]>([])
  while (keys.current.length < items.length) keys.current.push(newKey())
  if (keys.current.length > items.length) keys.current.length = items.length
  const keyed = items.map((text, index) => ({ key: keys.current[index], text }))

  return (
    <div className="space-y-2" id={id}>
      {items.length > 0 && (
        <SortableList
          items={keyed}
          getKey={(item) => item.key}
          onChange={(next) => {
            keys.current = next.map((item) => item.key)
            onChange(next.map((item) => item.text))
          }}
          render={(item, index) => (
            <div className="flex gap-2">
              <Input
                value={item.text}
                placeholder={placeholder}
                aria-label={`Item ${index + 1}`}
                onChange={(event) => onChange(items.map((t, i) => (i === index ? event.target.value : t)))}
              />
              <Button type="button" variant="ghost" size="icon" aria-label="Remove item"
                onClick={() => {
                  keys.current.splice(index, 1)
                  onChange(items.filter((_, i) => i !== index))
                }}>
                <Trash2 />
              </Button>
            </div>
          )}
        />
      )}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...items, ''])}>
        <Plus /> Add item
      </Button>
    </div>
  )
}

function ObjectList({ id, field, rows, onChange }: {
  id: string; field: FieldDef; rows: Values[]; onChange: (rows: Values[]) => void
}) {
  const withKeys = rows.map((row) => (row.__key ? row : { ...row, __key: newKey() }))
  const update = (index: number, changes: Values) =>
    onChange(withKeys.map((row, i) => (i === index ? { ...row, ...changes } : row)))
  return (
    <div className="space-y-2" id={id}>
      {withKeys.length > 0 && (
        <SortableList
          items={withKeys}
          getKey={(row) => row.__key}
          onChange={onChange}
          render={(row, index) => (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              {(field.fields ?? []).map((sub) => (
                <div key={sub.name} className="min-w-0 flex-1 space-y-1">
                  <Label className="text-xs" htmlFor={`${id}-${index}-${sub.name}`}>{sub.label}</Label>
                  {sub.type === 'select' ? (
                    <select id={`${id}-${index}-${sub.name}`} className={selectClass} value={row[sub.name] ?? ''}
                      onChange={(event) => update(index, { [sub.name]: event.target.value })}>
                      <option value="">Choose…</option>
                      {sub.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                    </select>
                  ) : (
                    <Input id={`${id}-${index}-${sub.name}`} value={row[sub.name] ?? ''} placeholder={sub.placeholder}
                      type={sub.type === 'email' ? 'email' : sub.type === 'url' ? 'url' : sub.type === 'tel' ? 'tel' : 'text'}
                      onChange={(event) => update(index, { [sub.name]: event.target.value })} />
                  )}
                </div>
              ))}
              <Button type="button" variant="ghost" size="icon" aria-label="Remove row" className="self-end"
                onClick={() => onChange(withKeys.filter((_, i) => i !== index))}>
                <Trash2 />
              </Button>
            </div>
          )}
        />
      )}
      <Button type="button" variant="outline" size="sm" onClick={() => onChange([...withKeys, { __key: newKey() }])}>
        <Plus /> Add row
      </Button>
    </div>
  )
}
