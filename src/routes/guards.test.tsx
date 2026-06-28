import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './ProtectedRoute'
import { AdminRoute } from './AdminRoute'
import type { AuthContextValue } from '../auth/AuthContext'

const authState = vi.hoisted(() => ({ value: {} as AuthContextValue }))
vi.mock('../auth/useAuth', () => ({ useAuth: () => authState.value }))

function setAuth(partial: Partial<AuthContextValue>) {
  authState.value = {
    user: null,
    rol: null,
    loading: false,
    login: vi.fn(),
    signup: vi.fn(),
    logout: vi.fn(),
    ...partial,
  }
}

function renderAt(path: string, element: React.ReactNode) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/login" element={<div>login-page</div>} />
        <Route path="/dashboard" element={<div>dashboard-page</div>} />
        <Route path="/secret" element={element} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('ProtectedRoute', () => {
  it('redirects to /login when logged out', () => {
    setAuth({ user: null })
    renderAt('/secret', <ProtectedRoute><div>secret</div></ProtectedRoute>)
    expect(screen.getByText('login-page')).toBeInTheDocument()
  })

  it('renders children when logged in', () => {
    setAuth({ user: { id: 'u1' } as never })
    renderAt('/secret', <ProtectedRoute><div>secret</div></ProtectedRoute>)
    expect(screen.getByText('secret')).toBeInTheDocument()
  })
})

describe('AdminRoute', () => {
  it('redirects non-admins to /dashboard', () => {
    setAuth({ user: { id: 'u1' } as never, rol: 'usuario' })
    renderAt('/secret', <AdminRoute><div>admin-only</div></AdminRoute>)
    expect(screen.getByText('dashboard-page')).toBeInTheDocument()
  })

  it('renders children for admins', () => {
    setAuth({ user: { id: 'u1' } as never, rol: 'admin' })
    renderAt('/secret', <AdminRoute><div>admin-only</div></AdminRoute>)
    expect(screen.getByText('admin-only')).toBeInTheDocument()
  })
})
