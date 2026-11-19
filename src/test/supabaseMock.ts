import { act } from '@testing-library/react'
import { AuthError } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { vi } from 'vitest'

// Supabase finto per i test: nessuna chiamata di rete, nessuna variabile
// d'ambiente. `src/test/setup.ts` sostituisce `@/lib/supabase` con questo
// oggetto in tutti i test (≈ in Angular `{ provide: SupabaseService, useValue: mock }`
// nei `providers` del TestBed).

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void

let listener: AuthListener | null = null
// Sessione emessa come INITIAL_SESSION all'iscrizione. `undefined` = non
// emettere nulla (per testare lo stato 'loading').
let initialSession: Session | null | undefined = null

export const unsubscribe = vi.fn()

export const supabaseMock = {
  auth: {
    // Come il vero client: registra il listener ed emette subito la sessione
    // iniziale; restituisce la sottoscrizione per il cleanup.
    onAuthStateChange: vi.fn((callback: AuthListener) => {
      listener = callback
      if (initialSession !== undefined) {
        callback('INITIAL_SESSION', initialSession)
      }
      return { data: { subscription: { unsubscribe } } }
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}

// Ripristina il comportamento di default prima di ogni test (chiamato da setup.ts).
export function resetSupabaseMock() {
  listener = null
  initialSession = null
  unsubscribe.mockReset()
  supabaseMock.auth.onAuthStateChange.mockClear()
  supabaseMock.auth.signInWithPassword
    .mockReset()
    .mockResolvedValue({ data: { user: null, session: null }, error: null })
  supabaseMock.auth.signUp
    .mockReset()
    .mockResolvedValue({ data: { user: null, session: null }, error: null })
  supabaseMock.auth.signOut.mockReset().mockResolvedValue({ error: null })
}

// Da chiamare prima del render: sessione con cui parte l'app.
export function setInitialSession(session: Session | null | undefined) {
  initialSession = session
}

// Simula un evento di Supabase (SIGNED_IN, SIGNED_OUT…). `act` fa applicare
// a React gli aggiornamenti di stato prima delle verifiche.
export function emitAuthChange(
  event: AuthChangeEvent,
  session: Session | null,
) {
  act(() => {
    listener?.(event, session)
  })
}

export function fakeSession(email = 'mario@example.com'): Session {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      email,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-01-01T00:00:00Z',
    },
  }
}

// Errore come quelli restituiti da Supabase: conta il `code`.
export function fakeAuthError(code: string, status = 400): AuthError {
  return new AuthError(`Supabase error: ${code}`, status, code)
}
