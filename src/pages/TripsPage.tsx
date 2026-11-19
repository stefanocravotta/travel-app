import { Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import { TripList } from '@/features/trips/components/TripList'
import { useTrips } from '@/features/trips/useTrips'

// Pagina = componente associato a una route (come un componente in
// `Routes` di Angular). Prende i dati dal context con il custom hook e li
// passa al componente presentazionale TripList.
export function TripsPage() {
  const { t } = useTranslation('trips')
  const { trips } = useTrips()

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
      <TripList trips={trips} />
    </>
  )
}
