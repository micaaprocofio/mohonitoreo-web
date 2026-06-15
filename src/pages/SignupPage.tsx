import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Button } from '../components/ui/Button'
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
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand-slateDark via-brand-slate to-brand-tealDark p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="bg-gradient-to-br from-brand-teal to-brand-tealDark p-8 text-center text-white">
          <h1 className="text-2xl font-extrabold">Crear cuenta</h1>
        </div>
        <form className="space-y-4 p-8" onSubmit={handleSubmit}>
          {error && <Alert tone="danger">{error}</Alert>}
          {ok && <Alert tone="success">¡Cuenta creada! Redirigiendo al inicio de sesión…</Alert>}
          <div>
            <Label htmlFor="cedula">Cédula</Label>
            <Input id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="nombre">Nombre</Label>
            <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
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
          <Button type="submit" className="w-full" disabled={enviando || ok}>
            {enviando ? 'Creando…' : 'Crear cuenta'}
          </Button>
          <p className="text-center text-sm text-slate-500">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="font-semibold text-brand-tealDark">
              Iniciar sesión
            </Link>
          </p>
        </form>
      </div>
    </div>
  )
}
