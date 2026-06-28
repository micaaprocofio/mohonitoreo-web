import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import type { Usuario } from '../../types/db'

export type UsuarioListItem = Pick<Usuario, 'id' | 'cedula' | 'nombre' | 'rol' | 'fecha_creacion'>

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioListItem[]>([])
  const [loading, setLoading] = useState(true)

  const refetch = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('usuarios')
      .select('id, cedula, nombre, rol, fecha_creacion')
      .order('fecha_creacion', { ascending: false })
    setUsuarios((data as UsuarioListItem[] | null) ?? [])
    setLoading(false)
  }, [])

  useEffect(() => {
    void refetch()
  }, [refetch])

  return { usuarios, loading, refetch }
}
