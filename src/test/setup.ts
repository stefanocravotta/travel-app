// Eseguito da Vitest prima di ogni file di test (vedi `test.setupFiles` in
// vite.config.ts): ≈ il `test.ts` / `setupFilesAfterEach` di un progetto Angular.

// Aggiunge a `expect` i matcher per il DOM: `toBeInTheDocument`,
// `toHaveValue`, `toBeChecked`, `toHaveAttribute`, …
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'
// Stessa configurazione i18n dell'app (traduzioni, namespace, chiavi tipizzate).
import i18n from '@/i18n'
import { resetSupabaseMock } from '@/test/supabaseMock'

// In tutti i test il client Supabase è sostituito dal mock: nessuna chiamata
// di rete e nessun bisogno di variabili d'ambiente. `vi.mock` in un setup
// file vale per ogni file di test.
vi.mock('@/lib/supabase', async () => {
  const { supabaseMock } = await import('@/test/supabaseMock')
  return { supabase: supabaseMock }
})

// Ogni test parte in inglese, indipendentemente dalla lingua di jsdom o da
// un `changeLanguage` fatto in un test precedente, e con il mock di Supabase
// ripulito (sessione iniziale: nessun utente).
beforeEach(async () => {
  resetSupabaseMock()
  await i18n.changeLanguage('en')
})

// jsdom non implementa `ResizeObserver`, che i componenti Radix (es. Checkbox)
// usano per misurare gli elementi. Nei test il layout non esiste, quindi basta
// uno stub che non fa nulla.
if (!('ResizeObserver' in globalThis)) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom non implementa neanche `matchMedia`, usato da ThemeProvider per
// `prefers-color-scheme`. Lo stub risponde sempre "nessuna corrispondenza"
// (tema chiaro) e accetta i listener senza mai chiamarli.
// (In jsdom la proprietà esiste ma non è una funzione: serve `typeof`.)
if (typeof window.matchMedia !== 'function') {
  window.matchMedia = (query: string): MediaQueryList => ({
    matches: false,
    media: query,
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    addListener: () => {},
    removeListener: () => {},
    dispatchEvent: () => false,
  })
}

// Smonta i componenti renderizzati dopo ogni test, così ogni test parte da un
// DOM vuoto. Testing Library lo fa da sola solo con `globals: true`; noi
// importiamo esplicitamente le API di Vitest, quindi lo registriamo qui.
afterEach(() => {
  cleanup()
})
