import { render, screen } from '@testing-library/react'
import { createMemoryRouter } from 'react-router'
import { RouterProvider } from 'react-router/dom'
import { describe, expect, it } from 'vitest'
import { ThemeProvider } from '@/components/theme/ThemeProvider'
import { TripsProvider } from '@/features/trips/TripsProvider'
import i18n from '@/i18n'
import { routes } from '@/router'

const tCommon = i18n.getFixedT('en', 'common')
const tTrips = i18n.getFixedT('en', 'trips')

// Router in memoria con le stesse route dell'app: niente browser history,
// l'URL iniziale si sceglie con `initialEntries`
// (≈ `RouterTestingHarness.create('/trips/new')` in Angular).
// Gli stessi provider di main.tsx: il Layout usa tema e viaggi.
function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path] })
  render(
    <ThemeProvider>
      <TripsProvider>
        <RouterProvider router={router} />
      </TripsProvider>
    </ThemeProvider>,
  )
}

describe('router (pagine in lazy)', () => {
  it('mostra il fallback e poi la pagina caricata in lazy', async () => {
    renderAt('/trips/new')

    // Al primo render il chunk della pagina non è ancora arrivato: Suspense
    // mostra il fallback, e il layout (header) è già visibile.
    expect(screen.getByRole('status')).toHaveTextContent(tCommon('loading'))
    expect(
      screen.getByRole('navigation', { name: tCommon('nav.label') }),
    ).toBeInTheDocument()

    // `findBy*` aspetta (con retry) che l'elemento compaia: qui, che
    // l'import dinamico si risolva e la pagina venga renderizzata.
    expect(
      await screen.findByRole('heading', { name: tTrips('newTrip.title') }),
    ).toBeInTheDocument()
    expect(screen.queryByRole('status')).toBeNull()
  })

  it('carica la lista viaggi sulla home', async () => {
    renderAt('/')

    expect(
      await screen.findByRole('heading', { name: tTrips('list.title') }),
    ).toBeInTheDocument()
  })

  it('mostra la 404 per un percorso inesistente', async () => {
    renderAt('/percorso-inesistente')

    expect(
      await screen.findByRole('heading', { name: tCommon('notFound.title') }),
    ).toBeInTheDocument()
  })
})
