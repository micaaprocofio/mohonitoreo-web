import { useState } from 'react'
import { PageLayout } from '../components/PageLayout'
import { Input, Label, Select } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { useUsuarios } from '../features/admin/useUsuarios'
import { createUser } from '../features/admin/createUser'
import type { Rol } from '../types/db'

const ACCENT = '#0f766e'

function InitialAvatar({ initials, color }: { initials: string; color?: string }) {
  return (
    <div
      className="w-[34px] h-[34px] rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0"
      style={{ background: color ? `${color}1a` : '#e6e7ea', color: color ?? '#565a63' }}
    >
      {initials}
    </div>
  )
}

function getInitials(nombre: string) {
  return nombre
    .split(' ')
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

export function AdminUsuariosPage() {
  const { usuarios, loading, refetch } = useUsuarios()
  const [cedula, setCedula] = useState('')
  const [nombre, setNombre] = useState('')
  const [password, setPassword] = useState('')
  const [rol, setRol] = useState<Rol>('usuario')
  const [error, setError] = useState<string | null>(null)
  const [mensaje, setMensaje] = useState<string | null>(null)
  const [enviando, setEnviando] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMensaje(null)

    if (!cedula.trim() || !nombre.trim()) {
      setError('La cédula y el nombre son obligatorios.')
      return
    }
    setEnviando(true)
    try {
      await createUser({ cedula, nombre, password, rol })
      setMensaje('Usuario creado correctamente.')
      setCedula('')
      setNombre('')
      setPassword('')
      setRol('usuario')
      await refetch()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo crear el usuario.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <PageLayout>
      <div className="bg-white border border-brand-borderStrong rounded-xl shadow-panel overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr]">

          {/* Left: user list */}
          <div className="border-r border-brand-border">
            <div className="px-6 py-5 border-b border-brand-border">
              <h1 className="text-lg font-bold tracking-tight text-brand-ink">Usuarios</h1>
            </div>

            {loading ? (
              <div className="px-6 py-10 text-center font-mono text-sm text-brand-muted">Cargando...</div>
            ) : usuarios.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-brand-muted">No hay usuarios.</div>
            ) : (
              usuarios.map((u) => {
                const isAdmin = u.rol === 'admin'
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between px-6 py-4 border-t border-brand-border first:border-t-0"
                  >
                    <div className="flex items-center gap-3">
                      <InitialAvatar
                        initials={getInitials(u.nombre)}
                        color={isAdmin ? ACCENT : undefined}
                      />
                      <div>
                        <div className="text-sm font-semibold text-brand-ink">{u.nombre}</div>
                        <div className="font-mono text-[11px] text-brand-muted">{u.cedula}</div>
                      </div>
                    </div>
                    <span
                      className="text-xs font-semibold px-2.5 py-1 rounded-full"
                      style={
                        isAdmin
                          ? { color: ACCENT, background: `${ACCENT}1a` }
                          : { color: '#6b7079', background: '#f0f1f3' }
                      }
                    >
                      {isAdmin ? 'Admin' : 'Usuario'}
                    </span>
                  </div>
                )
              })
            )}
          </div>

          {/* Right: create form */}
          <div className="bg-brand-surfaceMid p-6">
            <h2 className="text-sm font-bold text-brand-ink mb-4">Nuevo usuario</h2>

            {error   && <Alert tone="danger"  className="mb-4">{error}</Alert>}
            {mensaje && <Alert tone="success" className="mb-4">{mensaje}</Alert>}

            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="u-nombre">Nombre</Label>
                <Input
                  id="u-nombre"
                  placeholder="Nombre y apellido"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="u-cedula">Cédula</Label>
                <Input
                  id="u-cedula"
                  placeholder="0.000.000-0"
                  value={cedula}
                  onChange={(e) => setCedula(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="u-password">Contraseña</Label>
                <Input
                  id="u-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="u-rol">Rol</Label>
                <div className="flex gap-2">
                  {(['usuario', 'admin'] as Rol[]).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRol(r)}
                      className={`flex-1 text-center text-sm font-semibold rounded-lg py-2.5 transition-colors ${
                        rol === r
                          ? 'text-brand-accent bg-brand-accentLight'
                          : 'text-brand-subtle border border-brand-border bg-white hover:bg-brand-border'
                      }`}
                    >
                      {r === 'admin' ? 'Admin' : 'Usuario'}
                    </button>
                  ))}
                </div>
                {/* Hidden select for form semantics */}
                <Select id="u-rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)} className="sr-only">
                  <option value="usuario">Usuario</option>
                  <option value="admin">Admin</option>
                </Select>
              </div>

              <button
                type="submit"
                disabled={enviando}
                className="mt-2 w-full rounded-[10px] bg-brand-accent py-3 text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {enviando ? 'Creando...' : 'Crear usuario'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  )
}
