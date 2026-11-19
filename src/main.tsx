import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { createRoot } from 'react-dom/client'
// In v8 `RouterProvider` si importa da 'react-router/dom': questa versione è
// collegata a react-dom (usa `flushSync` per gli aggiornamenti del router).
import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
// Inizializza i18next (lingua rilevata + traduzioni) prima del primo render.
import '@/i18n'
import '@/index.css'
import { queryClient } from '@/lib/queryClient'
import { router } from '@/router'

// Punto di avvio, ≈ `bootstrapApplication(AppComponent, { providers: [provideRouter(routes)] })`.
// I provider avvolgono il router, così tutte le pagine condividono lo stesso
// tema, la stessa cache dei dati del server e la stessa sessione (≈ service
// `providedIn: 'root'`).
// - QueryClientProvider: rende disponibile la cache di TanStack Query a
//   useQuery/useMutation (≈ `provideHttpClient()` + un service di cache).
//   Sta sopra AuthProvider, che svuota la cache al logout.
// - AuthProvider sta sopra il router perché RequireAuth (una route) e
//   l'header leggono la sessione.
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
)
