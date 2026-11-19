import { render, screen } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { QueryClient } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/useAuth'
import { createTestQueryClient } from '@/test/renderApp'
import {
  emitAuthChange,
  fakeAuthError,
  fakeSession,
  setInitialSession,
  supabaseMock,
  unsubscribe,
} from '@/test/supabaseMock'

// Componente di prova che espone lo stato del context nel DOM: testiamo il
// provider attraverso ciò che i consumer vedono (≈ un host component di test
// in Angular che inietta il service).
function AuthProbe() {
  const { status, user } = useAuth()
  return (
    <p>
      {status}:{user?.email ?? 'none'}
    </p>
  )
}

// AuthProvider usa la cache di TanStack Query (la svuota al logout), quindi
// va renderizzato dentro un QueryClientProvider, come in main.tsx.
function renderWithProviders(
  children: ReactNode,
  queryClient: QueryClient = createTestQueryClient(),
) {
  const result = render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>,
  )
  return { ...result, queryClient }
}

function renderProvider(queryClient?: QueryClient) {
  return renderWithProviders(<AuthProbe />, queryClient)
}

describe('AuthProvider', () => {
  it("resta in 'loading' finché Supabase non comunica la sessione iniziale", () => {
    setInitialSession(undefined)
    renderProvider()

    expect(screen.getByText('loading:none')).toBeInTheDocument()

    emitAuthChange('INITIAL_SESSION', null)
    expect(screen.getByText('unauthenticated:none')).toBeInTheDocument()
  })

  it('con una sessione salvata parte autenticato', () => {
    setInitialSession(fakeSession('anna@example.com'))
    renderProvider()

    expect(
      screen.getByText('authenticated:anna@example.com'),
    ).toBeInTheDocument()
  })

  it('segue SIGNED_IN e SIGNED_OUT emessi da Supabase', () => {
    renderProvider()
    expect(screen.getByText('unauthenticated:none')).toBeInTheDocument()

    emitAuthChange('SIGNED_IN', fakeSession('anna@example.com'))
    expect(
      screen.getByText('authenticated:anna@example.com'),
    ).toBeInTheDocument()

    emitAuthChange('SIGNED_OUT', null)
    expect(screen.getByText('unauthenticated:none')).toBeInTheDocument()
  })

  it('al logout svuota la cache delle query', () => {
    setInitialSession(fakeSession())
    const { queryClient } = renderProvider()
    queryClient.setQueryData(['trips', 'list'], [{ id: 'trip-1' }])

    emitAuthChange('SIGNED_OUT', null)

    // I dati dell'utente uscito non restano disponibili per il prossimo.
    expect(queryClient.getQueryData(['trips', 'list'])).toBeUndefined()
  })

  it('chiude la sottoscrizione quando viene smontato', () => {
    const { unmount } = renderProvider()
    expect(supabaseMock.auth.onAuthStateChange).toHaveBeenCalledOnce()

    unmount()

    expect(unsubscribe).toHaveBeenCalledOnce()
  })

  it('traduce gli errori di Supabase in chiavi i18n tramite il codice', async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: fakeAuthError('invalid_credentials'),
    })
    let result: Awaited<
      ReturnType<ReturnType<typeof useAuth>['signIn']>
    > | null = null
    function SignInProbe() {
      const { signIn } = useAuth()
      return (
        <button
          onClick={async () => {
            result = await signIn('a@b.co', 'secret')
          }}
        >
          go
        </button>
      )
    }
    renderWithProviders(<SignInProbe />)

    screen.getByRole('button').click()

    await expect.poll(() => result).toEqual({ error: 'invalidCredentials' })
  })
})
