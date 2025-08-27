import { useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/auth'

export function AuthRedirect() {
  const { profile: user, isAuthenticated, isLoading: loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    if (loading) return

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
      navigate('/login?from=' + encodeURIComponent(location.pathname))
      return
    }

    // If authenticated, redirect based on user type
    if (user) {
      const currentPath = location.pathname

      // Don't redirect if user is already in the correct area
      switch (user.role) {
        case 'super_admin':
          if (!currentPath.startsWith('/super-admin') && currentPath !== '/') {
            navigate('/super-admin/dashboard')
          }
          break
        case 'guest':
          if (!currentPath.startsWith('/cidadao') && currentPath !== '/') {
            navigate('/cidadao/dashboard')
          }
          break
        default:
          // Administrative users (admin, user, etc.)
          if (!currentPath.startsWith('/admin') && currentPath !== '/') {
            navigate('/admin/dashboard')
          }
          break
      }
    }
  }, [user, isAuthenticated, loading, navigate, location])

  return null
}