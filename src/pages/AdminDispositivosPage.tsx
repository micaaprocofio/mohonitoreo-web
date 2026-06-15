import { PageLayout } from '../components/PageLayout'
import { Card, CardBody } from '../components/ui/Card'
import { Spinner } from '../components/Spinner'
import { useDispositivos } from '../features/admin/useDispositivos'

export function AdminDispositivosPage() {
  const { items, loading } = useDispositivos()

  return (
    <PageLayout>
      <h2 className="text-2xl font-extrabold text-slate-900">Dispositivos</h2>
      <p className="mt-1 text-slate-500">Dispositivos registrados y su usuario asociado.</p>

      <Card className="mt-6 overflow-hidden">
        <CardBody className="p-0">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No hay dispositivos registrados.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Dispositivo</th>
                  <th className="px-6 py-3 font-semibold">Token</th>
                  <th className="px-6 py-3 font-semibold">Usuario</th>
                  <th className="px-6 py-3 font-semibold">Cédula</th>
                  <th className="px-6 py-3 font-semibold">Creado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((d) => (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="px-6 py-3 text-slate-700">{d.dispositivo}</td>
                    <td className="px-6 py-3 font-mono text-xs text-slate-500">{d.deviceToken}</td>
                    <td className="px-6 py-3 text-slate-700">{d.usuario}</td>
                    <td className="px-6 py-3 text-slate-700">{d.cedula}</td>
                    <td className="px-6 py-3 text-slate-500">
                      {d.fechaCreacion ? d.fechaCreacion.toLocaleString('es') : '--'}
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
