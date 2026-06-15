import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { clasificarHumedad, colorEstado, type ColorEstado, type EstadoHumedad } from './estado'

export interface HistorialItem {
  temperatura: number
  humedad: number
  estado: EstadoHumedad
  color: ColorEstado
  timestamp: Date | null
}

export interface HistorialState {
  loading: boolean
  items: HistorialItem[]
}

const LIMITE = 100

export function useHistorial(authUserId: string | undefined): HistorialState {
  const [items, setItems] = useState<HistorialItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authUserId) return
    let active = true

    async function load() {
      setLoading(true)

      const { data: u } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', authUserId!)
        .maybeSingle()

      if (!active) return
      const usuarioId = (u as { id: number } | null)?.id
      if (usuarioId == null) {
        setItems([])
        setLoading(false)
        return
      }

      const { data: rows } = await supabase
        .from('lecturas')
        .select('temperatura, humedad, timestamp')
        .eq('usuario_id', usuarioId)
        .order('timestamp', { ascending: false })
        .limit(LIMITE)

      if (!active) return
      const typedRows = (rows ?? []) as Array<{
        temperatura: number
        humedad: number
        timestamp: string | null
      }>
      const mapped: HistorialItem[] = typedRows.map((r) => {
        const humedad = Number(r.humedad)
        const estado = clasificarHumedad(humedad)
        return {
          temperatura: Number(r.temperatura),
          humedad,
          estado,
          color: colorEstado(estado),
          timestamp: r.timestamp ? new Date(r.timestamp) : null,
        }
      })
      setItems(mapped)
      setLoading(false)
    }

    void load()
    return () => {
      active = false
    }
  }, [authUserId])

  return { loading, items }
}
