import { createContext } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import type { AuthErrorKey } from '@/i18n/locales/en/auth'

// 'loading' finché Supabase non ha comunicato la sessione iniziale (letta da
// localStorage): serve a non mandare al login un utente già autenticato
// durante il primo istante di caricamento.
export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated'

// I metodi restituiscono una chiave d'errore tradotta dai componenti (come per
// la validazione dei form), mai il messaggio grezzo di Supabase.
export type AuthResult = { error: AuthErrorKey | null }
export type SignUpResult = AuthResult & { needsConfirmation: boolean }

export type AuthContextValue = {
  status: AuthStatus
  session: Session | null
  user: User | null
  signIn: (email: string, password: string) => Promise<AuthResult>
  signUp: (email: string, password: string) => Promise<SignUpResult>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
