import { render } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { routes } from '@/router'

// QueryClient nuovo per ogni test: niente cache condivisa tra un test e
// l'altro, e nessun nuovo tentativo automatico (un errore si vede subito).
export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })
}

// Renderizza l'app intera (stessi provider di main.tsx, route reali) partendo
// da un URL, con un router in memoria invece della history del browser
// (≈ `RouterTestingHarness.create(url)` in Angular).
// Restituisce il router per verificare l'URL corrente (`router.state.location`)
// e il QueryClient per ispezionare la cache.
export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  const queryClient = createTestQueryClient()
  render(
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>,
  )
  return { router, queryClient }
}
