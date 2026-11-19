import i18n from 'i18next'
import LanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { common as enCommon } from '@/i18n/locales/en/common'
import { trips as enTrips } from '@/i18n/locales/en/trips'
import { common as itCommon } from '@/i18n/locales/it/common'
import { trips as itTrips } from '@/i18n/locales/it/trips'

// i18next ≈ ngx-translate (o `@angular/localize` a runtime): le traduzioni
// sono oggetti chiave → testo, e si cambia lingua senza ricompilare.
// Questo modulo configura l'istanza una sola volta; va importato in main.tsx
// prima del render (≈ `provideTranslateService()` in `bootstrapApplication`).

export const SUPPORTED_LANGUAGES = ['en', 'it'] as const
export type Language = (typeof SUPPORTED_LANGUAGES)[number]

export const resources = {
  en: { common: enCommon, trips: enTrips },
  it: { common: itCommon, trips: itTrips },
} as const

// Tiene `<html lang>` allineato alla lingua attiva: lo usano screen reader,
// sillabazione e controllo ortografico. Registrato prima di `init` così
// scatta anche per la lingua iniziale.
i18n.on('languageChanged', (lng) => {
  document.documentElement.lang = lng
})

void i18n
  // Rileva la lingua: prima la scelta salvata in localStorage, poi quella
  // del browser (`navigator.language`).
  .use(LanguageDetector)
  // Collega i18next a React: `useTranslation` fa ri-renderizzare i componenti
  // quando cambia la lingua (≈ la pipe `translate` impura di ngx-translate).
  .use(initReactI18next)
  .init({
    resources,
    supportedLngs: SUPPORTED_LANGUAGES,
    fallbackLng: 'en',
    // 'it-IT' → 'it': usiamo solo il codice della lingua, non la regione.
    load: 'languageOnly',
    ns: ['common', 'trips'],
    defaultNS: 'common',
    interpolation: {
      // React fa già l'escape dei valori inseriti nel JSX.
      escapeValue: false,
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'travel-app:lang',
    },
  })

export default i18n
