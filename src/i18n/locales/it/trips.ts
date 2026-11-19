import type { trips as enTrips } from '@/i18n/locales/en/trips'
import type { TranslationShape } from '@/i18n/types'

export const trips = {
  list: {
    title: 'I miei viaggi',
    newTrip: 'Nuovo viaggio',
    empty: 'Nessun viaggio ancora. Aggiungine uno per iniziare!',
    budget: 'Budget: {{amount}}',
    loadError: 'Impossibile caricare i tuoi viaggi.',
  },
  newTrip: {
    title: 'Nuovo viaggio',
    saveError: 'Impossibile salvare il viaggio. Riprova.',
  },
  detail: {
    loadError: 'Impossibile caricare questo viaggio.',
    notFoundTitle: 'Viaggio non trovato',
    notFoundDescription: 'Il viaggio che cerchi non esiste o è stato rimosso.',
    back: 'Torna ai viaggi',
    budget: 'Budget: {{amount}}',
    interests: 'Interessi',
    noInterests: 'Nessun interesse indicato.',
  },
  form: {
    title: 'Dettagli del viaggio',
    destination: 'Destinazione',
    startDate: 'Data di inizio',
    endDate: 'Data di fine',
    budget: 'Budget (€)',
    interests: 'Interessi',
    submit: 'Aggiungi viaggio',
    submitting: 'Salvataggio…',
    errors: {
      destinationRequired: 'La destinazione è obbligatoria.',
      startDateRequired: 'La data di inizio è obbligatoria.',
      endDateRequired: 'La data di fine è obbligatoria.',
      endDateBeforeStart:
        'La data di fine non può essere prima di quella di inizio.',
      budgetPositive: 'Il budget deve essere maggiore di 0.',
    },
  },
  interests: {
    cultura: 'Cultura',
    cibo: 'Cibo',
    natura: 'Natura',
    relax: 'Relax',
    nightlife: 'Vita notturna',
  },
} satisfies TranslationShape<typeof enTrips>
