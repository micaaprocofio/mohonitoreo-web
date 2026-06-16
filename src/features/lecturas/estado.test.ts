import { describe, it, expect } from 'vitest'
import {
  clasificarHumedad,
  mensajeEstado,
  colorEstado,
  estaDesactualizado,
} from './estado'

describe('clasificarHumedad', () => {
  it('classifies at the boundaries', () => {
    expect(clasificarHumedad(85)).toBe('Crítico')
    expect(clasificarHumedad(84)).toBe('Alto')
    expect(clasificarHumedad(70)).toBe('Alto')
    expect(clasificarHumedad(69)).toBe('Óptimo')
    expect(clasificarHumedad(40)).toBe('Óptimo')
    expect(clasificarHumedad(39)).toBe('Bajo')
  })
})

describe('colorEstado', () => {
  it('maps estado to a color token', () => {
    expect(colorEstado('Crítico')).toBe('danger')
    expect(colorEstado('Alto')).toBe('warning')
    expect(colorEstado('Óptimo')).toBe('success')
    expect(colorEstado('Bajo')).toBe('secondary')
  })
})

describe('mensajeEstado', () => {
  it('returns a message per estado', () => {
    expect(mensajeEstado('Crítico')).toContain('crítico')
    expect(mensajeEstado('Alto')).toContain('elevada')
    expect(mensajeEstado('Óptimo')).toContain('ideal')
    expect(mensajeEstado('Bajo')).toContain('baja')
  })
})

describe('estaDesactualizado', () => {
  it('is true when the reading is older than 60s', () => {
    const t = new Date('2026-01-01T00:00:00Z')
    const now = new Date('2026-01-01T00:01:01Z')
    expect(estaDesactualizado(t, now)).toBe(true)
  })

  it('is false at exactly 60s', () => {
    const t = new Date('2026-01-01T00:00:00Z')
    const now = new Date('2026-01-01T00:01:00Z')
    expect(estaDesactualizado(t, now)).toBe(false)
  })
})
