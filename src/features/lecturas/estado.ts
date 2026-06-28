export type EstadoHumedad = 'Crítico' | 'Alto' | 'Óptimo' | 'Bajo'
export type ColorEstado = 'danger' | 'success' | 'warning' | 'secondary'

/** Umbral (en segundos) tras el cual una lectura se considera desactualizada. */
export const STALE_SEGUNDOS = 60

/** Replica web/app.py: clasificar_humedad. */
export function clasificarHumedad(humedad: number): EstadoHumedad {
  if (humedad >= 85) return 'Crítico'
  if (humedad >= 70) return 'Alto'
  if (humedad >= 40) return 'Óptimo'
  return 'Bajo'
}

/** Replica web/app.py: mensaje_estado. */
export function mensajeEstado(estado: EstadoHumedad): string {
  switch (estado) {
    case 'Crítico':
      return 'Humedad en nivel crítico. Se requiere ventilación urgente.'
    case 'Alto':
      return 'Humedad elevada: se recomienda ventilación.'
    case 'Óptimo':
      return 'Temperatura y humedad dentro del rango ideal de operación.'
    case 'Bajo':
      return 'Humedad baja: se recomienda revisar el ambiente.'
    default:
      return 'Estado desconocido.'
  }
}

/** Replica web/app.py: color_estado. */
export function colorEstado(estado: EstadoHumedad): ColorEstado {
  switch (estado) {
    case 'Crítico':
      return 'danger'
    case 'Alto':
      return 'warning'
    case 'Óptimo':
      return 'success'
    case 'Bajo':
      return 'secondary'
    default:
      return 'secondary'
  }
}

/** Ícono mostrado en el dashboard según el estado. */
export function iconoEstado(estado: EstadoHumedad): string {
  if (estado === 'Óptimo') return '✅'
  if (estado === 'Crítico') return '🔴'
  return '⚠️'
}

/**
 * True si la lectura tiene más de STALE_SEGUNDOS de antigüedad.
 * Replica la regla `segundos > 60` de web/app.py.
 */
export function estaDesactualizado(timestamp: Date, now: Date = new Date()): boolean {
  const segundos = (now.getTime() - timestamp.getTime()) / 1000
  return segundos > STALE_SEGUNDOS
}

/**
 * Parsea un timestamp de Supabase como UTC. La columna `timestamp` se guarda
 * sin zona horaria, así que si el string no trae offset (sin "Z" ni "+hh:mm")
 * hay que agregarle "Z" a mano: si no, el navegador lo interpreta como hora
 * local y la fecha queda corrida por el offset del usuario.
 */
export function parseTimestampUtc(raw: string): Date {
  const tieneOffset = /Z$|[+-]\d{2}:?\d{2}$/.test(raw)
  return new Date(tieneOffset ? raw : `${raw}Z`)
}
