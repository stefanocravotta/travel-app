import { QueryClient } from '@tanstack/react-query'

// TanStack Query gestisce lo "stato del server": scarica i dati, li mette in
// cache per chiave, li ricarica quando servono e espone isPending/isError.
// ≈ in Angular un service con `HttpClient` + cache (`shareReplay`) scritto a
// mano, o le nuove `resource()` / `httpResource()` basate sui signal.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Per 30 s i dati in cache sono "freschi": tornando su una pagina non
      // si rifà la richiesta. Dopo, vengono ricaricati in background.
      staleTime: 30_000,
      // Un solo nuovo tentativo automatico in caso di errore di rete.
      retry: 1,
    },
  },
})
