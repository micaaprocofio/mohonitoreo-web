export type EstadoHumedad = 'ALTA' | 'NORMAL' | 'BAJA'
export type ColorEstado = 'danger' | 'success' | 'warning' | 'secondary'

/** Umbral (en segundos) tras el cual una lectura se considera desactualizada. */
export const STALE_SEGUNDOS = 60

/** Replica web/app.py: clasificar_humedad. */
export function clasificarHumedad(humedad: number): EstadoHumedad {
  if (humedad >= 70) return 'ALTA'
  if (humedad >= 40) return 'NORMAL'
  return 'BAJA'
}

/** Replica web/app.py: mensaje_estado. */
export function mensajeEstado(estado: EstadoHumedad): string {
  switch (estado) {
    case 'ALTA':
      return '⚠️ Humedad alta: se recomienda ventilación.'
    case 'NORMAL':
      return '✅ Humedad normal: ambiente estable.'
    case 'BAJA':
      return '⚠️ Humedad baja: se recomienda revisar el ambiente.'
    default:
      return 'Estado desconocido.'
  }
}

/** Replica web/app.py: color_estado. */
export function colorEstado(estado: EstadoHumedad): ColorEstado {
  switch (estado) {
    case 'ALTA':
      return 'danger'
    case 'NORMAL':
      return 'success'
    case 'BAJA':
      return 'warning'
    default:
      return 'secondary'
  }
}

/** Ícono mostrado en el dashboard según el estado. */
export function iconoEstado(estado: EstadoHumedad): string {
  if (estado === 'NORMAL') return '✅'
  if (estado === 'ALTA' || estado === 'BAJA') return '⚠️'
  return '❔'
}

/**
 * True si la lectura tiene más de STALE_SEGUNDOS de antigüedad.
 * Replica la regla `segundos > 60` de web/app.py.
 */
export function estaDesactualizado(timestamp: Date, now: Date = new Date()): boolean {
  const segundos = (now.getTime() - timestamp.getTime()) / 1000
  return segundos > STALE_SEGUNDOS
}
