import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { HistorialItem } from './useHistorial'

interface HistorialChartProps {
  items: HistorialItem[]
}

export function HistorialChart({ items }: HistorialChartProps) {
  const data = items
    .filter((it) => it.timestamp)
    .map((it) => ({
      timestamp: it.timestamp!.getTime(),
      temperatura: it.temperatura,
      humedad: it.humedad,
    }))
    .sort((a, b) => a.timestamp - b.timestamp)

  return (
    <div className="px-6 py-5 border-b border-brand-border">
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="timestamp"
            type="number"
            domain={['dataMin', 'dataMax']}
            tickFormatter={(ts: number) =>
              new Date(ts).toLocaleString('es-UY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            }
            tick={{ fontSize: 11 }}
            minTickGap={40}
          />
          <YAxis yAxisId="temp" tick={{ fontSize: 11 }} width={40} />
          <YAxis yAxisId="hum" orientation="right" tick={{ fontSize: 11 }} width={40} />
          <Tooltip
            labelFormatter={(ts) =>
              new Date(Number(ts)).toLocaleString('es-UY', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
            }
            formatter={(value, name) =>
              name === 'temperatura'
                ? [`${Number(value).toFixed(1)} °C`, 'Temperatura']
                : [`${Number(value).toFixed(1)} %`, 'Humedad']
            }
          />
          <Legend formatter={(value: string) => (value === 'temperatura' ? 'Temperatura' : 'Humedad')} />
          <Line
            yAxisId="temp"
            type="monotone"
            dataKey="temperatura"
            stroke="#f97316"
            strokeWidth={2}
            dot={false}
          />
          <Line
            yAxisId="hum"
            type="monotone"
            dataKey="humedad"
            stroke="#0ea5e9"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
