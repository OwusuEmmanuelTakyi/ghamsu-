import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { ChevronRight, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { supabase } from '../../../lib/supabase'
import { clearPublicDataCache } from '../../../lib/hooks'
import { Button } from '../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs'
import { FieldInput, toFormValues, toPayload, validate, type Errors, type FieldDef, type Values } from '../components/fields'
import { Loading, PageHeader } from '../components/ui'
import { friendlyError } from '../lib/errors'
import { DIGITS_RULE, EMAIL_RULE } from '../lib/forms'
import { SETTINGS_RESOURCES } from '../resources'

interface SettingDef {
  key: string
  title: string
  description: string
  fields: FieldDef[]
  /** Converts the stored JSON into form values (beyond the field defaults). */
  load?: (value: Values) => Values
  /** Converts form values back into JSON. */
  save?: (values: Values, payload: Values) => Values
}

const SETTINGS: SettingDef[] = [
  {
    key: 'yearly_theme',
    title: 'Theme',
    description: 'The yearly theme shown in the footer of every page.',
    fields: [
      { name: 'year', label: 'Year', type: 'number', integer: true, min: 2000, max: 2100 },
      { name: 'title', label: 'Theme', type: 'text', required: true },
      { name: 'scripture', label: 'Scripture', type: 'textarea', rows: 3 },
    ],
  },
  {
    key: 'contact_details',
    title: 'Contact',
    description: 'The "Get in Touch" details on the Contact page. Empty items are hidden.',
    fields: [
      { name: 'address_lines', label: 'Address lines', type: 'list' },
      {
        name: 'phones', label: 'Phone numbers', type: 'objects',
        fields: [{ name: 'label', label: 'Label', type: 'text', placeholder: 'Office' }, { name: 'number', label: 'Number', type: 'tel', placeholder: '+233 24 123 4567' }],
      },
      {
        name: 'emails', label: 'Email addresses', type: 'list',
        validate: (value) => {
          const bad = (value as string[]).map((v) => v.trim()).filter(Boolean).find((v) => !EMAIL_RULE.test(v))
          return bad ? `"${bad}" isn't a valid email address.` : null
        },
      },
    ],
  },
  {
    key: 'coordinator',
    title: 'Coordinator',
    description: 'The Connexional Coordinator panel on the Contact page. You can also tick "Is coordinator" on an executive to fill this in from their profile.',
    fields: [
      { name: 'name', label: 'Name', type: 'text', required: true },
      { name: 'title', label: 'Title', type: 'text' },
      { name: 'image', label: 'Photo', type: 'image', withFocus: false },
      { name: 'bio', label: 'Bio', type: 'textarea', rows: 6, virtual: true, help: 'Leave a blank line between paragraphs.' },
      { name: 'email', label: 'Email', type: 'email' },
      { name: 'phone', label: 'Phone', type: 'tel', placeholder: '+233 24 123 4567' },
      {
        name: 'whatsapp', label: 'WhatsApp number', type: 'text', pattern: DIGITS_RULE, placeholder: '233241234567',
        patternMessage: 'Digits only, with the country code (for example 233241234567).',
      },
      {
        name: 'stats', label: 'Highlights', type: 'objects',
        fields: [{ name: 'value', label: 'Value', type: 'text', placeholder: '15+' }, { name: 'label', label: 'Label', type: 'text', placeholder: 'Years in Service' }],
      },
      { name: 'section_heading', label: 'Section heading', type: 'text', placeholder: 'Connexional Coordinator' },
      { name: 'section_subheading', label: 'Section subheading', type: 'text' },
    ],
    load: (value) => ({ bio: (value.bio_paragraphs ?? []).join('\n\n') }),
    save: (values, payload) => ({
      ...payload,
      bio_paragraphs: String(values.bio ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean),
    }),
  },
  {
    key: 'bank_details',
    title: 'Bank & MoMo',
    description: 'The giving details on the Partner page. Empty rows are hidden.',
    fields: [
      { name: 'section_heading', label: 'Heading', type: 'text', placeholder: 'Bank Account Details' },
      { name: 'section_subheading', label: 'Subheading', type: 'text' },
      { name: 'account_name', label: 'Account name', type: 'text' },
      { name: 'bank_name', label: 'Bank', type: 'text' },
      { name: 'branch', label: 'Branch', type: 'text' },
      { name: 'account_number', label: 'Account number', type: 'text' },
      { name: 'alternative_bank', label: 'Second bank (shown after "Or")', type: 'text' },
      { name: 'alternative_account_number', label: 'Second bank account number', type: 'text' },
      { name: 'momo_name', label: 'Mobile Money account name', type: 'text' },
      { name: 'momo_number', label: 'Mobile Money number', type: 'tel' },
      {
        name: 'momo_network', label: 'Mobile Money network', type: 'select',
        options: ['MTN MoMo', 'Telecel Cash', 'AirtelTigo Money'].map((v) => ({ value: v, label: v })),
      },
      { name: 'international_note', label: 'Note about international transfers', type: 'textarea', rows: 2, help: 'If it ends with "contact us here", those words link to the Contact page.' },
      { name: 'receipt_note', label: 'Receipt note', type: 'text' },
    ],
  },
]

function SettingForm({ def }: { def: SettingDef }) {
  const [original, setOriginal] = useState<Values | null>(null)
  const [values, setValues] = useState<Values>({})
  const [errors, setErrors] = useState<Errors>({})
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!supabase) return
    supabase.from('site_settings').select('value').eq('key', def.key).maybeSingle().then(({ data, error }) => {
      if (error) toast.error(friendlyError(error))
      const value = (data?.value as Values) ?? {}
      setOriginal(value)
      setValues({ ...toFormValues(def.fields, value), ...(def.load?.(value) ?? {}) })
    })
  }, [def])

  const save = async () => {
    if (!supabase || !original) return
    const found = validate(def.fields, values)
    setErrors(found)
    if (Object.keys(found).length) return toast.error('Please fix the highlighted fields.')
    setSaving(true)
    const payload = toPayload(def.fields, values)
    // Keep keys the form doesn't edit (such as the coordinator's executive_id).
    const value = { ...original, ...(def.save ? def.save(values, payload) : payload) }
    const { error } = await supabase.from('site_settings').update({ value }).eq('key', def.key)
    setSaving(false)
    if (error) return toast.error(friendlyError(error))
    setOriginal(value)
    clearPublicDataCache()
    toast.success(`${def.title} saved.`)
  }

  if (!original) return <Loading />

  return (
    <form onSubmit={(event) => { event.preventDefault(); save() }} className="space-y-5 rounded-xl border border-border bg-card p-4 sm:p-6">
      <p className="text-sm text-muted-foreground">{def.description}</p>
      {def.fields.map((field) => (
        <FieldInput key={field.name} field={field} values={values} idPrefix={def.key} error={errors[field.name]}
          onChange={(changes) => setValues((prev) => ({ ...prev, ...changes }))} />
      ))}
      <Button type="submit" disabled={saving}>{saving && <Loader2 className="animate-spin" />} Save {def.title.toLowerCase()}</Button>
    </form>
  )
}

export function SiteSettings() {
  return (
    <div>
      <PageHeader title="Site settings" description="Details used across the website. Only admins can change these." />
      <Tabs defaultValue={SETTINGS[0].key}>
        <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
          <TabsList>
            {SETTINGS.map((def) => <TabsTrigger key={def.key} value={def.key}>{def.title}</TabsTrigger>)}
            <TabsTrigger value="more">More</TabsTrigger>
          </TabsList>
        </div>
        {SETTINGS.map((def) => (
          <TabsContent key={def.key} value={def.key} className="mt-4"><SettingForm def={def} /></TabsContent>
        ))}
        <TabsContent value="more" className="mt-4">
          <ul className="divide-y divide-border rounded-xl border border-border bg-card">
            {SETTINGS_RESOURCES.map((config) => (
              <li key={config.key}>
                <Link to={config.path} className="flex items-center gap-3 p-4 hover:bg-secondary/50">
                  <div className="flex-1">
                    <p className="font-medium">{config.label}</p>
                    <p className="text-sm text-muted-foreground">{config.help}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
    </div>
  )
}
