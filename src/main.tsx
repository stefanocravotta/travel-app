import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
// In v8 `RouterProvider` si importa da 'react-router/dom': questa versione è
// collegata a react-dom (usa `flushSync` per gli aggiornamenti del router).
import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TripsProvider } from '@/features/trips/TripsProvider'
// Inizializza i18next (lingua rilevata + traduzioni) prima del primo render.
import '@/i18n'
import '@/index.css'
import { router } from '@/router'

// Punto di avvio, ≈ `bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] })`.
// I provider avvolgono il router, così tutte le pagine condividono lo stesso
// tema e lo stesso stato dei viaggi (≈ service `providedIn: 'root'`).
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <TripsProvider>
        <RouterProvider router={router} />
      </TripsProvider>
    </ThemeProvider>
  </StrictMode>,
)
