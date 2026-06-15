import { supabase } from '../../lib/supabase'
import type { Rol } from '../../types/db'

export interface CreateUserInput {
  cedula: string
  nombre: string
  password: string
  rol: Rol
}

/**
 * Crea un usuario vía la Edge Function privilegiada `admin-create-user`.
 * Lanza un Error con mensaje legible si falla.
 */
export async function createUser(input: CreateUserInput): Promise<void> {
  const { data, error } = await supabase.functions.invoke('admin-create-user', {
    body: {
      cedula: input.cedula.trim(),
      nombre: input.nombre.trim(),
      password: input.password,
      rol: input.rol,
    },
  })

  if (error) {
    // La Edge Function devuelve { error } con código no-2xx.
    const msg = (data as { error?: string } | null)?.error ?? error.message
    throw new Error(msg)
  }
}
