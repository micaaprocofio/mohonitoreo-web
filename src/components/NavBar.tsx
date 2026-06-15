import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from './ui/Button'

export function NavBar() {
  const { rol, logout } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="bg-gradient-to-br from-brand-slateDark to-brand-slate shadow-lg">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-3 px-4 py-4 md:flex-row md:justify-between">
        <Link to="/dashboard" className="text-lg font-bold tracking-wide text-white">
          🌡️ Sistema Mohonitoreo
        </Link>

        <div className="flex flex-wrap items-center gap-2">
          {rol === 'admin' && (
            <>
              <Link to="/admin/usuarios">
                <Button variant="warning">Admin</Button>
              </Link>
              <Link to="/admin/dispositivos">
                <Button variant="primary">Dispositivos</Button>
              </Link>
            </>
          )}
          <Link to="/historial">
            <Button variant="outline">Historial</Button>
          </Link>
          <Button variant="danger" onClick={handleLogout}>
            Cerrar sesión
          </Button>
        </div>
      </div>
    </nav>
  )
}
