import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it } from 'vitest'
import i18n from '@/i18n'
import { renderApp } from '@/test/renderApp'
import {
  callsTo,
  fakeDbError,
  fakeSession,
  fakeTripRow,
  mockQueryResult,
  mockQueryResultOnce,
  setInitialSession,
  supabaseMock,
} from '@/test/supabaseMock'

// Pagine dei viaggi con dati dal "server" (Supabase finto) tramite TanStack
// Query: caricamento, errore, dati, creazione con invalidazione della cache.
const t = i18n.getFixedT('en', 'trips')
const tCommon = i18n.getFixedT('en', 'common')

const TRIP_ID = '3f0c6a4e-8a52-4d7e-9a43-0c2a1f7e5b11'

beforeEach(() => {
  setInitialSession(fakeSession())
})

describe('lista viaggi', () => {
  it('mostra il caricamento e poi i viaggi dal database', async () => {
    mockQueryResult({
      data: [fakeTripRow({ destination: 'Kyoto' })],
      error: null,
    })
    renderApp('/')

    expect(await screen.findByRole('link', { name: 'Kyoto' })).toHaveAttribute(
      'href',
      `/trips/${TRIP_ID}`,
    )
  })

  it('mostra lo stato vuoto se non ci sono viaggi', async () => {
    renderApp('/')

    expect(await screen.findByText(t('list.empty'))).toBeInTheDocument()
  })

  it('in caso di errore mostra il messaggio e "Riprova" ricarica', async () => {
    mockQueryResultOnce({ data: null, error: fakeDbError() })
    mockQueryResultOnce({
      data: [fakeTripRow({ destination: 'Oslo' })],
      error: null,
    })
    const user = userEvent.setup()
    renderApp('/')

    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('list.loadError'),
    )

    await user.click(screen.getByRole('button', { name: tCommon('retry') }))

    expect(
      await screen.findByRole('link', { name: 'Oslo' }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('alert')).toBeNull()
  })
})

describe('nuovo viaggio', () => {
  async function fillAndSubmit() {
    const user = userEvent.setup()
    await screen.findByRole('heading', { name: t('newTrip.title') })
    await user.type(screen.getByLabelText(t('form.destination')), 'Roma')
    await user.type(screen.getByLabelText(t('form.startDate')), '2026-05-10')
    await user.type(screen.getByLabelText(t('form.endDate')), '2026-05-12')
    await user.type(screen.getByLabelText(t('form.budget')), '300')
    await user.click(screen.getByRole('button', { name: t('form.submit') }))
  }

  // L'invalidazione della cache è verificata in queries.test.tsx: qui la
  // lista non era in cache, quindi verrebbe caricata comunque.
  it('salva il viaggio e torna alla lista aggiornata', async () => {
    const { router } = renderApp('/trips/new')
    // Risposta all'insert: la riga creata.
    mockQueryResultOnce({
      data: fakeTripRow({ destination: 'Roma' }),
      error: null,
    })
    // Risposta alla lista ricaricata dopo l'invalidazione.
    mockQueryResult({
      data: [fakeTripRow({ destination: 'Roma' })],
      error: null,
    })

    await fillAndSubmit()

    expect(callsTo('insert')[0].args[0]).toMatchObject({
      destination: 'Roma',
      start_date: '2026-05-10',
      end_date: '2026-05-12',
      budget: 300,
    })
    await waitFor(() => expect(router.state.location.pathname).toBe('/'))
    expect(
      await screen.findByRole('link', { name: 'Roma' }),
    ).toBeInTheDocument()
  })

  it('se il salvataggio fallisce mostra l’errore e non perde i dati', async () => {
    const { router } = renderApp('/trips/new')
    mockQueryResultOnce({ data: null, error: fakeDbError() })

    await fillAndSubmit()

    expect(await screen.findByRole('alert')).toHaveTextContent(
      t('newTrip.saveError'),
    )
    expect(router.state.location.pathname).toBe('/trips/new')
    expect(screen.getByLabelText(t('form.destination'))).toHaveValue('Roma')
  })
})

describe('dettaglio viaggio', () => {
  it('mostra il viaggio trovato', async () => {
    mockQueryResult({
      data: fakeTripRow({ destination: 'Lisbona' }),
      error: null,
    })
    renderApp(`/trips/${TRIP_ID}`)

    expect(
      await screen.findByRole('heading', { name: 'Lisbona' }),
    ).toBeInTheDocument()
    expect(callsTo('eq')[0].args).toEqual(['id', TRIP_ID])
  })

  it('mostra "non trovato" se il database non restituisce nulla', async () => {
    mockQueryResult({ data: null, error: null })
    renderApp(`/trips/${TRIP_ID}`)

    expect(
      await screen.findByRole('heading', { name: t('detail.notFoundTitle') }),
    ).toBeInTheDocument()
  })

  it('con un id non valido mostra "non trovato" senza interrogare il database', async () => {
    renderApp('/trips/abc')

    expect(
      await screen.findByRole('heading', { name: t('detail.notFoundTitle') }),
    ).toBeInTheDocument()
    expect(supabaseMock.from).not.toHaveBeenCalled()
  })
})
