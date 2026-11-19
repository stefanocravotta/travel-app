import { createContext } from 'react'
import type { Trip } from '@/types/trip'

// Il Context è il meccanismo di React per condividere un valore con tutto
// l'albero di componenti sotto un Provider, senza passarlo come prop a ogni
// livello ("prop drilling").
// L'equivalente Angular è un service fornito in un injector (es. nei
// `providers` di un componente, o `providedIn: 'root'`), con una differenza:
// non c'è dependency injection per tipo. Il valore è quello che il Provider
// più vicino passa in `value` (vedi TripsProvider.tsx).

export type TripsContextValue = {
  trips: Trip[]
  addTrip: (trip: Trip) => void
}

// Il default `null` indica "nessun Provider sopra di me": `useTrips` lo
// trasforma in un errore esplicito invece di un valore finto silenzioso.
export const TripsContext = createContext<TripsContextValue | null>(null)
