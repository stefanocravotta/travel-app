// `import type` importa solo il tipo, che sparisce dal JS compilato.
// È obbligatorio qui perché il tsconfig ha `verbatimModuleSyntax: true`.
import type { Trip } from '../../../types/trip'

// --- Helper di formattazione ---
// Sono funzioni pure fuori dal componente: in React il corpo del componente
// viene rieseguito a ogni render, quindi tutto ciò che non dipende da props o
// stato conviene tenerlo a livello di modulo (come una utility function
// importata in Angular, o la logica di una pure pipe tipo `date`/`currency`).

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  // `new Date('2026-05-10')` viene interpretata come mezzanotte UTC: formattando
  // in UTC evitiamo che in un fuso orario negativo la data slitti di un giorno.
  timeZone: 'UTC',
})

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

function formatDateRange(startDate: string, endDate: string): string {
  return `${dateFormatter.format(new Date(startDate))} – ${dateFormatter.format(new Date(endDate))}`
}

// --- Props ---
// Le props sono gli input del componente: l'equivalente di `@Input()` o di
// `input()` (signal input) in Angular. Le descriviamo con un tipo esplicito.
// Differenza importante: le props sono di sola lettura, il figlio non le
// modifica mai. I dati scendono dal padre al figlio (flusso unidirezionale).
type TripListProps = {
  trips: Trip[]
}

// Un componente React è una semplice funzione che riceve le props e restituisce
// JSX. Prende il posto della classe con `@Component` + template di Angular:
// non c'è decoratore, né selector, né modulo/`imports` da dichiarare; per usarlo
// basta importarlo (`import { TripList } from ...`, export con nome) e scrivere
// `<TripList />`.
// Qui destrutturiamo le props direttamente nei parametri: `{ trips }`.
//
// Quando il padre passa un nuovo array `trips`, React richiama questa funzione
// e aggiorna il DOM con le differenze: è il suo modo di fare quello che in
// Angular fa la change detection.
export function TripList({ trips }: TripListProps) {
  // Rendering condizionale con un "early return": è un normale `if` di JS.
  // Equivale al ramo `@else` di un `@if (trips.length > 0) { … } @else { … }`
  // (o a `*ngIf="…; else empty"`).
  if (trips.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 p-6 text-center text-gray-500">
        Nessun viaggio ancora. Aggiungine uno per iniziare!
      </p>
    )
  }

  // JSX: sembra HTML ma è JavaScript (viene compilato in chiamate a funzione).
  // Per questo si scrive `className` invece di `class` (`class` è una parola
  // riservata di JS) e le espressioni si inseriscono con `{ }`, come
  // l'interpolazione `{{ }}` dei template Angular.
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {/*
        Le liste si rendono con `Array.map`: equivale a `@for (trip of trips; track trip.id)`
        o a `*ngFor`. La prop `key` ha lo stesso ruolo di `track`/`trackBy`:
        permette a React di riconoscere ogni elemento tra un render e l'altro.
        Deve essere stabile e unica, quindi usiamo l'id e non l'indice.
      */}
      {trips.map((trip) => (
        <li
          key={trip.id}
          className="rounded-lg border border-gray-200 p-4 shadow-sm"
        >
          <h2 className="text-xl font-semibold">{trip.destination}</h2>
          <p className="text-sm text-gray-600">
            {formatDateRange(trip.startDate, trip.endDate)}
          </p>
          <p className="mt-2 font-medium">
            Budget: {currencyFormatter.format(trip.budget)}
          </p>

          {/* Un `map` annidato: anche qui serve una `key`, l'interesse stesso è unico. */}
          <ul className="mt-3 flex flex-wrap gap-2">
            {trip.interests.map((interest) => (
              <li
                key={interest}
                className="rounded-full bg-blue-100 px-3 py-1 text-xs text-blue-800"
              >
                {interest}
              </li>
            ))}
          </ul>
        </li>
      ))}
    </ul>
  )
}
