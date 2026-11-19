import { describe, expect, it } from 'vitest'
import { createTrip, fetchTrip, fetchTrips } from '@/features/trips/api'
import {
  callsTo,
  fakeDbError,
  fakeTripRow,
  mockQueryResult,
  queryCalls,
} from '@/test/supabaseMock'

// Test delle funzioni di accesso ai dati, con il client Supabase finto:
// verifichiamo quali query costruiscono e come trasformano le righe.

describe('fetchTrips', () => {
  it('legge la tabella trips ordinata per data di inizio e mappa le righe', async () => {
    mockQueryResult({
      data: [fakeTripRow({ id: 'a', destination: 'Kyoto' })],
      error: null,
    })

    const trips = await fetchTrips()

    expect(queryCalls[0]).toMatchObject({ table: 'trips', method: 'select' })
    expect(callsTo('order')[0].args).toEqual([
      'start_date',
      { ascending: true },
    ])
    // snake_case del database → camelCase del dominio; nessun user_id/created_at.
    expect(trips).toEqual([
      {
        id: 'a',
        destination: 'Kyoto',
        startDate: '2026-05-10',
        endDate: '2026-05-15',
        budget: 900,
        interests: ['cultura', 'cibo'],
      },
    ])
  })

  it('scarta interessi sconosciuti invece di propagarli nell’interfaccia', async () => {
    mockQueryResult({
      data: [fakeTripRow({ interests: ['cultura', 'skydiving'] })],
      error: null,
    })

    const [trip] = await fetchTrips()

    expect(trip.interests).toEqual(['cultura'])
  })

  it('lancia l’errore del database (TanStack Query lo trasforma in isError)', async () => {
    mockQueryResult({ data: null, error: fakeDbError('boom') })

    await expect(fetchTrips()).rejects.toThrow('boom')
  })
})

describe('fetchTrip', () => {
  it('filtra per id e restituisce null se non c’è (o è di un altro utente)', async () => {
    mockQueryResult({ data: null, error: null })

    const trip = await fetchTrip('3f0c6a4e-8a52-4d7e-9a43-0c2a1f7e5b11')

    expect(trip).toBeNull()
    expect(callsTo('eq')[0].args).toEqual([
      'id',
      '3f0c6a4e-8a52-4d7e-9a43-0c2a1f7e5b11',
    ])
    expect(callsTo('maybeSingle')).toHaveLength(1)
  })
})

describe('createTrip', () => {
  it('inserisce i dati in snake_case senza id né user_id e restituisce il viaggio creato', async () => {
    mockQueryResult({
      data: fakeTripRow({ id: 'new-id', destination: 'Roma' }),
      error: null,
    })

    const trip = await createTrip({
      destination: 'Roma',
      startDate: '2026-05-10',
      endDate: '2026-05-15',
      budget: 900,
      interests: ['cultura', 'cibo'],
    })

    // id e user_id li assegna il database (default + RLS).
    expect(callsTo('insert')[0].args).toEqual([
      {
        destination: 'Roma',
        start_date: '2026-05-10',
        end_date: '2026-05-15',
        budget: 900,
        interests: ['cultura', 'cibo'],
      },
    ])
    expect(callsTo('single')).toHaveLength(1)
    expect(trip.id).toBe('new-id')
  })
})
