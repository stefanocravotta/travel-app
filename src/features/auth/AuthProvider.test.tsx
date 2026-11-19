import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { useAuth } from '@/features/auth/useAuth'
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

function renderProvider() {
  return render(
    <AuthProvider>
      <AuthProbe />
    </AuthProvider>,
  )
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
    render(
      <AuthProvider>
        <SignInProbe />
      </AuthProvider>,
    )

    screen.getByRole('button').click()

    await expect.poll(() => result).toEqual({ error: 'invalidCredentials' })
  })
})
