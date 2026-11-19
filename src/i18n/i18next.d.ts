import 'i18next'
import type { auth } from '@/i18n/locales/en/auth'
import type { common } from '@/i18n/locales/en/common'
import type { trips } from '@/i18n/locales/en/trips'

// Tipizza le chiavi di traduzione a partire dalle risorse inglesi:
// `t('nav.trips')` è valido, `t('nav.tripz')` è un errore di compilazione,
// e i valori da interpolare (`{{amount}}`) diventano parametri obbligatori.
declare module 'i18next' {
  interface CustomTypeOptions {
    defaultNS: 'common'
    resources: {
      common: typeof common
      trips: typeof trips
      auth: typeof auth
    }
  }
}
