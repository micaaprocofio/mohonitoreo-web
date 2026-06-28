import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'

export interface DispositivoItem {
  id: number
  dispositivo: string
  deviceToken: string
  fechaCreacion: Date | null
  cedula: string
  usuario: string
}

interface DispositivoRow {
  id: number
  nombre: string
  device_token: string
  fecha_creacion: string | null
  usuarios: { cedula: string; nombre: string } | null
}

export function useDispositivos() {
  const [items, setItems] = useState<DispositivoItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function load() {
      setLoading(true)
      const { data } = await supabase
        .from('dispositivos')
        .select('id, nombre, device_token, fecha_creacion, usuarios(cedula, nombre)')
        .order('fecha_creacion', { ascending: false })

      if (!active) return
      const rows = (data as unknown as DispositivoRow[] | null) ?? []
      setItems(
        rows.map((d) => ({
          id: d.id,
          dispositivo: d.nombre,
          deviceToken: d.device_token,
          fechaCreacion: d.fecha_creacion ? new Date(d.fecha_creacion) : null,
          cedula: d.usuarios?.cedula ?? '',
          usuario: d.usuarios?.nombre ?? '',
        })),
      )
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [])

  return { items, loading }
}
