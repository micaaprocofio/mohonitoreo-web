import { useAuth } from '../auth/useAuth'
import { PageLayout } from '../components/PageLayout'
import { Card, CardBody } from '../components/ui/Card'
import { Alert } from '../components/ui/Alert'
import { useUltimaLectura } from '../features/lecturas/useUltimaLectura'
import type { ColorEstado } from '../features/lecturas/estado'

const estadoTextColor: Record<ColorEstado, string> = {
  danger: 'text-red-600',
  success: 'text-emerald-600',
  warning: 'text-amber-600',
  secondary: 'text-slate-400',
}

function MetricCard({
  icon,
  iconBg,
  title,
  value,
  hint,
}: {
  icon: string
  iconBg: string
  title: string
  value: string
  hint?: string
}) {
  return (
    <Card className="transition hover:-translate-y-1">
      <CardBody className="text-center">
        <div
          className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
          style={{ background: iconBg }}
        >
          {icon}
        </div>
        <div className="text-sm font-semibold text-slate-500">{title}</div>
        <div className="text-4xl font-extrabold text-slate-900">{value}</div>
        {hint && <div className="mt-1 text-sm text-slate-400">{hint}</div>}
      </CardBody>
    </Card>
  )
}

export function DashboardPage() {
  const { user } = useAuth()
  const { status, lectura } = useUltimaLectura(user?.id)

  const hayDatos = status === 'ok' && lectura !== null

  return (
    <PageLayout>
      <div className="rounded-3xl bg-gradient-to-br from-brand-tealDark to-brand-teal p-8 text-white shadow-xl">
        <h2 className="text-2xl font-extrabold">Panel principal</h2>
        <p className="mt-1 opacity-90">Monitoreo ambiental en tiempo real.</p>
      </div>

      <div className="mt-6">
        {status === 'loading' && <Alert tone="secondary">Cargando datos…</Alert>}
        {status === 'sin-datos' && (
          <Alert tone="warning">
            No hay lecturas para tu usuario. Verificá que el lector serial esté corriendo y que el
            Arduino esté asociado a tu cédula.
          </Alert>
        )}
        {hayDatos &&
          (lectura.desactualizado ? (
            <Alert tone="warning">
              La última lectura tiene más de 1 minuto. ¿Está corriendo el lector serial con el
              Arduino conectado?
            </Alert>
          ) : (
            <Alert tone="info">Datos actualizados correctamente.</Alert>
          ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MetricCard
          icon="🌡️"
          iconBg="#fee2e2"
          title="Temperatura actual"
          value={hayDatos ? `${lectura.temperatura.toFixed(1)} °C` : '-- °C'}
          hint="Sensor conectado al pin 8"
        />
        <MetricCard
          icon="💧"
          iconBg="#dbeafe"
          title="Humedad actual"
          value={hayDatos ? `${lectura.humedad.toFixed(1)} %` : '-- %'}
          hint="Sensor conectado al pin 10"
        />
        <Card>
          <CardBody className="text-center">
            <div
              className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
              style={{ background: '#dcfce7' }}
            >
              {hayDatos ? lectura.icono : '❔'}
            </div>
            <div className="text-sm font-semibold text-slate-500">Estado de humedad</div>
            <div
              className={
                'text-3xl font-black ' +
                (hayDatos ? estadoTextColor[lectura.color] : 'text-slate-400')
              }
            >
              {hayDatos ? lectura.estado : '--'}
            </div>
            <div className="mt-2 text-sm text-slate-400">
              {hayDatos ? lectura.mensaje : 'Esperando lectura…'}
            </div>
          </CardBody>
        </Card>
      </div>

      <Card className="mt-6">
        <CardBody>
          <h5 className="font-bold text-slate-800">Última actualización</h5>
          <p className="mt-1 text-slate-500">
            {hayDatos ? lectura.timestamp.toLocaleString('es') : '--'}
          </p>
        </CardBody>
      </Card>
    </PageLayout>
  )
}
