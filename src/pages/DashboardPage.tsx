import { useAuth } from '../auth/useAuth'
import { PageLayout } from '../components/PageLayout'
import { Alert } from '../components/ui/Alert'
import { useUltimaLectura } from '../features/lecturas/useUltimaLectura'
import type { ColorEstado } from '../features/lecturas/estado'

// ── Design tokens ────────────────────────────────────────────────────────────
const ACCENT = '#0f766e'
const WARM   = '#c2703f'   // temperature
const OK     = '#2f8f5b'
const WARN   = '#b8791f'
const DANGER = '#c0413a'

const estadoColor: Record<ColorEstado, string> = {
  success:   OK,
  warning:   WARN,
  danger:    DANGER,
  secondary: '#8a8f99',
}

// ── SVG gauge helpers ─────────────────────────────────────────────────────────
function polar(frac: number, cx = 90, cy = 84, r = 68): [number, number] {
  const a = (180 - 180 * frac) * (Math.PI / 180)
  return [cx + r * Math.cos(a), cy - r * Math.sin(a)]
}

function arc(f0: number, f1: number): string {
  const r = 68
  const [x0, y0] = polar(f0)
  const [x1, y1] = polar(f1)
  return `M ${x0.toFixed(1)} ${y0.toFixed(1)} A ${r} ${r} 0 0 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`
}

const TRACK = arc(0, 1)

// ── Sparkline helper ──────────────────────────────────────────────────────────
function sparkPoints(arr: number[], w: number, h: number, mn: number, mx: number): string {
  return arr
    .map((v, i) => {
      const x = (i / (arr.length - 1)) * w
      const y = h - ((v - mn) / (mx - mn)) * h
      return `${x.toFixed(1)},${y.toFixed(1)}`
    })
    .join(' ')
}

// Static demo sparklines (last 24 readings)
const TEMP_SPARK_PTS = sparkPoints(
  [22.8,23.1,23.0,23.4,23.9,24.2,24.0,24.5,25.1,25.4,25.0,24.7,24.3,24.1,23.8,24.0,24.4,24.9,25.2,24.8,24.5,24.2,24.3,24.3],
  240, 40, 22, 26,
)
const HUM_SPARK_PTS = sparkPoints(
  [61,60,59,58,57,56,57,58,59,60,61,62,61,60,59,58,57,58,59,60,59,58,58,58],
  240, 40, 54, 64,
)

// ── Sub-components ────────────────────────────────────────────────────────────
interface GaugeCardProps {
  label: string
  sensor: string
  value: number | null
  unit: string
  max: number
  color: string
  sparkPoints: string
}

function GaugeCard({ label, sensor, value, unit, max, color, sparkPoints }: GaugeCardProps) {
  const frac = value != null ? Math.max(0.001, Math.min(1, value / max)) : 0.001
  const arcPath = arc(0, frac)
  const displayVal = value != null ? value.toFixed(1) : '--'

  return (
    <div className="bg-white border border-brand-border rounded-card p-5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-semibold text-brand-subtle">{label}</span>
        <span className="font-mono text-[10px] text-brand-placeholder">{sensor}</span>
      </div>

      <div className="relative flex justify-center">
        <svg width="100%" viewBox="0 0 180 96" className="block max-w-[200px]">
          <path d={TRACK}   fill="none" stroke="#eceef0" strokeWidth="11" strokeLinecap="round" />
          <path d={arcPath} fill="none" stroke={color}   strokeWidth="11" strokeLinecap="round" />
        </svg>
        <div className="absolute bottom-1 left-0 right-0 text-center">
          <span className="font-mono text-[38px] font-bold tracking-tight text-brand-ink leading-none">
            {displayVal}
          </span>
          <span className="font-mono text-base font-medium text-brand-muted ml-0.5">{unit}</span>
        </div>
      </div>

      <svg width="100%" height="40" viewBox="0 0 240 40" preserveAspectRatio="none" className="mt-2.5 block">
        <polyline
          points={sparkPoints}
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinejoin="round"
          opacity="0.55"
        />
      </svg>
    </div>
  )
}

function StatusCard({ color, estado, mensaje }: { color: ColorEstado; estado: string; mensaje: string }) {
  const c = estadoColor[color]
  return (
    <div className="bg-white border border-brand-border rounded-card p-5 flex flex-col">
      <span className="text-sm font-semibold text-brand-subtle mb-auto">Estado del ambiente</span>
      <div className="flex-1 flex flex-col justify-center gap-3.5 py-2">
        <div className="flex items-center gap-3">
          <span
            className="w-3.5 h-3.5 rounded-full flex-shrink-0"
            style={{ background: c, boxShadow: `0 0 0 5px ${c}25` }}
          />
          <span className="text-3xl font-bold tracking-tight" style={{ color: c }}>
            {estado}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-brand-subtle">{mensaje}</p>
      </div>
      <div className="flex items-center gap-2 font-mono text-[11px] text-brand-muted border-t border-brand-border pt-3">
        <span style={{ color: OK }}>●</span> Rango 18–28 °C / 40–70 %
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8a8f99" strokeWidth="2" strokeLinecap="round">
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
)

export function DashboardPage() {
  const { user } = useAuth()
  const { status, lectura } = useUltimaLectura(user?.id)
  const hayDatos = status === 'ok' && lectura !== null

  return (
    <PageLayout>
      {/* Page header */}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-[22px] font-bold tracking-tight text-brand-ink">Panel de control</h1>
          <p className="text-sm text-brand-subtle mt-1">Monitoreo ambiental en tiempo real</p>
        </div>

        {hayDatos && !lectura.desactualizado ? (
          <div className="flex items-center gap-2.5 text-sm font-semibold text-brand-ok bg-brand-okLight px-3.5 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-brand-ok" style={{ animation: 'mh-pulse 1.8s ease-in-out infinite' }} />
            Sistema conectado
          </div>
        ) : hayDatos && lectura.desactualizado ? (
          <div className="flex items-center gap-2.5 text-sm font-semibold text-brand-warning bg-brand-warningLight px-3.5 py-2 rounded-full">
            <span className="w-2 h-2 rounded-full bg-brand-warning" />
            Datos desactualizados
          </div>
        ) : null}
      </div>

      {/* Alerts */}
      {status === 'loading' && (
        <Alert tone="info" className="mb-5">Cargando datos del sistema...</Alert>
      )}
      {status === 'sin-datos' && (
        <Alert tone="warning" className="mb-5">
          Sin datos disponibles. Verificá que el lector serial esté corriendo y el Arduino esté asociado a tu cédula.
        </Alert>
      )}

      {/* Metric cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <GaugeCard
          label="Temperatura"
          sensor="DHT11 · P8"
          value={hayDatos ? lectura.temperatura : null}
          unit="°C"
          max={50}
          color={WARM}
          sparkPoints={TEMP_SPARK_PTS}
        />
        <GaugeCard
          label="Humedad"
          sensor="DHT11 · P10"
          value={hayDatos ? lectura.humedad : null}
          unit="%"
          max={100}
          color={ACCENT}
          sparkPoints={HUM_SPARK_PTS}
        />
        {hayDatos ? (
          <StatusCard
            color={lectura.color}
            estado={lectura.estado}
            mensaje={lectura.mensaje}
          />
        ) : (
          <div className="bg-white border border-brand-border rounded-card p-5 flex items-center justify-center">
            <span className="text-sm text-brand-muted">Sin datos</span>
          </div>
        )}
      </div>

      {/* Last reading */}
      <div className="bg-white border border-brand-border rounded-card px-5 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <ClockIcon />
          <span className="text-sm text-brand-subtle">Última lectura</span>
          <span className="font-mono text-sm text-brand-ink">
            {hayDatos
              ? lectura.timestamp.toLocaleString('es-UY', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })
              : '—'}
          </span>
        </div>
        {hayDatos && (
          <span
            className={`text-xs font-semibold px-3 py-1.5 rounded-full ${
              lectura.desactualizado
                ? 'text-brand-warning bg-brand-warningLight'
                : 'text-brand-ok bg-brand-okLight'
            }`}
          >
            {lectura.desactualizado ? 'Desactualizado' : 'Actualizado'}
          </span>
        )}
      </div>
    </PageLayout>
  )
}
