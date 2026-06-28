import { createContext } from 'react'
import type { User } from '@supabase/supabase-js'
import type { Rol } from '../types/db'

export interface AuthContextValue {
  user: User | null
  rol: Rol | null
  loading: boolean
  login: (cedula: string, password: string) => Promise<void>
  signup: (cedula: string, nombre: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | undefined>(undefined)
