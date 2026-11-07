import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useParams } from 'react-router'
import { motion } from 'motion/react'
import {
  ArrowLeft, Calendar, CheckCircle2, Clock, Hourglass, Loader2, MapPin, Phone, Ticket, User, Users,
} from 'lucide-react'
import { AnimatedSection } from '../components/AnimatedSection'
import { ActivityRegistrationForm } from '../components/ActivityRegistrationForm'
import { RichText } from '../components/RichText'
import { ShareButtons } from '../components/ShareButtons'
import { useActivityBySlug } from '../../lib/hooks'
import { focusStyle } from '../../lib/media'
import {
  activityDate, activityShareText, activityTime, fetchCustomFields, fetchRegistrationStatus, formatDeadline, hasEnded,
  isRegistrationOpen, telHref, type CustomField, type RegistrationStatus,
} from '../../lib/activities'
import type { MajorActivity } from '../../types/types'

// ─── Page meta tags ────────────────────────────────────────────────────────────

function usePageMeta(title: string | null, description: string | null) {
  useEffect(() => {
    if (!title) return
    const set = (selector: string, value: string) => {
      const meta = document.querySelector<HTMLMetaElement>(selector)
      const previous = meta?.content
      if (meta) meta.content = value
      return () => { if (meta && previous !== undefined) meta.content = previous }
    }
    const previousTitle = document.title
    document.title = `${title} · GHAMSU`
    const text = description || `Register for ${title}, organised by the Ghana Methodist Students' Union.`
    const restore = [
      set('meta[name="description"]', text),
      set('meta[property="og:title"]', title),
      set('meta[property="og:description"]', text),
      set('meta[name="twitter:title"]', title),
      set('meta[name="twitter:description"]', text),
    ]
    return () => {
      document.title = previousTitle
      restore.forEach((undo) => undo())
    }
  }, [title, description])
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function ActivityDetail() {
  const { slug } = useParams<{ slug: string }>()
  const { data: activity, loading } = useActivityBySlug(slug)
  usePageMeta(activity?.title ?? null, activity?.description ?? null)

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center pt-32">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-label="Loading" />
      </div>
    )
  }

  if (!activity) return <ActivityNotFound />

  return (
    <div className="pb-24">
      <Banner activity={activity} />
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-12">
          {/* DOM order is details, form, description: on phones that is the
              reading order; on desktop the form sits in its own column. */}
          <div className="space-y-6 lg:col-start-1 lg:row-start-1">
            <DetailsPanel activity={activity} />
            <ShareSection activity={activity} />
          </div>
          <div className="lg:col-start-2 lg:row-start-1 lg:row-span-2">
            <div className="lg:sticky lg:top-28">
              <RegistrationPanel activity={activity} />
            </div>
          </div>
          <div className="lg:col-start-1 lg:row-start-2">
            <AboutSection activity={activity} />
          </div>
        </div>
        <div className="mt-14 text-center">
          <Link to="/events" className="inline-flex items-center gap-2 font-medium text-primary hover:text-accent">
            <ArrowLeft className="h-4 w-4" /> Back to events
          </Link>
        </div>
      </div>
    </div>
  )
}

function ActivityNotFound() {
  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 pt-32 pb-24">
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 h-px w-12 bg-accent" aria-hidden="true" />
        <h1 className="mb-4 text-3xl sm:text-4xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          Activity not found
        </h1>
        <p className="mb-8 text-muted-foreground">
          We couldn't find this activity. It may have ended, been renamed, or not been announced yet.
        </p>
        <Link to="/events" className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90">
          <ArrowLeft className="h-4 w-4" /> See all events
        </Link>
      </div>
    </div>
  )
}

// ─── Banner ────────────────────────────────────────────────────────────────────

function Banner({ activity }: { activity: MajorActivity }) {
  const date = activityDate(activity)
  const open = isRegistrationOpen(activity)
  return (
    <section className="relative flex min-h-[420px] items-end overflow-hidden bg-[#003D82] pt-32 sm:min-h-[480px] md:h-[62vh]">
      {activity.imageUrl && (
        <img
          src={activity.imageUrl}
          alt={activity.imageAlt || activity.title}
          className="absolute inset-0 h-full w-full object-cover"
          style={focusStyle(activity.imageFocus)}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/30" />
      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-10 sm:px-6 sm:pb-14 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="mb-4 flex items-center gap-3">
            <div className="h-px w-10" style={{ background: '#D4AF37' }} aria-hidden="true" />
            <p className="text-[11px] font-semibold uppercase tracking-[0.3em] sm:text-xs" style={{ color: '#D4AF37' }}>
              Major Activity
            </p>
          </div>
          <h1 className="mb-5 max-w-4xl text-3xl leading-[1.1] tracking-tight text-white sm:text-4xl md:text-5xl lg:text-6xl"
            style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
            {activity.title}
          </h1>
          <div className="flex flex-wrap items-center gap-2 text-sm text-white/90">
            {date && <Chip icon={<Calendar className="h-4 w-4" />}>{date}</Chip>}
            {activity.location && <Chip icon={<MapPin className="h-4 w-4" />}>{activity.location}</Chip>}
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${open ? 'bg-green-500 text-white' : 'bg-white/20 text-white'}`}>
              {open ? 'Registration open' : 'Registration closed'}
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function Chip({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 backdrop-blur-sm">
      {icon}{children}
    </span>
  )
}

// ─── Details and description ───────────────────────────────────────────────────

function DetailsPanel({ activity }: { activity: MajorActivity }) {
  const rows: { icon: ReactNode; label: string; value: ReactNode }[] = []
  const date = activityDate(activity)
  const time = activityTime(activity)
  if (date) rows.push({ icon: <Calendar />, label: 'Date', value: date })
  if (time) rows.push({ icon: <Clock />, label: 'Time', value: time })
  if (activity.location) rows.push({ icon: <MapPin />, label: 'Venue', value: activity.location })
  if (activity.registrationDeadline) rows.push({ icon: <Hourglass />, label: 'Register by', value: formatDeadline(activity.registrationDeadline) })
  rows.push({ icon: <Ticket />, label: 'Fee', value: activity.feeText?.trim() || 'Free' })
  if (activity.audience) rows.push({ icon: <Users />, label: 'Who it is for', value: activity.audience })
  if (activity.contactName || activity.contactPhone) {
    rows.push({
      icon: activity.contactPhone ? <Phone /> : <User />,
      label: 'Contact',
      value: (
        <>
          {activity.contactName}
          {activity.contactName && activity.contactPhone && <br />}
          {activity.contactPhone && (
            <a href={telHref(activity.contactPhone)} className="text-primary hover:text-accent">{activity.contactPhone}</a>
          )}
        </>
      ),
    })
  }

  return (
    <AnimatedSection>
      <section className="rounded-xl border border-border bg-card shadow-sm" aria-labelledby="details-heading">
        <div className="h-[2px] w-full rounded-t-xl bg-accent" />
        <div className="p-6 sm:p-8">
          <h2 id="details-heading" className="mb-6 text-xl tracking-tight sm:text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
            Details
          </h2>
          <dl className="grid gap-5 sm:grid-cols-2">
            {rows.map((row) => (
              <div key={row.label} className="flex gap-3">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary [&_svg]:h-5 [&_svg]:w-5">
                  {row.icon}
                </div>
                <div className="min-w-0">
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">{row.label}</dt>
                  <dd className="mt-0.5 font-medium leading-snug text-foreground">{row.value}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </AnimatedSection>
  )
}

function ShareSection({ activity }: { activity: MajorActivity }) {
  const url = `${window.location.origin}/activities/${activity.slug}`
  return (
    <section aria-labelledby="share-heading" className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
      <h2 id="share-heading" className="mb-1 text-lg tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
        Share this activity
      </h2>
      <p className="mb-4 text-sm text-muted-foreground">
        {hasEnded(activity) ? 'Let others know what happened.' : 'Invite friends and members of your local.'}
      </p>
      <ShareButtons title={activity.title} text={activityShareText(activity, url)} url={url} />
    </section>
  )
}

function AboutSection({ activity }: { activity: MajorActivity }) {
  const hasBody = Boolean(activity.body?.content?.length)
  if (!hasBody && !activity.description) return null
  return (
    <AnimatedSection>
      <section aria-labelledby="about-heading">
        <h2 id="about-heading" className="mb-5 text-2xl tracking-tight sm:text-3xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          About this activity
        </h2>
        <div className="text-base leading-relaxed text-foreground sm:text-lg">
          {hasBody ? <RichText doc={activity.body} /> : <p className="mb-6 leading-relaxed">{activity.description}</p>}
        </div>
      </section>
    </AnimatedSection>
  )
}

// ─── Registration ──────────────────────────────────────────────────────────────

function RegistrationPanel({ activity }: { activity: MajorActivity }) {
  const [status, setStatus] = useState<RegistrationStatus | null>(null)
  const [fields, setFields] = useState<CustomField[]>([])
  const [checked, setChecked] = useState(false)
  const [done, setDone] = useState(false)
  const top = useRef<HTMLDivElement>(null)

  useEffect(() => {
    let cancelled = false
    Promise.all([fetchRegistrationStatus(activity.id), fetchCustomFields(activity.id)]).then(([result, extra]) => {
      if (cancelled) return
      setStatus(result)
      setFields(extra)
      setChecked(true)
    })
    return () => { cancelled = true }
  }, [activity.id])

  // The database's answer wins; if it can't be reached, use the activity's own fields.
  const open = status ? status.isOpen : isRegistrationOpen(activity)
  const reason = status?.reason ?? (activity.registrationOpen ? 'deadline' : 'closed')

  return (
    <div ref={top} className="scroll-mt-28 overflow-hidden rounded-xl border border-border bg-card shadow-lg">
      <div className="bg-[#003D82] px-6 py-5 text-white dark:bg-[#0d1f3c]">
        <h2 className="text-xl tracking-tight sm:text-2xl" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>
          {done ? 'Registration received' : 'Register'}
        </h2>
        {!done && open && status?.spotsLeft !== null && status?.spotsLeft !== undefined && (
          <p className="mt-1 text-sm text-white/75">{status.spotsLeft} {status.spotsLeft === 1 ? 'place' : 'places'} left</p>
        )}
      </div>
      <div className="p-6">
        {!checked ? (
          <div className="flex justify-center py-10"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" aria-label="Checking registration" /></div>
        ) : done ? (
          <Success activity={activity} onAnother={() => { setDone(false); top.current?.scrollIntoView({ behavior: 'smooth' }) }} />
        ) : open ? (
          <ActivityRegistrationForm
            activityId={activity.id}
            fields={fields}
            onSuccess={() => { setDone(true); top.current?.scrollIntoView({ behavior: 'smooth' }) }}
            onClosed={(next) => setStatus(next)}
          />
        ) : (
          <Closed reason={reason} />
        )}
      </div>
    </div>
  )
}

function Closed({ reason }: { reason: string | null }) {
  const text = reason === 'full'
    ? 'Sorry, this activity is full.'
    : reason === 'deadline'
      ? 'The registration deadline has passed.'
      : 'Registration for this activity is closed.'
  return (
    <div className="py-6 text-center">
      <p className="mb-2 font-semibold">Registration closed</p>
      <p className="mb-6 text-sm text-muted-foreground">{text} For enquiries, please get in touch with us.</p>
      <Link to="/contact" className="inline-flex rounded-lg border border-border px-5 py-2.5 text-sm font-medium hover:border-accent">
        Contact us
      </Link>
    </div>
  )
}

function Success({ activity, onAnother }: { activity: MajorActivity; onAnother: () => void }) {
  const date = activityDate(activity)
  const time = activityTime(activity)
  return (
    <div className="py-4 text-center" role="status">
      <CheckCircle2 className="mx-auto mb-4 h-14 w-14 text-green-600" aria-hidden="true" />
      <p className="mb-1 text-lg font-semibold">You're registered!</p>
      <p className="mb-6 text-sm text-muted-foreground">We look forward to seeing you.</p>
      <div className="mb-6 space-y-2 rounded-lg bg-secondary p-4 text-left text-sm">
        <p className="font-semibold">{activity.title}</p>
        {date && <p className="flex gap-2"><Calendar className="h-4 w-4 flex-shrink-0 text-primary" />{date}{time ? `, ${time}` : ''}</p>}
        {activity.location && <p className="flex gap-2"><MapPin className="h-4 w-4 flex-shrink-0 text-primary" />{activity.location}</p>}
      </div>
      <div className="flex flex-col gap-2">
        <button type="button" onClick={onAnother} className="rounded-lg bg-primary px-5 py-3 text-sm font-medium text-primary-foreground hover:opacity-90">
          Register someone else
        </button>
        <Link to="/events" className="rounded-lg border border-border px-5 py-3 text-sm font-medium hover:border-accent">
          Back to events
        </Link>
      </div>
    </div>
  )
}
