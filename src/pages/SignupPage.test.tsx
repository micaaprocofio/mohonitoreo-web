import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { SignupPage } from './SignupPage'

const mocks = vi.hoisted(() => ({ signup: vi.fn(), navigate: vi.fn() }))

vi.mock('../auth/useAuth', () => ({ useAuth: () => ({ signup: mocks.signup }) }))
vi.mock('react-router-dom', async (orig) => ({
  ...(await orig<typeof import('react-router-dom')>()),
  useNavigate: () => mocks.navigate,
}))

function renderPage() {
  render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  )
}

describe('SignupPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('validates required fields before calling signup', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))
    expect(await screen.findByText(/obligatorio/i)).toBeInTheDocument()
    expect(mocks.signup).not.toHaveBeenCalled()
  })

  it('calls signup and shows success on valid submit', async () => {
    mocks.signup.mockResolvedValue(undefined)
    renderPage()
    await userEvent.type(screen.getByLabelText(/cédula/i), '999')
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Ana')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret1')
    await userEvent.click(screen.getByRole('button', { name: /crear cuenta/i }))

    await waitFor(() => expect(mocks.signup).toHaveBeenCalledWith('999', 'Ana', 'secret1'))
    expect(await screen.findByRole('alert')).toHaveTextContent(/cuenta creada/i)
  })
})
