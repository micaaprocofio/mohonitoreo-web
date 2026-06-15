import { cn } from '../../lib/cn'

type Variant = 'primary' | 'outline' | 'danger' | 'warning' | 'ghost'

const variants: Record<Variant, string> = {
  primary: 'bg-brand-teal text-white hover:bg-brand-tealDark',
  outline: 'border border-slate-300 bg-white text-slate-800 hover:bg-slate-50',
  danger: 'bg-red-500 text-white hover:bg-red-600',
  warning: 'bg-amber-400 text-slate-900 hover:bg-amber-500',
  ghost: 'text-white/90 hover:bg-white/10',
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

export function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60',
        variants[variant],
        className,
      )}
      {...props}
    />
  )
}
