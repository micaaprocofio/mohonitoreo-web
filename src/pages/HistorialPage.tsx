import { useMemo, useState } from 'react'
import { useAuth } from '../auth/useAuth'
import { PageLayout } from '../components/PageLayout'
import { Badge } from '../components/ui/Badge'
import { HistorialChart } from '../features/lecturas/HistorialChart'
import type { EstadoHumedad } from '../features/lecturas/estado'
import { useHistorial } from '../features/lecturas/useHistorial'

type RangoFecha = '24h' | '7d' | '30d' | 'todo'
type FiltroEstado = EstadoHumedad | 'todos'

const RANGOS: { value: RangoFecha; label: string }[] = [
  { value: '24h', label: 'Últimas 24h' },
  { value: '7d', label: 'Últimos 7 días' },
  { value: '30d', label: 'Últimos 30 días' },
  { value: 'todo', label: 'Todo' },
]

const ESTADOS: { value: FiltroEstado; label: string }[] = [
  { value: 'todos', label: 'Todos los estados' },
  { value: 'Crítico', label: 'Crítico' },
  { value: 'Alto', label: 'Alto' },
  { value: 'Óptimo', label: 'Óptimo' },
  { value: 'Bajo', label: 'Bajo' },
]

const CANTIDADES = [10, 25, 50, 100]

function calcularDesde(rango: RangoFecha): Date | undefined {
  if (rango === 'todo') return undefined
  const dias = rango === '24h' ? 1 : rango === '7d' ? 7 : 30
  return new Date(Date.now() - dias * 24 * 60 * 60 * 1000)
}

export function HistorialPage() {
  const { user } = useAuth()
  const [rango, setRango] = useState<RangoFecha>('todo')
  const [estado, setEstado] = useState<FiltroEstado>('todos')
  const [limite, setLimite] = useState(25)

  const desde = useMemo(() => calcularDesde(rango), [rango])
  const filtros = useMemo(() => ({ limite, desde }), [limite, desde])

  const { loading, items: itemsCrudos } = useHistorial(user?.id, filtros)
  const items = useMemo(
    () => (estado === 'todos' ? itemsCrudos : itemsCrudos.filter((it) => it.estado === estado)),
    [itemsCrudos, estado],
  )

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

        {/* Filtros */}
        <div className="flex flex-wrap items-center gap-3 px-6 py-4 border-b border-brand-border bg-brand-headerBg">
          <select
            value={rango}
            onChange={(e) => setRango(e.target.value as RangoFecha)}
            className="text-sm border border-brand-border rounded-lg px-3 py-1.5 bg-white text-brand-ink"
          >
            {RANGOS.map((r) => (
              <option key={r.value} value={r.value}>
                {r.label}
              </option>
            ))}
          </select>

          <select
            value={estado}
            onChange={(e) => setEstado(e.target.value as FiltroEstado)}
            className="text-sm border border-brand-border rounded-lg px-3 py-1.5 bg-white text-brand-ink"
          >
            {ESTADOS.map((e) => (
              <option key={e.value} value={e.value}>
                {e.label}
              </option>
            ))}
          </select>

          <select
            value={limite}
            onChange={(e) => setLimite(Number(e.target.value))}
            className="text-sm border border-brand-border rounded-lg px-3 py-1.5 bg-white text-brand-ink ml-auto"
          >
            {CANTIDADES.map((c) => (
              <option key={c} value={c}>
                Mostrar {c}
              </option>
            ))}
          </select>
        </div>

        {/* Chart + Table */}
        {loading ? (
          <div className="px-6 py-10 text-center font-mono text-sm text-brand-muted">Cargando...</div>
        ) : items.length === 0 ? (
          <div className="px-6 py-10 text-center text-sm text-brand-muted">
            No hay lecturas que coincidan con los filtros.
          </div>
        ) : (
          <div>
            <HistorialChart items={items} />
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
