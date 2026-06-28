import { useCallback, useEffect, useState } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Rol } from '../types/db'
import { cedulaToEmail } from './cedula'
import { AuthContext } from './AuthContext'

async function fetchRol(userId: string): Promise<Rol | null> {
  const { data } = await supabase
    .from('usuarios')
    .select('rol')
    .eq('auth_id', userId)
    .maybeSingle()
  return (data as { rol: Rol } | null)?.rol ?? null
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [rol, setRol] = useState<Rol | null>(null)
  const [loading, setLoading] = useState(true)

  const applySession = useCallback(async (session: Session | null) => {
    const nextUser = session?.user ?? null
    setUser(nextUser)
    setRol(nextUser ? await fetchRol(nextUser.id) : null)
  }, [])

  useEffect(() => {
    let active = true

    supabase.auth.getSession().then(async ({ data }) => {
      if (!active) return
      await applySession(data.session)
      if (active) setLoading(false)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session)
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [applySession])

  const login = useCallback(async (cedula: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email: cedulaToEmail(cedula),
      password,
    })
    if (error) throw error
  }, [])

  const signup = useCallback(async (cedula: string, nombre: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email: cedulaToEmail(cedula),
      password,
      options: { data: { cedula: cedula.trim(), nombre: nombre.trim() } },
    })
    if (error) throw error
  }, [])

  const logout = useCallback(async () => {
    await supabase.auth.signOut()
  }, [])

  return (
    <AuthContext.Provider value={{ user, rol, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
