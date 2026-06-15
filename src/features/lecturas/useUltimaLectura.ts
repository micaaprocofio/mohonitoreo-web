import { useEffect, useMemo, useState } from 'react'
import type { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from '../../lib/supabase'
import {
  clasificarHumedad,
  colorEstado,
  estaDesactualizado,
  iconoEstado,
  mensajeEstado,
  type ColorEstado,
  type EstadoHumedad,
} from './estado'

export interface LecturaCruda {
  temperatura: number
  humedad: number
  timestamp: Date
}

export interface LecturaView {
  temperatura: number
  humedad: number
  estado: EstadoHumedad
  color: ColorEstado
  mensaje: string
  icono: string
  timestamp: Date
  desactualizado: boolean
}

export type UltimaLecturaState =
  | { status: 'loading'; lectura: null }
  | { status: 'sin-datos'; lectura: null }
  | { status: 'ok'; lectura: LecturaView }

function toCruda(row: { temperatura: number; humedad: number; timestamp: string | null }): LecturaCruda {
  return {
    temperatura: Number(row.temperatura),
    humedad: Number(row.humedad),
    timestamp: new Date(row.timestamp ?? Date.now()),
  }
}

function toView(cruda: LecturaCruda, now: Date): LecturaView {
  const estado = clasificarHumedad(cruda.humedad)
  return {
    temperatura: cruda.temperatura,
    humedad: cruda.humedad,
    estado,
    color: colorEstado(estado),
    mensaje: mensajeEstado(estado),
    icono: iconoEstado(estado),
    timestamp: cruda.timestamp,
    desactualizado: estaDesactualizado(cruda.timestamp, now),
  }
}

/**
 * Última lectura del usuario, en tiempo real vía Supabase Realtime.
 * Hace un fetch inicial y luego se suscribe a los INSERT de `lecturas`.
 * Un timer revalúa la "desactualización" aunque no lleguen lecturas nuevas.
 */
export function useUltimaLectura(authUserId: string | undefined): UltimaLecturaState {
  const [cruda, setCruda] = useState<LecturaCruda | null>(null)
  const [status, setStatus] = useState<'loading' | 'sin-datos' | 'ok'>('loading')
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 10000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    if (!authUserId) return
    let active = true
    let channel: RealtimeChannel | undefined

    async function start() {
      setStatus('loading')

      const { data: u } = await supabase
        .from('usuarios')
        .select('id')
        .eq('auth_id', authUserId!)
        .maybeSingle()

      if (!active) return
      const usuarioId = (u as { id: number } | null)?.id
      if (usuarioId == null) {
        setStatus('sin-datos')
        return
      }

      const { data: rows } = await supabase
        .from('lecturas')
        .select('temperatura, humedad, timestamp')
        .eq('usuario_id', usuarioId)
        .order('timestamp', { ascending: false })
        .limit(1)

      if (!active) return
      const latest = rows?.[0]
      if (latest) {
        setCruda(toCruda(latest))
        setStatus('ok')
      } else {
        setStatus('sin-datos')
      }

      channel = supabase
        .channel(`lecturas:${usuarioId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'lecturas',
            filter: `usuario_id=eq.${usuarioId}`,
          },
          (payload) => {
            const row = payload.new as {
              temperatura: number
              humedad: number
              timestamp: string | null
            }
            setCruda(toCruda(row))
            setStatus('ok')
            setNow(new Date())
          },
        )
        .subscribe()
    }

    void start()

    return () => {
      active = false
      if (channel) void supabase.removeChannel(channel)
    }
  }, [authUserId])

  return useMemo<UltimaLecturaState>(() => {
    if (status === 'ok' && cruda) {
      return { status: 'ok', lectura: toView(cruda, now) }
    }
    if (status === 'sin-datos') return { status: 'sin-datos', lectura: null }
    return { status: 'loading', lectura: null }
  }, [status, cruda, now])
}
