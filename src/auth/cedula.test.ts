import { describe, it, expect } from 'vitest'
import { cedulaToEmail, EMAIL_DOMAIN } from './cedula'

describe('cedulaToEmail', () => {
  it('maps a cédula to a synthetic email', () => {
    expect(cedulaToEmail('12345')).toBe(`12345@${EMAIL_DOMAIN}`)
  })

  it('trims surrounding whitespace and lowercases', () => {
    expect(cedulaToEmail('  12345 ')).toBe('12345@mohonitoreo.app')
  })

  it('exposes the domain constant', () => {
    expect(EMAIL_DOMAIN).toBe('mohonitoreo.app')
  })
})
