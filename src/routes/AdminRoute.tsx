import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/Spinner'

export function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, rol, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  if (rol !== 'admin') return <Navigate to="/dashboard" replace />
  return <>{children}</>
}
