import { cn } from '../../lib/cn'
import type { ColorEstado } from '../../features/lecturas/estado'

type Tone = ColorEstado | 'info'

const tones: Record<Tone, string> = {
  danger:    'bg-brand-dangerLight  text-brand-danger  border-brand-danger/20',
  success:   'bg-brand-okLight      text-brand-ok      border-brand-ok/20',
  warning:   'bg-brand-warningLight text-brand-warning border-brand-warning/20',
  secondary: 'bg-brand-border       text-brand-subtle  border-brand-border',
  info:      'bg-brand-accentLight  text-brand-accent  border-brand-accent/20',
}

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: Tone
}

export function Alert({ tone = 'secondary', className, children, ...props }: AlertProps) {
  return (
    <div
      role="alert"
      className={cn(
        'rounded-[10px] border px-4 py-3 text-sm',
        tones[tone],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}
