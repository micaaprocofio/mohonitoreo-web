import { cn } from '../../lib/cn'
import type { ColorEstado } from '../../features/lecturas/estado'

const tones: Record<ColorEstado, string> = {
  success:   'text-brand-ok bg-brand-okLight',
  warning:   'text-brand-warning bg-brand-warningLight',
  danger:    'text-brand-danger bg-brand-dangerLight',
  secondary: 'text-brand-subtle bg-brand-border',
}

export function Badge({
  tone = 'secondary',
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: ColorEstado }) {
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
        tones[tone],
        className,
      )}
      {...props}
    />
  )
}
