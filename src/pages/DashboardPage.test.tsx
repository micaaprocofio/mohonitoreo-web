import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { DashboardPage } from './DashboardPage'
import type { UltimaLecturaState } from '../features/lecturas/useUltimaLectura'

const h = vi.hoisted(() => ({ state: {} as UltimaLecturaState }))

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1' }, rol: 'usuario', logout: vi.fn() }),
}))
vi.mock('../features/lecturas/useUltimaLectura', () => ({
  useUltimaLectura: () => h.state,
}))

function renderPage() {
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>,
  )
}

describe('DashboardPage', () => {
  it('renders metric values when a reading is present', () => {
    h.state = {
      status: 'ok',
      lectura: {
        temperatura: 22.5,
        humedad: 75,
        estado: 'ALTA',
        color: 'danger',
        mensaje: '⚠️ Humedad alta',
        icono: '⚠️',
        timestamp: new Date('2026-06-15T12:00:00Z'),
        desactualizado: false,
      },
    }
    renderPage()
    expect(screen.getByText('22.5 °C')).toBeInTheDocument()
    expect(screen.getByText('75.0 %')).toBeInTheDocument()
    expect(screen.getByText('ALTA')).toBeInTheDocument()
  })

  it('shows the no-data warning when there are no readings', () => {
    h.state = { status: 'sin-datos', lectura: null }
    renderPage()
    expect(screen.getByText(/no hay lecturas para tu usuario/i)).toBeInTheDocument()
  })
})
