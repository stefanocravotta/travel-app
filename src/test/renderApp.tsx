import { render } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { AuthProvider } from '@/features/auth/AuthProvider'
import { TripsProvider } from '@/features/trips/TripsProvider'
import { routes } from '@/router'

// Renderizza l'app intera (stessi provider di main.tsx, route reali) partendo
// da un URL, con un router in memoria invece della history del browser
// (≈ `RouterTestingHarness.create(url)` in Angular).
// Restituisce il router per verificare l'URL corrente: `router.state.location`.
export function renderApp(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ThemeProvider>
      <AuthProvider>
        <TripsProvider>
          <RouterProvider router={router} />
        </TripsProvider>
      </AuthProvider>
    </ThemeProvider>,
  )
  return { router }
}
