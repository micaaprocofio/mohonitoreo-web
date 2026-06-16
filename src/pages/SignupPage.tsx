import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Input, Label } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'

export function SignupPage() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [contrasena, setContrasena] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!cedula.trim() || !nombre.trim()) {
      setError('La cédula y el nombre son obligatorios.')
      return
    }
    if (contrasena.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.')
      return
    }

    setEnviando(true)
    try {
      await signup(cedula, nombre, contrasena)
      setOk(true)
      setTimeout(() => navigate('/login'), 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear la cuenta.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center p-6">
      <div className="bg-white border border-brand-borderStrong rounded-xl shadow-card w-full max-w-sm">
        <div className="px-9 py-8">
          <h2 className="text-[22px] font-bold tracking-tight text-brand-ink mb-1">Crear cuenta</h2>
          <p className="text-sm text-brand-subtle mb-6">
            Registrate para acceder al sistema.
          </p>

          {error && <Alert tone="danger" className="mb-5">{error}</Alert>}
          {ok && <Alert tone="success" className="mb-5">¡Cuenta creada! Redirigiendo...</Alert>}

          <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="cedula">Cédula</Label>
              <Input
                id="cedula"
                autoFocus
                placeholder="0.000.000-0"
                value={cedula}
                onChange={(e) => setCedula(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="nombre">Nombre completo</Label>
              <Input
                id="nombre"
                placeholder="Nombre y apellido"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="contrasena">Contraseña</Label>
              <Input
                id="contrasena"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={contrasena}
                onChange={(e) => setContrasena(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={enviando || ok}
              className="mt-2 w-full rounded-[10px] bg-brand-accent py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {enviando ? 'Creando cuenta...' : ok ? '¡Cuenta creada!' : 'Crear cuenta'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-brand-subtle">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand-accent hover:underline">
              Iniciar sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
