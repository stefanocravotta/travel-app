import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { AuthContext } from '@/features/auth/AuthContext'
import type { AuthStatus } from '@/features/auth/AuthContext'
import { toAuthErrorKey } from '@/features/auth/authErrors'
import { supabase } from '@/lib/supabase'

type AuthProviderProps = {
  children: ReactNode
}

// Stato di autenticazione condiviso da tutta l'app.
// ≈ in Angular un `AuthService` `providedIn: 'root'` con un `BehaviorSubject`
// (o un `signal`) della sessione, alimentato da Supabase.
export function AuthProvider({ children }: AuthProviderProps) {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<AuthStatus>('loading')

  useEffect(() => {
    // `onAuthStateChange` è l'unica fonte di verità della sessione: emette
    // subito `INITIAL_SESSION` (la sessione salvata, o null) e poi
    // SIGNED_IN / SIGNED_OUT / TOKEN_REFRESHED… a ogni cambiamento, anche da
    // altre schede. Non serve quindi chiamare `getSession()` all'avvio.
    // Il callback è sincrono e aggiorna solo lo stato React.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setStatus(newSession ? 'authenticated' : 'unauthenticated')
    })

    // Cleanup: chiude la sottoscrizione quando il provider viene smontato
    // (≈ `takeUntilDestroyed()` / `unsubscribe()` in `ngOnDestroy`).
    return () => data.subscription.unsubscribe()
  }, [])

  // I metodi non aggiornano lo stato direttamente: in caso di successo
  // Supabase emette l'evento e il listener qui sopra fa il resto.
  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { error: error ? toAuthErrorKey(error) : null }
  }, [])

  const signUp = useCallback(async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Dove porta il link di conferma email: deve essere tra i Redirect URL
      // configurati in Supabase (Auth → URL Configuration).
      options: { emailRedirectTo: window.location.origin },
    })
    if (error) {
      return { error: toAuthErrorKey(error), needsConfirmation: false }
    }
    // Con la conferma email attiva il signup non crea subito una sessione.
    return { error: null, needsConfirmation: data.session === null }
  }, [])

  const signOut = useCallback(async () => {
    // `scope: 'local'` chiude solo la sessione di questo browser; il default
    // ('global') scollegherebbe l'utente da tutti i dispositivi.
    await supabase.auth.signOut({ scope: 'local' })
  }, [])

  const value = useMemo(
    () => ({
      status,
      session,
      user: session?.user ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [status, session, signIn, signUp, signOut],
  )

  return <AuthContext value={value}>{children}</AuthContext>
}
