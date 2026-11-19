import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Trip } from '@/types/trip'
import { TripsContext } from './TripsContext'
import { loadTrips, saveTrips } from './tripsStorage'

// `children` è il contenuto scritto tra i tag di apertura e chiusura del
// componente: `<TripsProvider>…</TripsProvider>`. Equivale alla content
// projection di Angular (`<ng-content>`).
type TripsProviderProps = {
  children: ReactNode
}

export function TripsProvider({ children }: TripsProviderProps) {
  // Inizializzazione lazy: passiamo la funzione `loadTrips`, non il suo
  // risultato `loadTrips()`. React la chiama solo al primo render, quindi
  // localStorage si legge una volta e non a ogni render.
  const [trips, setTrips] = useState<Trip[]>(loadTrips)

  // `useEffect` esegue un effetto collaterale dopo il render (qui: scrivere in
  // localStorage). L'array `[trips]` è la lista delle dipendenze: l'effetto
  // si riesegue solo quando `trips` cambia.
  // Equivale a un `effect()` dei signal in Angular, che si riesegue quando
  // cambiano i signal letti (qui le dipendenze le dichiari a mano).
  useEffect(() => {
    saveTrips(trips)
  }, [trips])

  // `useCallback` mantiene la stessa funzione tra un render e l'altro (la ricrea
  // solo se cambiano le dipendenze, qui nessuna). `setTrips` è già stabile e
  // con l'aggiornamento funzionale non serve leggere `trips` qui dentro.
  const addTrip = useCallback((trip: Trip) => {
    setTrips((prev) => [...prev, trip])
  }, [])

  // `useMemo` evita di creare un nuovo oggetto `value` a ogni render del
  // Provider: ogni componente che usa il context si ri-renderizza quando
  // `value` cambia identità, quindi lo ricreiamo solo quando cambiano
  // `trips` o `addTrip`.
  const value = useMemo(() => ({ trips, addTrip }), [trips, addTrip])

  // In React 19 il context stesso fa da Provider: `<TripsContext value={…}>`
  // (prima si scriveva `<TripsContext.Provider value={…}>`).
  return <TripsContext value={value}>{children}</TripsContext>
}
