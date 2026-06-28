import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Input, Label } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

export function LoginPage() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [cedula, setCedula] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setEnviando(true)
    try {
      await login(cedula, contrasena)
      navigate('/dashboard')
    } catch {
      setError('Cédula o contraseña incorrecta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="bg-white border border-brand-borderStrong rounded-xl shadow-card w-full max-w-sm">
        <div className="px-9 py-8">
          <h2 className="text-[22px] font-bold tracking-tight text-brand-ink mb-1">
            Bienvenido de vuelta
          </h2>
          <p className="text-sm text-brand-subtle mb-6">
            Ingresá con tu cédula para continuar.
          </p>

          {error && <Alert tone="danger" className="mb-5">{error}</Alert>}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                autoFocus
                placeholder="4.812.337-1"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="••••••••"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              disabled={enviando}
              className="mt-2 w-full rounded-[10px] bg-brand-accent py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Ingresando...' : 'Entrar'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-subtle">
            ¿No tenés cuenta?{' '}
            <Link to="/signup" className="font-semibold text-brand-accent hover:underline">
              Crear cuenta
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
