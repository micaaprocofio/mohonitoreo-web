import { Link } from 'react-router-dom'

const ThermometerIcon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
    <path d="M14 14.76V5a2 2 0 0 0-4 0v9.76a4 4 0 1 0 4 0Z" />
  </svg>
)

export function MenuPage() {
  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div
        className="bg-white border border-brand-borderStrong rounded-xl shadow-card w-full max-w-xs flex flex-col items-center justify-center gap-0 text-center"
        style={{ padding: '36px' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-brand-accent flex items-center justify-center mb-5">
          <ThermometerIcon />
        </div>

        <h1 className="text-[26px] font-bold tracking-tight text-brand-ink mb-2">Mohonitoreo</h1>
        <p className="text-sm text-brand-subtle mb-6">Sistema de monitoreo ambiental</p>

        <div className="flex flex-col gap-2.5 w-full">
          <Link
            to="/login"
            className="w-full text-center text-sm font-semibold bg-brand-accent text-white rounded-[10px] py-3 hover:opacity-90 transition-opacity"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/signup"
            className="w-full text-center text-sm font-semibold border border-brand-accent text-brand-accent bg-white rounded-[10px] py-3 hover:bg-brand-accentLight transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}
