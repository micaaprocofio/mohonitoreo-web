import { useAuth } from '../auth/useAuth'
import { PageLayout } from '../components/PageLayout'
import { Card, CardBody } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Spinner } from '../components/Spinner'
import { useHistorial } from '../features/lecturas/useHistorial'

export function HistorialPage() {
  const { user } = useAuth()
  const { loading, items } = useHistorial(user?.id)

  return (
    <PageLayout>
      <h2 className="text-2xl font-extrabold text-slate-900">Historial de lecturas</h2>
      <p className="mt-1 text-slate-500">Últimas {items.length} lecturas registradas.</p>

      <Card className="mt-6 overflow-hidden">
        <CardBody className="p-0">
          {loading ? (
            <Spinner />
          ) : items.length === 0 ? (
            <p className="p-6 text-center text-slate-500">No hay lecturas registradas.</p>
          ) : (
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-6 py-3 font-semibold">Fecha y hora</th>
                  <th className="px-6 py-3 font-semibold">Temperatura</th>
                  <th className="px-6 py-3 font-semibold">Humedad</th>
                  <th className="px-6 py-3 font-semibold">Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i} className="border-t border-slate-100">
                    <td className="px-6 py-3 text-slate-700">
                      {it.timestamp ? it.timestamp.toLocaleString('es') : '--'}
                    </td>
                    <td className="px-6 py-3 text-slate-700">{it.temperatura.toFixed(1)} °C</td>
                    <td className="px-6 py-3 text-slate-700">{it.humedad.toFixed(1)} %</td>
                    <td className="px-6 py-3">
                      <Badge tone={it.color}>{it.estado}</Badge>
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
