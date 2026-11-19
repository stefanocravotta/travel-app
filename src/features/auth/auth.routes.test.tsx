import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { renderApp } from '@/test/renderApp'
import {
  emitAuthChange,
  fakeAuthError,
  fakeSession,
  setInitialSession,
  supabaseMock,
} from '@/test/supabaseMock'

// Test di integrazione del flusso di autenticazione: app intera (route reali,
// provider reali), con solo Supabase finto.
const t = i18n.getFixedT('en', 'auth')
const tCommon = i18n.getFixedT('en', 'common')
const tTrips = i18n.getFixedT('en', 'trips')

async function findLoginForm() {
  await screen.findByRole('heading', { name: t('login.title') })
  return {
    email: screen.getByLabelText(t('fields.email')),
    password: screen.getByLabelText(t('fields.password')),
    submit: screen.getByRole('button', { name: t('login.submit') }),
  }
}

describe('rotte protette', () => {
  it('senza login porta a /login e, dopo l’accesso, torna alla pagina richiesta', async () => {
    const user = userEvent.setup()
    const { router } = renderApp('/trips/new')

    // RequireAuth ha reindirizzato al login (≈ la guard restituisce un UrlTree).
    const form = await findLoginForm()
    expect(router.state.location.pathname).toBe('/login')

    await user.type(form.email, 'mario@example.com')
    await user.type(form.password, 'password123')
    await user.click(form.submit)

    expect(supabaseMock.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'mario@example.com',
      password: 'password123',
    })

    // Supabase conferma l'accesso con l'evento SIGNED_IN.
    emitAuthChange('SIGNED_IN', fakeSession('mario@example.com'))

    expect(
      await screen.findByRole('heading', { name: tTrips('newTrip.title') }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/trips/new')
  })

  it('da autenticato mostra direttamente la pagina protetta', async () => {
    setInitialSession(fakeSession())
    const { router } = renderApp('/')

    expect(
      await screen.findByRole('heading', { name: tTrips('list.title') }),
    ).toBeInTheDocument()
    expect(router.state.location.pathname).toBe('/')
  })

  it('aprendo /login da autenticato si va alla home', async () => {
    setInitialSession(fakeSession())
    const { router } = renderApp('/login')

    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
  })
})

describe('login', () => {
  it('mostra l’errore tradotto se le credenziali sono sbagliate', async () => {
    supabaseMock.auth.signInWithPassword.mockResolvedValue({
      data: { user: null, session: null },
      error: fakeAuthError('invalid_credentials'),
    })
    const user = userEvent.setup()
    renderApp('/login')
    const form = await findLoginForm()

    await user.type(form.email, 'mario@example.com')
    await user.type(form.password, 'sbagliata')
    await user.click(form.submit)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('errors.invalidCredentials'),
    )
  })

  it('valida email e password senza chiamare Supabase', async () => {
    const user = userEvent.setup()
    renderApp('/login')
    const form = await findLoginForm()

    await user.type(form.email, 'non-una-email')
    await user.click(form.submit)

    expect(screen.getByText(t('validation.emailInvalid'))).toBeInTheDocument()
    expect(
      screen.getByText(t('validation.passwordRequired')),
    ).toBeInTheDocument()
    expect(form.email).toHaveAttribute('aria-invalid', 'true')
    expect(supabaseMock.auth.signInWithPassword).not.toHaveBeenCalled()
  })
})

describe('registrazione', () => {
  async function findRegisterForm() {
    await screen.findByRole('heading', { name: t('register.title') })
    return {
      email: screen.getByLabelText(t('fields.email')),
      password: screen.getByLabelText(t('fields.password')),
      confirm: screen.getByLabelText(t('fields.confirmPassword')),
      submit: screen.getByRole('button', { name: t('register.submit') }),
    }
  }

  it('chiede di confermare l’email quando Supabase non crea la sessione', async () => {
    const user = userEvent.setup()
    renderApp('/register')
    const form = await findRegisterForm()

    await user.type(form.email, 'nuovo@example.com')
    await user.type(form.password, 'password123')
    await user.type(form.confirm, 'password123')
    await user.click(form.submit)

    expect(supabaseMock.auth.signUp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'nuovo@example.com',
        password: 'password123',
      }),
    )
    expect(
      await screen.findByRole('heading', {
        name: t('register.confirmEmailTitle'),
      }),
    ).toBeInTheDocument()
    expect(screen.getByText(/nuovo@example\.com/)).toBeInTheDocument()
  })

  it('valida lunghezza e conferma della password', async () => {
    const user = userEvent.setup()
    renderApp('/register')
    const form = await findRegisterForm()

    await user.type(form.email, 'nuovo@example.com')
    await user.type(form.password, '123')
    await user.type(form.confirm, '456')
    await user.click(form.submit)

    expect(
      screen.getByText(t('validation.passwordTooShort', { min: 6 })),
    ).toBeInTheDocument()
    expect(
      screen.getByText(t('validation.passwordsDontMatch')),
    ).toBeInTheDocument()
    expect(supabaseMock.auth.signUp).not.toHaveBeenCalled()
  })

  it('segnala un utente già registrato', async () => {
    supabaseMock.auth.signUp.mockResolvedValue({
      data: { user: null, session: null },
      error: fakeAuthError('user_already_exists', 422),
    })
    const user = userEvent.setup()
    renderApp('/register')
    const form = await findRegisterForm()

    await user.type(form.email, 'esiste@example.com')
    await user.type(form.password, 'password123')
    await user.type(form.confirm, 'password123')
    await user.click(form.submit)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('errors.userAlreadyExists'),
    )
  })
})

describe('logout', () => {
  it('il bottone nell’header chiude la sessione locale e riporta al login', async () => {
    setInitialSession(fakeSession())
    const user = userEvent.setup()
    const { router } = renderApp('/')
    await screen.findByRole('heading', { name: tTrips('list.title') })

    await user.click(
      screen.getByRole('button', { name: tCommon('nav.logout') }),
    )

    expect(supabaseMock.auth.signOut).toHaveBeenCalledWith({ scope: 'local' })

    emitAuthChange('SIGNED_OUT', null)

    await findLoginForm()
    expect(router.state.location.pathname).toBe('/login')
    // Da non autenticato la navigazione privata sparisce dall'header.
    expect(
      screen.queryByRole('navigation', { name: tCommon('nav.label') }),
    ).toBeNull()
  })
})
