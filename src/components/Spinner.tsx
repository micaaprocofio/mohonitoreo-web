export function Spinner({ label = 'Cargando…' }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] items-center justify-center" role="status">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-brand-teal border-t-transparent" />
      <span className="sr-only">{label}</span>
    </div>
  )
}
