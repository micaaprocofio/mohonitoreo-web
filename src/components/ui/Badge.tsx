import { cn } from '../../lib/cn'
import type { ColorEstado } from '../../features/lecturas/estado'

const tones: Record<ColorEstado, string> = {
  danger: 'bg-red-100 text-red-700',
  success: 'bg-emerald-100 text-emerald-700',
  warning: 'bg-amber-100 text-amber-700',
  secondary: 'bg-slate-100 text-slate-600',
}

export function Badge({
  tone = 'secondary',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: ColorEstado }) {
  return (
    <span
      className={cn(
        'inline-block rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wide',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
