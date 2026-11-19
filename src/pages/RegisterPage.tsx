import { Navigate } from 'react-router'
import { PageLoader } from '@/components/PageLoader'
import { RegisterForm } from '@/features/auth/components/RegisterForm'
import { useAuth } from '@/features/auth/useAuth'

export function RegisterPage() {
  const { status } = useAuth()

  if (status === 'loading') {
    return <PageLoader />
  }

  // Se il signup crea subito una sessione (conferma email disattivata), o se
  // l'utente è già loggato, si entra direttamente nell'app.
  if (status === 'authenticated') {
    return <Navigate to="/" replace />
  }

  return <RegisterForm />
}
