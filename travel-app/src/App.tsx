// `useState` è un hook: una funzione speciale di React (il nome inizia sempre
// con `use`) che dà "memoria" a un componente funzione tra un render e l'altro.
import { useState } from 'react'
import { TripForm } from './features/trips/components/TripForm'
import { TripList } from './features/trips/components/TripList'
import type { Trip } from './types/trip'

// Dati finti, a livello di modulo e non dentro il componente: il corpo di `App`
// viene rieseguito a ogni render, e così l'array non viene ricreato ogni volta.
// Serve solo come valore iniziale dello stato.
const initialTrips: Trip[] = [
  {
    id: '1',
    destination: 'Lisbona',
    startDate: '2026-05-10',
    endDate: '2026-05-15',
    budget: 900,
    interests: ['cultura', 'cibo', 'nightlife'],
  },
  {
    id: '2',
    destination: 'Kyoto',
    startDate: '2026-10-02',
    endDate: '2026-10-12',
    budget: 3200,
    interests: ['cultura', 'natura', 'relax'],
  },
]

function App() {
  // `useState` restituisce una coppia [valore, setter], che destrutturiamo.
  // Equivale a un campo del componente in Angular, o meglio a un `signal()`:
  // `trips` ≈ leggere `trips()`, il setter ≈ `trips.set(...)`.
  //
  // Lo stato è immutabile: non si fa `trips.push(...)`, ma si chiama il setter
  // con un nuovo array. Il setter dice a React di rieseguire `App`, e quindi
  // anche i figli che ricevono `trips`.
  const [trips, setTrips] = useState<Trip[]>(initialTrips)

  // Gestore dell'"evento" emesso da TripForm (≈ il metodo che in Angular
  // collegheresti con `(create)="handleCreate($event)"`).
  // Aggiornamento funzionale: `prev` è sempre lo stato più recente, anche se
  // più aggiornamenti vengono accodati nello stesso render
  // (≈ `trips.update(prev => [...prev, trip])` con i signal).
  function handleCreate(trip: Trip) {
    setTrips((prev) => [...prev, trip])
  }

  return (
    <main className="mx-auto min-h-screen max-w-4xl p-8">
      <h1 className="mb-6 text-3xl font-bold">Travel App</h1>

      {/*
        Pattern "lifting state up": lo stato condiviso (`trips`) sta nel padre
        comune, App. I dati scendono via props e le modifiche risalgono via
        callback:
        - TripForm riceve `onCreate`, una funzione, e la chiama al submit
          (≈ `<app-trip-form (create)="handleCreate($event)" />`);
        - TripList riceve `trips` e si limita a mostrarli
          (≈ `<app-trip-list [trips]="trips" />`).
        I due figli non si conoscono: è la stessa idea di "smart/container" e
        "dumb/presentational" in Angular.
      */}
      <TripForm onCreate={handleCreate} />
      <TripList trips={trips} />
    </main>
  )
}

export default App
