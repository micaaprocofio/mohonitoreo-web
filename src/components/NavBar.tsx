import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'

const ThermometerIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
  </svg>
)

interface NavLinkProps {
  to: string
  children: React.ReactNode
  active: boolean
}

function NavLink({ to, children, active }: NavLinkProps) {
  return (
    <Link
      to={to}
      className={
        active
          ? 'px-3 py-[7px] rounded-lg text-sm font-semibold text-brand-ink bg-brand-accentLight'
          : 'px-3 py-[7px] rounded-lg text-sm text-brand-subtle hover:text-brand-ink transition-colors'
      }
    >
      {children}
    </Link>
  )
}

export function NavBar() {
  const { rol, logout } = useAuth()
  const navigate = useNavigate()
  const { pathname } = useLocation()

  async function handleLogout() {
    await logout()
    navigate('/')
  }

  return (
    <nav className="flex items-center justify-between px-7 py-3.5 bg-white border-b border-brand-border">
      <Link to="/dashboard" className="flex items-center gap-[11px]">
        <div className="w-[30px] h-[30px] rounded-lg bg-brand-accent flex items-center justify-center text-white">
          <ThermometerIcon />
        </div>
        <span className="text-[15px] font-bold tracking-tight text-brand-ink">Mohonitoreo</span>
      </Link>

      <div className="flex items-center gap-1">
        <NavLink to="/dashboard" active={pathname === '/dashboard'}>Dashboard</NavLink>
        <NavLink to="/historial" active={pathname === '/historial'}>Historial</NavLink>
        {rol === 'admin' && (
          <>
            <NavLink to="/admin/usuarios" active={pathname === '/admin/usuarios'}>Usuarios</NavLink>
            <NavLink to="/admin/dispositivos" active={pathname === '/admin/dispositivos'}>Dispositivos</NavLink>
          </>
        )}
        <div className="ml-2 pl-3 border-l border-brand-border">
          <button
            onClick={handleLogout}
            className="px-3 py-[7px] rounded-lg text-sm text-brand-subtle hover:text-brand-ink transition-colors"
          >
            Salir
          </button>
        </div>
      </div>
    </nav>
  )
}
