import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'

export type Role = 'admin' | 'editor'

export interface Profile {
  id: string
  email: string | null
  full_name: string | null
  role: Role | null
  is_active: boolean
}

interface AuthState {
  session: Session | null
  profile: Profile | null
  /** True until the session and profile have been checked. */
  loading: boolean
  /** True after arriving from a password reset email. */
  recovery: boolean
  isAdmin: boolean
  isStaff: boolean
  refreshProfile: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthState | null>(null)

// The guard below is a convenience for the interface. What anyone can actually
// read or change is decided by the database's row-level security rules.
export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [recovery, setRecovery] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setSessionLoaded(true)
      setProfileLoaded(true)
      return
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoaded(true)
    })
    const { data: listener } = supabase.auth.onAuthStateChange((event, next) => {
      if (event === 'PASSWORD_RECOVERY') setRecovery(true)
      setSession(next)
      setSessionLoaded(true)
    })
    return () => listener.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id

  const loadProfile = useCallback(async () => {
    if (!supabase || !userId) {
      setProfile(null)
      setProfileLoaded(true)
      return
    }
    setProfileLoaded(false)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, full_name, role, is_active')
      .eq('id', userId)
      .maybeSingle()
    if (error) console.error('[admin] Could not load profile:', error.message)
    setProfile((data as Profile | null) ?? null)
    setProfileLoaded(true)
  }, [userId])

  useEffect(() => {
    if (sessionLoaded) loadProfile()
  }, [sessionLoaded, loadProfile])

  const signOut = useCallback(async () => {
    await supabase?.auth.signOut()
    setProfile(null)
    setRecovery(false)
  }, [])

  const activeRole = profile?.is_active ? profile.role : null

  return (
    <AuthContext.Provider
      value={{
        session,
        profile,
        loading: !sessionLoaded || (Boolean(session) && !profileLoaded),
        recovery,
        isAdmin: activeRole === 'admin',
        isStaff: activeRole === 'admin' || activeRole === 'editor',
        refreshProfile: loadProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthState {
  const value = useContext(AuthContext)
  if (!value) throw new Error('useAuth must be used inside AuthProvider')
  return value
}
