import { describe, it, expect } from 'vitest'
import {
  clasificarHumedad,
  mensajeEstado,
  colorEstado,
  estaDesactualizado,
} from './estado'

describe('clasificarHumedad', () => {
  it('classifies at the boundaries', () => {
    expect(clasificarHumedad(70)).toBe('ALTA')
    expect(clasificarHumedad(69)).toBe('NORMAL')
    expect(clasificarHumedad(40)).toBe('NORMAL')
    expect(clasificarHumedad(39)).toBe('BAJA')
  })
})

describe('colorEstado', () => {
  it('maps estado to a bootstrap-like color token', () => {
    expect(colorEstado('ALTA')).toBe('danger')
    expect(colorEstado('NORMAL')).toBe('success')
    expect(colorEstado('BAJA')).toBe('warning')
  })
})

describe('mensajeEstado', () => {
  it('returns a message per estado', () => {
    expect(mensajeEstado('ALTA')).toContain('alta')
    expect(mensajeEstado('NORMAL')).toContain('normal')
    expect(mensajeEstado('BAJA')).toContain('baja')
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
