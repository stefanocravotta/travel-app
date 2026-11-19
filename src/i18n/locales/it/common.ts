import type { common as enCommon } from '@/i18n/locales/en/common'
import type { TranslationShape } from '@/i18n/types'

export const common = {
  appName: 'Travel App',
  loading: 'Caricamento…',
  retry: 'Riprova',
  nav: {
    label: 'Navigazione principale',
    trips: 'Viaggi',
    newTrip: 'Nuovo viaggio',
    logout: 'Esci',
    signedInAs: 'Accesso effettuato come {{email}}',
  },
  theme: {
    toggle: 'Cambia tema chiaro/scuro',
    current: 'Tema: {{theme}}',
    names: {
      light: 'chiaro',
      dark: 'scuro',
      system: 'sistema',
    },
  },
  language: {
    label: 'Lingua',
    names: {
      en: 'English',
      it: 'Italiano',
    },
  },
  notFound: {
    title: 'Pagina non trovata',
    description: "L'indirizzo che hai aperto non esiste.",
    backHome: 'Torna alla home',
  },
} satisfies TranslationShape<typeof enCommon>
