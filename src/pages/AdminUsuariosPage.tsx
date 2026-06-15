import { useState } from 'react'
import { PageLayout } from '../components/PageLayout'
import { Card, CardBody } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input, Label, Select } from '../components/ui/Input'
import { Alert } from '../components/ui/Alert'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/Spinner'
import { useUsuarios } from '../features/admin/useUsuarios'
import { createUser } from '../features/admin/createUser'
import type { Rol } from '../types/db'

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
      <h2 className="text-2xl font-extrabold text-slate-900">Administración de usuarios</h2>

      <Card className="mt-6">
        <CardBody>
          <h3 className="mb-4 text-lg font-bold text-slate-800">Crear usuario</h3>
          {error && <Alert tone="danger" className="mb-4">{error}</Alert>}
          {mensaje && <Alert tone="success" className="mb-4">{mensaje}</Alert>}
          <form className="grid gap-4 md:grid-cols-4" onSubmit={handleSubmit}>
            <div>
              <Label htmlFor="cedula">Cédula</Label>
              <Input id="cedula" value={cedula} onChange={(e) => setCedula(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="nombre">Nombre</Label>
              <Input id="nombre" value={nombre} onChange={(e) => setNombre(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="rol">Rol</Label>
              <Select id="rol" value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
                <option value="usuario">Usuario</option>
                <option value="admin">Admin</option>
              </Select>
            </div>
            <div className="md:col-span-4">
              <Button type="submit" disabled={enviando}>
                {enviando ? 'Creando…' : 'Crear usuario'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-6 overflow-hidden">
        <CardBody className="p-0">
          {loading ? (
            <Spinner />
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Cédula</th>
                  <th className="px-6 py-3 font-semibold">Nombre</th>
                  <th className="px-6 py-3 font-semibold">Rol</th>
                  <th className="px-6 py-3 font-semibold">Creado</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map((u) => (
                  <tr key={u.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 text-slate-700">{u.cedula}</td>
                    <td className="px-6 py-3 text-slate-700">{u.nombre}</td>
                    <td className="px-6 py-3">
                      <Badge tone={u.rol === 'admin' ? 'danger' : 'secondary'}>{u.rol}</Badge>
                    </td>
                    <td className="px-6 py-3 text-slate-500">
                      {u.fecha_creacion ? new Date(u.fecha_creacion).toLocaleString('es') : '--'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardBody>
      </Card>
    </PageLayout>
  )
}
