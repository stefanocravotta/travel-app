import { renderHook, waitFor } from '@testing-library/react'
import { QueryClientProvider } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { describe, expect, it } from 'vitest'
import {
  isTripId,
  tripKeys,
  useCreateTripMutation,
} from '@/features/trips/queries'
import { createTestQueryClient } from '@/test/renderApp'
import { fakeTripRow, mockQueryResult } from '@/test/supabaseMock'

// `renderHook` esegue un hook fuori da un componente vero
// (≈ `TestBed.runInInjectionContext(() => inject(...))` in Angular).

describe('useCreateTripMutation', () => {
  it('dopo la creazione invalida la lista dei viaggi in cache', async () => {
    const queryClient = createTestQueryClient()
    // Lista già in cache, come dopo aver visitato la home.
    queryClient.setQueryData(tripKeys.list(), [])
    mockQueryResult({ data: fakeTripRow(), error: null })
    const wrapper = ({ children }: { children: ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useCreateTripMutation(), { wrapper })
    await result.current.mutateAsync({
      destination: 'Roma',
      startDate: '2026-05-10',
      endDate: '2026-05-12',
      budget: 300,
      interests: [],
    })

    // Invalidata = alla prossima lettura verrà ricaricata dal server.
    await waitFor(() =>
      expect(queryClient.getQueryState(tripKeys.list())?.isInvalidated).toBe(
        true,
      ),
    )
  })
})

describe('isTripId', () => {
  it('accetta solo uuid', () => {
    expect(isTripId('3f0c6a4e-8a52-4d7e-9a43-0c2a1f7e5b11')).toBe(true)
    expect(isTripId('abc')).toBe(false)
    expect(isTripId(undefined)).toBe(false)
  })
})
