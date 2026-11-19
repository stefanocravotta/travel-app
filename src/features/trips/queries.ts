import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createTrip, fetchTrip, fetchTrips } from '@/features/trips/api'

// --- Query key ---
// Ogni dato in cache è identificato da una chiave (un array). Una "factory"
// centralizza le chiavi: niente stringhe sparse nei componenti, e
// l'invalidazione per prefisso (`tripKeys.all`) colpisce lista e dettagli.
export const tripKeys = {
  all: ['trips'] as const,
  list: () => [...tripKeys.all, 'list'] as const,
  detail: (id: string) => [...tripKeys.all, 'detail', id] as const,
}

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Gli id dei viaggi sono uuid: qualsiasi altra stringa non può esistere.
export function isTripId(id: string | undefined): id is string {
  return id !== undefined && UUID_PATTERN.test(id)
}

// --- Query (lettura) ---
// `useQuery` ≈ sottoscriversi a un Observable HTTP con cache condivisa:
// restituisce `data`, `isPending`, `isError`, `error`, `refetch`… e il
// componente si ri-renderizza quando cambiano. Più componenti con la stessa
// chiave condividono un'unica richiesta.
export function useTripsQuery() {
  return useQuery({
    queryKey: tripKeys.list(),
    queryFn: fetchTrips,
  })
}

// Il risultato si restituisce così com'è (niente spread): TanStack Query
// tiene traccia delle proprietà lette per ri-renderizzare solo quando servono.
export function useTripQuery(id: string | undefined) {
  return useQuery({
    queryKey: tripKeys.detail(id ?? ''),
    queryFn: () => fetchTrip(id ?? ''),
    // Un id non valido (es. /trips/abc) non può esistere: niente richiesta,
    // la pagina mostra direttamente "non trovato".
    enabled: isTripId(id),
  })
}

// --- Mutation (scrittura) ---
// `useMutation` ≈ la chiamata POST di un service: `mutate`/`mutateAsync`
// la eseguono e `isPending`/`isError` ne descrivono lo stato.
export function useCreateTripMutation() {
  // Il QueryClient fornito da QueryClientProvider (≈ `inject(QueryClient)`).
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createTrip,
    // Dopo la creazione, i dati in cache sono vecchi: invalidarli fa
    // ricaricare la lista (≈ rifare la GET dopo una POST riuscita).
    onSuccess: () => queryClient.invalidateQueries({ queryKey: tripKeys.all }),
  })
}
