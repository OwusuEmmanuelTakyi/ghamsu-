import {
  Activity, BookOpen, FileText, GraduationCap, Globe, Heart, Music, Shield, TrendingUp, Users, Wrench,
  type LucideIcon,
} from 'lucide-react'

// Icon names stored in boards.icon and boards.home_icon.
const ICONS: Record<string, LucideIcon> = {
  Activity, BookOpen, FileText, GraduationCap, Globe, Heart, Music, Shield, TrendingUp, Users, Wrench,
}

export function boardIcon(name: string | null | undefined): LucideIcon {
  return ICONS[name ?? ''] ?? Users
}

// boards.color holds a token. The full class names are written out here because
// Tailwind only generates classes it can find in the source code.
const COLORS: Record<string, { color: string; accentColor: string }> = {
  red: { color: 'bg-red-500/10', accentColor: 'text-red-500' },
  blue: { color: 'bg-blue-500/10', accentColor: 'text-blue-500' },
  green: { color: 'bg-green-500/10', accentColor: 'text-green-500' },
  purple: { color: 'bg-purple-500/10', accentColor: 'text-purple-500' },
  yellow: { color: 'bg-yellow-500/10', accentColor: 'text-yellow-500' },
  pink: { color: 'bg-pink-500/10', accentColor: 'text-pink-500' },
}

export function boardColors(token: string | null | undefined) {
  return COLORS[token ?? ''] ?? { color: 'bg-accent/10', accentColor: 'text-accent' }
}
