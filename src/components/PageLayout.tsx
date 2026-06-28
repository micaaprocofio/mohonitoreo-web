import { NavBar } from './NavBar'

export function PageLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-bg">
      <NavBar />
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  )
}
