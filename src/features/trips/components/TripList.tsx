import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { formatBudget, formatDateRange } from '@/features/trips/format'
// `import type` importa solo il tipo, che sparisce dal JS compilato.
// È obbligatorio qui perché il tsconfig ha `verbatimModuleSyntax: true`.
import type { Trip } from '@/types/trip'

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
  // `useTranslation('trips')` dà la funzione `t` per il namespace "trips"
  // (≈ la pipe `translate`) e l'istanza `i18n` (lingua attiva). Il componente
  // si ri-renderizza da solo quando cambia la lingua.
  const { t, i18n } = useTranslation('trips')
  const locale = i18n.resolvedLanguage ?? 'en'

  // Rendering condizionale con un "early return": è un normale `if` di JS.
  // Equivale al ramo `@else` di un `@if (trips.length > 0) { … } @else { … }`
  // (o a `*ngIf="…; else empty"`).
  if (trips.length === 0) {
    return (
      <p className="rounded-xl border border-dashed p-6 text-center text-muted-foreground">
        {t('list.empty')}
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
        La `key` va sull'elemento più esterno restituito dal `map` (qui `<li>`).
      */}
      {trips.map((trip) => (
        <li key={trip.id}>
          {/*
            `Card` e i suoi sotto-componenti sono "componenti composti": pezzi
            separati che si combinano come blocchi HTML (≈ `mat-card` con
            `mat-card-header`, `mat-card-content` in Angular Material).
          */}
          <Card className="h-full">
            <CardHeader>
              <CardTitle className="text-lg">
                {/*
                  `Link` naviga lato client senza ricaricare la pagina: è
                  l'equivalente di `routerLink`. Il template literal costruisce
                  l'URL, come `[routerLink]="['/trips', trip.id]"`.
                */}
                <Link
                  to={`/trips/${trip.id}`}
                  className="underline-offset-4 hover:underline"
                >
                  {trip.destination}
                </Link>
              </CardTitle>
              <CardDescription>
                {formatDateRange(trip.startDate, trip.endDate, locale)}
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3">
              {/* Interpolazione: `{{amount}}` nella traduzione ← parametro tipizzato. */}
              <p className="font-medium">
                {t('list.budget', {
                  amount: formatBudget(trip.budget, locale),
                })}
              </p>

              {/* Un `map` annidato: anche qui serve una `key`, l'interesse stesso è unico. */}
              {trip.interests.length > 0 && (
                <ul className="flex flex-wrap gap-2">
                  {trip.interests.map((interest) => (
                    <li
                      key={interest}
                      className="rounded-full bg-secondary px-3 py-1 text-xs text-secondary-foreground"
                    >
                      {/* Chiave costruita da un valore tipizzato: TypeScript
                          verifica che `interests.<valore>` esista. */}
                      {t(`interests.${interest}`)}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  )
}
