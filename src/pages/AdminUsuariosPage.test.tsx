import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { AdminUsuariosPage } from './AdminUsuariosPage'

const h = vi.hoisted(() => ({
  refetch: vi.fn(),
  createUser: vi.fn(),
}))

vi.mock('../auth/useAuth', () => ({
  useAuth: () => ({ user: { id: 'a1' }, rol: 'admin', logout: vi.fn() }),
}))
vi.mock('../features/admin/useUsuarios', () => ({
  useUsuarios: () => ({
    usuarios: [{ id: 1, cedula: '111', nombre: 'Carlos Pérez', rol: 'admin', fecha_creacion: null }],
    loading: false,
    refetch: h.refetch,
  }),
}))
vi.mock('../features/admin/createUser', () => ({
  createUser: (...args: unknown[]) => h.createUser(...args),
}))

function renderPage() {
  render(
    <MemoryRouter>
      <AdminUsuariosPage />
    </MemoryRouter>,
  )
}

describe('AdminUsuariosPage', () => {
  beforeEach(() => vi.clearAllMocks())

  it('lists existing users', () => {
    renderPage()
    expect(screen.getByText('Carlos Pérez')).toBeInTheDocument()
    expect(screen.getByText('111')).toBeInTheDocument()
  })

  it('validates required fields before creating', async () => {
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: /crear usuario/i }))
    expect(await screen.findByText(/obligatorio/i)).toBeInTheDocument()
    expect(h.createUser).not.toHaveBeenCalled()
  })

  it('calls createUser and shows success', async () => {
    h.createUser.mockResolvedValue(undefined)
    renderPage()
    await userEvent.type(screen.getByLabelText(/cédula/i), '222')
    await userEvent.type(screen.getByLabelText(/nombre/i), 'Bob')
    await userEvent.type(screen.getByLabelText(/contraseña/i), 'secret1')
    await userEvent.click(screen.getByRole('button', { name: /crear usuario/i }))

    await waitFor(() =>
      expect(h.createUser).toHaveBeenCalledWith({
        cedula: '222',
        nombre: 'Bob',
        password: 'secret1',
        rol: 'usuario',
      }),
    )
    expect(await screen.findByText(/usuario creado correctamente/i)).toBeInTheDocument()
    expect(h.refetch).toHaveBeenCalled()
  })
})
