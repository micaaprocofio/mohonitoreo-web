import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { LoginPage } from './LoginPage'

const mocks = vi.hoisted(() => ({ login: vi.fn(), navigate: vi.fn() }))

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ login: mocks.login }),
}))
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate,
}))

function renderPage() {
  render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('calls login with cédula and password, then navigates to dashboard', async () => {
    mocks.login.mockResolvedValue(undefined)
    renderPage()
    await userEvent.type(screen.getByLabelText(/cédula/i), '12345')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret1')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() => expect(mocks.login).toHaveBeenCalledWith('12345', 'secret1'))
    expect(mocks.navigate).toHaveBeenCalledWith('/dashboard')
  })

  it('shows an error message when login fails', async () => {
    mocks.login.mockRejectedValue(new Error('bad'))
    renderPage()
    await userEvent.type(screen.getByLabelText(/cédula/i), '12345')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'wrong')
    await userEvent.click(screen.getByRole('button', { name: /iniciar sesión/i }))

    await waitFor(() =>
      expect(screen.getByText(/cédula o contraseña incorrecta/i)).toBeInTheDocument(),
    )
    expect(mocks.navigate).not.toHaveBeenCalled()
  })
})
