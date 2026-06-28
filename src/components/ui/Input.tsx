import { cn } from '../../lib/cn'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-[10px] border border-brand-borderStrong bg-brand-surfaceMid px-3.5 py-3 font-mono text-sm text-brand-ink placeholder:text-brand-placeholder outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn('mb-1.5 block text-xs font-semibold text-brand-subtle', className)}
      {...props}
    />
  )
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-[10px] border border-brand-borderStrong bg-brand-surfaceMid px-3.5 py-3 text-sm text-brand-ink outline-none transition-colors focus:border-brand-accent focus:ring-1 focus:ring-brand-accent',
        className,
      )}
      {...props}
    />
  )
}
