import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router'
import {
  Calendar, ExternalLink, FileText, Flag, Images, Inbox, LayoutDashboard, Link2, LogOut, Menu, Mic, Quote, Settings,
  Sparkles, UserCog, Users as UsersIcon, Presentation,
} from 'lucide-react'
import { countPendingSubmissions } from './pages/ExecutiveSubmissions'
import logoImage from '../../images/logo.png'
import { Badge } from '../components/ui/badge'
import { Button } from '../components/ui/button'
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../components/ui/sheet'
import { useAuth } from './auth'

const CONTENT_LINKS = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/posts', label: 'Posts', icon: FileText },
  { to: '/admin/events', label: 'Events', icon: Calendar },
  { to: '/admin/sermons', label: 'Sermons', icon: Mic },
  { to: '/admin/gallery', label: 'Gallery', icon: Images },
  { to: '/admin/executives', label: 'Executives', icon: UsersIcon },
  { to: '/admin/testimonials', label: 'Testimonials', icon: Quote },
  { to: '/admin/boards', label: 'Boards', icon: Flag },
  { to: '/admin/activities', label: 'Major activities', icon: Sparkles },
  { to: '/admin/hero-slides', label: 'Hero slides', icon: Presentation },
]

const ADMIN_LINKS = [
  { to: '/admin/executive-submissions', label: 'Executive submissions', icon: Inbox, badge: true },
  { to: '/admin/executive-links', label: 'Executive links', icon: Link2 },
  { to: '/admin/settings', label: 'Site settings', icon: Settings },
  { to: '/admin/users', label: 'Users', icon: UserCog },
]

function Nav({ onNavigate }: { onNavigate?: () => void }) {
  const { isAdmin, profile, signOut } = useAuth()
  const { pathname } = useLocation()
  const [pending, setPending] = useState(0)
  // Refreshed on every page change, so approving or rejecting updates it.
  useEffect(() => {
    if (!isAdmin) return
    let current = true
    countPendingSubmissions().then((n) => current && setPending(n))
    return () => { current = false }
  }, [isAdmin, pathname])

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
      isActive ? 'bg-primary text-primary-foreground' : 'text-foreground hover:bg-secondary'
    }`

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-3 border-b border-border p-4">
        <img src={logoImage} alt="" className="h-9 w-auto" />
        <div>
          <p className="text-sm font-semibold leading-tight">GHAMSU</p>
          <p className="text-xs text-muted-foreground">Website admin</p>
        </div>
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3" aria-label="Admin">
        {CONTENT_LINKS.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className={linkClass} onClick={onNavigate}>
            <Icon className="h-4 w-4" /> {label}
          </NavLink>
        ))}
        {isAdmin && (
          <>
            <p className="px-3 pb-1 pt-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Admin</p>
            {ADMIN_LINKS.map(({ to, label, icon: Icon, badge }) => (
              <NavLink key={to} to={to} className={linkClass} onClick={onNavigate}>
                <Icon className="h-4 w-4" /> <span className="flex-1">{label}</span>
                {badge && pending > 0 && (
                  <span className="rounded-full bg-accent px-2 py-0.5 text-xs font-semibold text-accent-foreground" aria-label={`${pending} waiting for approval`}>
                    {pending}
                  </span>
                )}
              </NavLink>
            ))}
          </>
        )}
      </nav>
      <div className="space-y-2 border-t border-border p-3">
        <a href="/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-secondary">
          <ExternalLink className="h-4 w-4" /> View website
        </a>
        <div className="px-3">
          <p className="truncate text-xs text-muted-foreground">{profile?.email}</p>
          <Badge variant="outline" className="mt-1 capitalize">{profile?.role}</Badge>
        </div>
        <Button variant="ghost" className="w-full justify-start" onClick={signOut}>
          <LogOut /> Sign out
        </Button>
      </div>
    </div>
  )
}

export function AdminLayout() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="min-h-screen bg-secondary/40">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-border bg-card md:block">
        <Nav />
      </aside>

      <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-border bg-card px-4 py-3 md:hidden">
        <Button variant="ghost" size="icon" aria-label="Open menu" onClick={() => setOpen(true)}>
          <Menu />
        </Button>
        <img src={logoImage} alt="" className="h-7 w-auto" />
        <span className="text-sm font-semibold">GHAMSU admin</span>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 p-0">
          <SheetTitle className="sr-only">Admin menu</SheetTitle>
          <SheetDescription className="sr-only">Navigate the admin dashboard</SheetDescription>
          <Nav onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>

      <main className="md:pl-64">
        <div key={location.pathname} className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
