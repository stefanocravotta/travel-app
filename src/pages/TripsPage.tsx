import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { PageLoader } from '@/components/PageLoader'
import { QueryError } from '@/components/QueryError'
import { Button } from '@/components/ui/button'
import { TripList } from '@/features/trips/components/TripList'
import { useTripsQuery } from '@/features/trips/queries'

// Pagina = componente associato a una route (come un componente in
// `Routes` di Angular). Prende i dati dal server con un query hook e li passa
// al componente presentazionale TripList.
export function TripsPage() {
  const { t } = useTranslation('trips')
  // Tre stati da gestire esplicitamente (≈ `@if (trips$ | async; as trips)`
  // più i rami di caricamento ed errore che in Angular scriveresti a mano).
  const { data: trips, isPending, isError, refetch } = useTripsQuery()

  return (
    <>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-heading text-3xl font-bold">{t('list.title')}</h1>
        {/*
          `asChild`: Button passa le sue classi al `Link` figlio invece di
          rendere un `<button>`. Così otteniamo un link (≈ `routerLink`) con
          l'aspetto di un bottone.
        */}
        <Button asChild>
          <Link to="/trips/new">
            <Plus />
            {t('list.newTrip')}
          </Link>
        </Button>
      </div>

      {isPending ? (
        // Primo caricamento: nessun dato in cache.
        <PageLoader />
      ) : isError ? (
        <QueryError
          message={t('list.loadError')}
          onRetry={() => void refetch()}
        />
      ) : (
        <TripList trips={trips} />
      )}
    </>
  )
}
