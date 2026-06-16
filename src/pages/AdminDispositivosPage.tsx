import { PageLayout } from '../components/PageLayout'
import { useDispositivos } from '../features/admin/useDispositivos'

export function AdminDispositivosPage() {
  const { items, loading } = useDispositivos()

  return (
    <PageLayout>
      <div className="bg-white border border-brand-borderStrong rounded-xl shadow-panel overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-brand-border">
          <h1 className="text-lg font-bold tracking-tight text-brand-ink">Dispositivos</h1>
          <p className="text-sm text-brand-muted mt-0.5">Dispositivos registrados y su usuario asociado.</p>
        </div>

        {loading ? (
          <div className="px-6 py-10 text-center font-mono text-sm text-brand-muted">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-brand-muted">No hay dispositivos registrados.</div>
        ) : (
          <div>
            <div className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr] px-6 py-3 bg-brand-headerBg font-mono text-[10px] tracking-wider uppercase text-brand-muted">
              <span>Dispositivo</span>
              <span>Token</span>
              <span>Usuario</span>
              <span>Cédula</span>
              <span>Creado</span>
            </div>

            {items.map((d) => (
              <div
                key={d.id}
                className="grid grid-cols-[1.5fr_2fr_1fr_1fr_1fr] items-center px-6 py-3.5 border-t border-brand-border hover:bg-brand-rowHover transition-colors"
              >
                <span className="text-sm text-brand-ink">{d.dispositivo}</span>
                <span className="font-mono text-xs text-brand-muted truncate pr-4">{d.deviceToken}</span>
                <span className="text-sm text-brand-ink">{d.usuario}</span>
                <span className="font-mono text-sm text-brand-ink">{d.cedula}</span>
                <span className="text-sm text-brand-subtle">
                  {d.fechaCreacion ? d.fechaCreacion.toLocaleDateString('es') : '--'}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  )
}
