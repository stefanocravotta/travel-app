// Eseguito da Vitest prima di ogni file di test (vedi `test.setupFiles` in
// vite.config.ts): ≈ il `test.ts` / `setupFilesAfterEach` di un progetto Angular.

// Aggiunge a `expect` i matcher per il DOM: `toBeInTheDocument`,
// `toHaveValue`, `toBeChecked`, `toHaveAttribute`, …
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
// Stessa configurazione i18n dell'app (traduzioni, namespace, chiavi tipizzate).
import i18n from '@/i18n'

// Ogni test parte in inglese, indipendentemente dalla lingua di jsdom o da
// un `changeLanguage` fatto in un test precedente.
beforeEach(async () => {
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

// Smonta i componenti renderizzati dopo ogni test, così ogni test parte da un
// DOM vuoto. Testing Library lo fa da sola solo con `globals: true`; noi
// importiamo esplicitamente le API di Vitest, quindi lo registriamo qui.
afterEach(() => {
  cleanup()
})
