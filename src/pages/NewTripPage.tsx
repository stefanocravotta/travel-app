import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { TripForm } from '@/features/trips/components/TripForm'
import { useTrips } from '@/features/trips/useTrips'
import type { Trip } from '@/types/trip'

export function NewTripPage() {
  const { t } = useTranslation('trips')
  const { addTrip } = useTrips()
  // `useNavigate` restituisce una funzione per navigare da codice:
  // ≈ `inject(Router)` e poi `router.navigate(['/'])` in Angular.
  const navigate = useNavigate()

  function handleCreate(trip: Trip) {
    addTrip(trip)
    navigate('/')
  }

  return (
    <>
      <h1 className="mb-6 font-heading text-3xl font-bold">
        {t('newTrip.title')}
      </h1>
      <TripForm onCreate={handleCreate} />
    </>
  )
}
