import { Link } from 'react-router-dom'

export function MenuPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-slateDark via-brand-slate to-brand-tealDark p-4">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-brand-teal to-brand-tealDark p-9 text-center text-white">
          <h1 className="text-2xl font-extrabold">🌡️ Entrada a Mohonitoreo</h1>
          <p className="mt-2 opacity-90">Monitoreo de temperatura y humedad</p>
        </div>

        <div className="space-y-3 p-8">
          <Link
            to="/login"
            className="block rounded-2xl bg-brand-teal py-4 text-center text-lg font-bold text-white transition hover:bg-brand-tealDark"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/signup"
            className="block rounded-2xl border-2 border-slate-800 py-4 text-center text-lg font-bold text-slate-800 transition hover:bg-slate-50"
          >
            Crear cuenta
          </Link>
          <p className="pt-2 text-center text-sm text-slate-500">
            Si ya tenés cuenta, entrá en Iniciar sesión. Si es tu primera vez, usá “Crear cuenta”.
          </p>
        </div>
      </div>
    </div>
  )
}
