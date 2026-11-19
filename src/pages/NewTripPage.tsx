import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import { TripForm } from '@/features/trips/components/TripForm'
import { useCreateTripMutation } from '@/features/trips/queries'
import type { NewTrip } from '@/types/trip'

export function NewTripPage() {
  const { t } = useTranslation('trips')
  const createTrip = useCreateTripMutation()
  // `useNavigate` restituisce una funzione per navigare da codice:
  // ≈ `inject(Router)` e poi `router.navigate(['/'])` in Angular.
  const navigate = useNavigate()

  // `mutateAsync` restituisce una Promise: TripForm la aspetta, e se viene
  // rifiutata non svuota i campi (l'utente non perde i dati inseriti).
  // In caso di successo la mutation invalida la cache e la lista si ricarica.
  async function handleCreate(trip: NewTrip) {
    await createTrip.mutateAsync(trip)
    navigate('/')
  }

  return (
    <>
      <h1 className="mb-6 font-heading text-3xl font-bold">
        {t('newTrip.title')}
      </h1>
      {createTrip.isError && (
        <p
          role="alert"
          className="mb-4 rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
        >
          {t('newTrip.saveError')}
        </p>
      )}
      <TripForm onCreate={handleCreate} />
    </>
  )
}
