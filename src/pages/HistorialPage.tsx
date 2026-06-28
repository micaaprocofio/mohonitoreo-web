import { useAuth } from '../auth/useAuth'
import { PageLayout } from '../components/PageLayout'
import { Badge } from '../components/ui/Badge'
import { useHistorial } from '../features/lecturas/useHistorial'

export function HistorialPage() {
  const { user } = useAuth()
  const { loading, items } = useHistorial(user?.id)

  return (
    <PageLayout>
      <div className="bg-white border border-brand-borderStrong rounded-xl shadow-panel overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-brand-border">
          <div>
            <h1 className="text-lg font-bold tracking-tight text-brand-ink">Historial de lecturas</h1>
            <p className="text-sm text-brand-muted mt-0.5">
              {items.length > 0 ? `${items.length} registros encontrados` : 'Sin registros disponibles'}
            </p>
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="px-6 py-10 text-center font-mono text-sm text-brand-muted">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-brand-muted">No hay lecturas registradas.</div>
        ) : (
          <div>
            {/* Column headers */}
            <div className="grid grid-cols-[2fr_1fr_1fr_1fr] px-6 py-3 bg-brand-headerBg font-mono text-[10px] tracking-wider uppercase text-brand-muted">
              <span>Fecha y hora</span>
              <span>Temperatura</span>
              <span>Humedad</span>
              <span>Estado</span>
            </div>

            {items.map((it, i) => (
              <div
                key={i}
                className="grid grid-cols-[2fr_1fr_1fr_1fr] items-center px-6 py-3.5 border-t border-brand-border hover:bg-brand-rowHover transition-colors"
              >
                <span className="text-sm text-brand-ink">
                  {it.timestamp
                    ? it.timestamp.toLocaleString('es-UY', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--'}
                </span>
                <span className="font-mono text-sm text-brand-ink">{it.temperatura.toFixed(1)} °C</span>
                <span className="font-mono text-sm text-brand-ink">{it.humedad.toFixed(1)} %</span>
                <span>
                  <Badge tone={it.color}>{it.estado}</Badge>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
