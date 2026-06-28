import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from './AuthProvider'
import { useAuth } from './useAuth'

const mocks = vi.hoisted(() => ({
  getSession: vi.fn(),
  onAuthStateChange: vi.fn(),
  signInWithPassword: vi.fn(),
  signUp: vi.fn(),
  signOut: vi.fn(),
  from: vi.fn(),
}))

vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: mocks.getSession,
      onAuthStateChange: mocks.onAuthStateChange,
      signInWithPassword: mocks.signInWithPassword,
      signUp: mocks.signUp,
      signOut: mocks.signOut,
    },
    from: mocks.from,
  },
}))

function Consumer() {
  const { user, loading } = useAuth()
  if (loading) return <div>cargando</div>
  return <div>{user ? `user:${user.id}` : 'sin-sesion'}</div>
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    })
  })

  it('shows loading then resolves to logged-out when there is no session', async () => {
    mocks.getSession.mockResolvedValue({ data: { session: null } })

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    expect(screen.getByText('cargando')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByText('sin-sesion')).toBeInTheDocument())
  })
})
