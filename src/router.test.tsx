import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { renderApp } from '@/test/renderApp'
import { fakeSession, setInitialSession } from '@/test/supabaseMock'

const tCommon = i18n.getFixedT('en', 'common')
const tTrips = i18n.getFixedT('en', 'trips')

describe('router (pagine in lazy)', () => {
  // Le pagine dei viaggi sono protette: in questi test l'utente è già loggato.
  beforeEach(() => {
    setInitialSession(fakeSession())
  })

  it('mostra il fallback e poi la pagina caricata in lazy', async () => {
    renderApp('/trips/new')

    // Al primo render il chunk della pagina non è ancora arrivato: Suspense
    // mostra il fallback, e il layout (header) è già visibile.
    expect(screen.getByRole('status')).toHaveTextContent(tCommon('loading'))
    expect(
      screen.getByRole('navigation', { name: tCommon('nav.label') }),
    ).toBeInTheDocument()

    // `findBy*` aspetta (con retry) che l'elemento compaia: qui, che
    // l'import dinamico si risolva e la pagina venga renderizzata.
    expect(
      await screen.findByRole('heading', { name: tTrips('newTrip.title') }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('carica la lista viaggi sulla home', async () => {
    renderApp('/')

    expect(
      await screen.findByRole('heading', { name: tTrips('list.title') }),
    ).toBeInTheDocument()
  })

  it('mostra la 404 per un percorso inesistente', async () => {
    renderApp('/percorso-inesistente')

    expect(
      await screen.findByRole('heading', { name: tCommon('notFound.title') }),
    ).toBeInTheDocument()
  })
})
