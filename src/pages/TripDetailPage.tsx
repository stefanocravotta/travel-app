import { ArrowLeft } from 'lucide-react'
import { Link, useParams } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatBudget, formatDateRange } from '@/features/trips/format'
import { useTrips } from '@/features/trips/useTrips'

// `asChild` (pattern "Slot" di Radix): Button non rende il suo `<button>` ma
// passa stile e props al figlio, qui un `Link`. Risultato: un `<a>` con
// l'aspetto di un bottone. Evita `<button>` dentro `<a>` (HTML non valido).
// È un elemento JSX costante, non un componente: un valore riutilizzabile due volte.
const backLink = (
  <Button variant="ghost" size="sm" asChild>
    <Link to="/">
      <ArrowLeft />
      Torna ai viaggi
    </Link>
  </Button>
)

export function TripDetailPage() {
  // `useParams` legge i parametri dinamici dell'URL (`:id` nella route).
  // ≈ `inject(ActivatedRoute).snapshot.paramMap.get('id')`, o un `input()`
  // con `withComponentInputBinding()`. Qui non serve un Observable: quando
  // l'URL cambia, il componente si ri-renderizza e `useParams` dà il nuovo valore.
  const { id } = useParams()
  const { trips } = useTrips()

  // Dato derivato: si calcola durante il render, non serve uno stato a parte
  // (≈ un `computed()` in Angular).
  const trip = trips.find((t) => t.id === id)

  if (trip === undefined) {
    return (
      <div className="grid justify-items-center gap-2 rounded-xl border border-dashed p-6 text-center">
        <h1 className="font-heading text-2xl font-semibold">
          Viaggio non trovato
        </h1>
        <p className="text-muted-foreground">
          Il viaggio che cerchi non esiste o è stato rimosso.
        </p>
        {backLink}
      </div>
    )
  }

  return (
    <div className="grid justify-items-start gap-4">
      {backLink}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">
            <h1>{trip.destination}</h1>
          </CardTitle>
          <CardDescription>
            {formatDateRange(trip.startDate, trip.endDate)}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <p className="text-lg font-medium">
            Budget: {formatBudget(trip.budget)}
          </p>

          <section className="grid gap-2">
            <h2 className="font-semibold">Interessi</h2>
            {trip.interests.length === 0 ? (
              <p className="text-muted-foreground">
                Nessun interesse indicato.
              </p>
            ) : (
              <ul className="flex flex-wrap gap-2">
                {trip.interests.map((interest) => (
                  <li
                    key={interest}
                    className="rounded-full bg-secondary px-3 py-1 text-sm text-secondary-foreground capitalize"
                  >
                    {interest}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </CardContent>
      </Card>
    </div>
  )
}
