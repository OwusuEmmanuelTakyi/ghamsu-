import { useEffect, useState, type FormEvent, type ReactNode } from 'react'
import { Link, Navigate, useLocation, useNavigate, useSearchParams } from 'react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import logoImage from '../../../images/logo.png'
import { supabase } from '../../../lib/supabase'
import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { useAuth } from '../auth'
import { friendlyError } from '../lib/errors'
import { EMAIL_RULE } from '../lib/forms'

const MIN_PASSWORD = 8

function AuthCard({ title, description, children }: { title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-secondary px-4 py-12">
      <div className="w-full max-w-sm rounded-xl border border-border bg-card p-6 shadow-lg sm:p-8">
        <div className="mb-6 text-center">
          <img src={logoImage} alt="GHAMSU" className="mx-auto mb-4 h-14 w-auto" />
          <h1 className="text-2xl tracking-tight" style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>{title}</h1>
          {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
        </div>
        {children}
      </div>
    </main>
  )
}

/** Only allow returning to admin pages after login, never to another site. */
function safeNext(next: string | null) {
  return next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin'
}

export function LoginPage() {
  const { session, loading } = useAuth()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!loading && session) return <Navigate to={safeNext(params.get('next'))} replace />

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    setError(null)
    setSubmitting(true)
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setSubmitting(false)
    if (signInError) return setError(friendlyError(signInError))
    navigate(safeNext(params.get('next')), { replace: true })
  }

  return (
    <AuthCard title="Admin sign in" description="For GHAMSU website editors.">
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting || !email || !password}>
          {submitting && <Loader2 className="animate-spin" />} Sign in
        </Button>
        <p className="text-center text-sm">
          <Link to="/admin/forgot-password" className="text-primary hover:underline">Forgot your password?</Link>
        </p>
      </form>
    </AuthCard>
  )
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    if (!EMAIL_RULE.test(email.trim())) return setError("That doesn't look like a valid email address.")
    setError(null)
    setSubmitting(true)
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/admin/reset-password`,
    })
    setSubmitting(false)
    // Same message whether or not the account exists, so emails can't be probed.
    if (resetError && /rate limit|too many/i.test(resetError.message)) return setError(friendlyError(resetError))
    if (resetError) console.error('[admin] Password reset request failed:', resetError.message)
    setSent(true)
  }

  return (
    <AuthCard title="Reset your password" description="We'll email you a link to choose a new password.">
      {sent ? (
        <div className="space-y-4 text-center text-sm">
          <p>If an account exists for <strong>{email.trim()}</strong>, a reset link is on its way. Check your inbox and spam folder.</p>
          <Link to="/admin/login" className="text-primary hover:underline">Back to sign in</Link>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
          <Button type="submit" className="w-full" disabled={submitting || !email}>
            {submitting && <Loader2 className="animate-spin" />} Send reset link
          </Button>
          <p className="text-center text-sm"><Link to="/admin/login" className="text-primary hover:underline">Back to sign in</Link></p>
        </form>
      )}
    </AuthCard>
  )
}

/** Handles the link from the reset (or invite) email: Supabase signs the user in from the URL. */
export function ResetPasswordPage() {
  const { session, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [waited, setWaited] = useState(false)

  // An expired or used link reports its error in the URL.
  const linkError = (() => {
    const params = new URLSearchParams(window.location.hash.slice(1) || window.location.search)
    return params.get('error_description')
  })()

  useEffect(() => {
    const timer = setTimeout(() => setWaited(true), 4000)
    return () => clearTimeout(timer)
  }, [])

  const submit = async (event: FormEvent) => {
    event.preventDefault()
    if (!supabase) return
    if (password.length < MIN_PASSWORD) return setError(`Use at least ${MIN_PASSWORD} characters.`)
    if (password !== confirm) return setError("The two passwords don't match.")
    setError(null)
    setSubmitting(true)
    const { error: updateError } = await supabase.auth.updateUser({ password })
    setSubmitting(false)
    if (updateError) return setError(friendlyError(updateError))
    toast.success('Your password has been changed.')
    navigate('/admin', { replace: true })
  }

  if (linkError || (!session && !loading && waited)) {
    return (
      <AuthCard title="This link has expired" description={linkError ? linkError.replace(/\+/g, ' ') : 'The reset link is invalid or has already been used.'}>
        <Link to="/admin/forgot-password" className="block text-center text-sm text-primary hover:underline">Request a new link</Link>
      </AuthCard>
    )
  }

  if (!session) {
    return (
      <AuthCard title="Checking your link…">
        <div className="flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      </AuthCard>
    )
  }

  return (
    <AuthCard title="Choose a new password" description={`For ${session.user.email}`}>
      <form onSubmit={submit} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="new-password">New password</Label>
          <Input id="new-password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} />
          <p className="text-xs text-muted-foreground">At least {MIN_PASSWORD} characters.</p>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="confirm-password">Repeat the new password</Label>
          <Input id="confirm-password" type="password" autoComplete="new-password" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
        </div>
        {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
        <Button type="submit" className="w-full" disabled={submitting || !password || !confirm}>
          {submitting && <Loader2 className="animate-spin" />} Save new password
        </Button>
      </form>
    </AuthCard>
  )
}

// ─── Guards (interface only; the database enforces the real rules) ─────────────

export function RequireStaff({ children }: { children: ReactNode }) {
  const { session, profile, loading, isStaff, signOut } = useAuth()
  // The router's location, not window.location: the address bar can already
  // show the login page while this renders, which would nest ?next= values.
  const location = useLocation()
  if (loading) {
    return <div className="flex min-h-screen items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
  }
  if (!session) {
    const next = location.pathname + location.search
    return <Navigate to={`/admin/login?next=${encodeURIComponent(next)}`} replace />
  }
  if (!isStaff) {
    return (
      <AuthCard
        title="No access yet"
        description={profile && !profile.is_active
          ? 'Your account has been deactivated. Ask an admin if you think this is a mistake.'
          : 'Your account has no access yet. Ask an admin to give you the editor or admin role.'}
      >
        <p className="mb-4 text-center text-sm text-muted-foreground">Signed in as {session.user.email}</p>
        <Button variant="outline" className="w-full" onClick={signOut}>Sign out</Button>
      </AuthCard>
    )
  }
  return <>{children}</>
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  if (!isAdmin) {
    return (
      <div className="rounded-xl border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
        This page is for admins only. <Link to="/admin" className="text-primary underline">Back to the dashboard</Link>
      </div>
    )
  }
  return <>{children}</>
}
