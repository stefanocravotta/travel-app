import { useContext } from 'react'
import { AuthContext } from '@/features/auth/AuthContext'
import type { AuthContextValue } from '@/features/auth/AuthContext'

// ≈ `inject(AuthService)` in Angular.
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth deve essere usato dentro <AuthProvider>.')
  }
  return context
}
