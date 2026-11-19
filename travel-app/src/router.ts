import { createBrowserRouter } from 'react-router'
import { Layout } from '@/components/Layout'
import { NewTripPage } from '@/pages/NewTripPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { TripDetailPage } from '@/pages/TripDetailPage'
import { TripsPage } from '@/pages/TripsPage'

// Configurazione delle route in "data mode": un array di oggetti definito
// fuori dai componenti, come l'array `Routes` passato a `provideRouter(routes)`
// in Angular. `Component` è il componente da mostrare (≈ `component:`).
export const router = createBrowserRouter([
  {
    // Route padre senza contenuto proprio: mostra il Layout e, al posto del
    // suo `<Outlet />`, la route figlia che corrisponde all'URL
    // (≈ una route con `children` e un `<router-outlet>` nel suo template).
    path: '/',
    Component: Layout,
    children: [
      // `index: true` = la route figlia mostrata sul path esatto del padre
      // (≈ `{ path: '', component: TripsPage }` in Angular).
      { index: true, Component: TripsPage },
      // `trips/new` e `trips/:id` non vanno in conflitto: React Router
      // classifica le route e i segmenti statici vincono su quelli dinamici,
      // indipendentemente dall'ordine (in Angular invece conta l'ordine).
      { path: 'trips/new', Component: NewTripPage },
      { path: 'trips/:id', Component: TripDetailPage },
      // `*` cattura qualsiasi URL non gestito: ≈ `{ path: '**' }`.
      // Essendo figlia del Layout, la 404 mantiene header e navigazione.
      { path: '*', Component: NotFoundPage },
    ],
  },
])
