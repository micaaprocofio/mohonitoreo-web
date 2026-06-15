import { cn } from '../../lib/cn'

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'w-full rounded-xl border border-slate-300 px-4 py-2.5 text-slate-900 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/30',
        className,
      )}
      {...props}
    />
  )
}

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1 block text-sm font-semibold text-slate-600', className)} {...props} />
  )
}

export function Select({ className, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        'w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-slate-900 outline-none transition focus:border-brand-teal focus:ring-2 focus:ring-brand-teal/30',
        className,
      )}
      {...props}
    />
  )
}
