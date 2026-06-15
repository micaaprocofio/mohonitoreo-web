import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-slateDark via-brand-slate to-brand-tealDark p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-brand-teal to-brand-tealDark p-8 text-center text-white">
          <h1 className="text-2xl font-extrabold">Iniciar sesión</h1>
        </div>
        <form className="space-y-4 p-8" onSubmit={handleSubmit}>
          {error && <Alert tone="danger">{error}</Alert>}
          <div>
            <Label htmlFor="cedula">Cédula</Label>
            <Input
              id="cedula"
              autoFocus
              value={cedula}
              onChange={(e) => setCedula(e.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="contrasena">Contraseña</Label>
            <Input
              id="contrasena"
              type="password"
              value={contrasena}
              onChange={(e) => setContrasena(e.target.value)}
            />
          </div>
          <Button type="submit" className="w-full" disabled={enviando}>
            {enviando ? 'Ingresando…' : 'Iniciar sesión'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            ¿No tenés cuenta?{' '}
            <Link to="/signup" className="font-semibold text-brand-tealDark">
              Crear cuenta
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
