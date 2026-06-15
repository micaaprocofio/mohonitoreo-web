import { Navigate } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { Spinner } from '../components/Spinner'

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <Spinner />
  if (!user) return <Navigate to="/login" replace />
  return <>{children}</>
}
