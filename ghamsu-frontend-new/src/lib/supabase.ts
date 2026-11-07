import { createClient, type SupabaseClient } from '@supabase/supabase-js'

declare global {
  interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL?: string
    readonly VITE_SUPABASE_ANON_KEY?: string
  }
}

// Only the public (anon / publishable) key belongs here. It is bundled into the
// browser code, and row-level security in Supabase decides what it can read.
const url = import.meta.env.VITE_SUPABASE_URL?.trim()
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim()

function create(): SupabaseClient | null {
  if (!url || !anonKey) return null
  try {
    return createClient(url, anonKey)
  } catch (error) {
    console.error('[supabase] Could not create the client:', error)
    return null
  }
}

export const supabase = create()
export const isSupabaseConfigured = supabase !== null
export const supabaseUrl = url ?? ''
