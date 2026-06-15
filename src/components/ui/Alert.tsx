import { cn } from '../../lib/cn'
import type { ColorEstado } from '../../features/lecturas/estado'

type Tone = ColorEstado | 'info'

const tones: Record<Tone, string> = {
  danger: 'bg-red-50 text-red-800 border-red-200',
  success: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  warning: 'bg-amber-50 text-amber-800 border-amber-200',
  secondary: 'bg-slate-100 text-slate-700 border-slate-200',
  info: 'bg-sky-50 text-sky-800 border-sky-200',
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone
}

export function Alert({ tone = 'secondary', className, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn('rounded-2xl border px-5 py-4 text-sm font-medium', tones[tone], className)}
      {...props}
    />
  )
}
