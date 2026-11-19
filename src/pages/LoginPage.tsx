import { Navigate, useLocation } from 'react-router'
import { PageLoader } from '@/components/PageLoader'
import { LoginForm } from '@/features/auth/components/LoginForm'
import { getRedirectTarget } from '@/features/auth/redirect'
import { useAuth } from '@/features/auth/useAuth'

export function LoginPage() {
  const { status } = useAuth()
  const location = useLocation()

  if (status === 'loading') {
    return <PageLoader />
  }

  // Già autenticato (o appena autenticato, quando arriva SIGNED_IN): torna
  // alla pagina che aveva chiesto RequireAuth, o alla home.
  // ≈ in Angular `router.navigateByUrl(returnUrl)` dopo il login.
  if (status === 'authenticated') {
    return <Navigate to={getRedirectTarget(location.state)} replace />
  }

  return <LoginForm />
}
