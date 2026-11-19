import { lazy } from 'react'
import { createBrowserRouter } from 'react-router'
import type { RouteObject } from 'react-router'
import { Layout } from '@/components/Layout'

// --- Pagine caricate in lazy (code splitting) ---
// `import()` dinamico: Vite mette ogni pagina (e il codice usato solo da lei)
// in un chunk JS separato, scaricato solo quando si visita la route.
// `React.lazy` trasforma quella Promise in un componente: al primo render
// "sospende" finché il chunk non è arrivato, e il `<Suspense>` più vicino
// (nel Layout) mostra il fallback.
//
// Equivalente Angular:
//   { path: 'trips/new', loadComponent: () => import('./pages/new-trip').then(m => m.NewTripPage) }
// e `loadChildren` per caricare in lazy un intero gruppo di route.
// Qui il `.then(...)` serve perché `React.lazy` vuole un *default export*,
// mentre le nostre pagine usano export con nome: lo adattiamo a `{ default }`.
//
// Alternativa nella data mode di React Router: la proprietà `lazy` della route
// (`lazy: { Component: async () => (await import(...)).X }`), che può caricare
// in lazy anche loader e action e avvia il download prima del render.
const TripsPage = lazy(() =>
  import('@/pages/TripsPage').then((m) => ({ default: m.TripsPage })),
)
const NewTripPage = lazy(() =>
  import('@/pages/NewTripPage').then((m) => ({ default: m.NewTripPage })),
)
const TripDetailPage = lazy(() =>
  import('@/pages/TripDetailPage').then((m) => ({ default: m.TripDetailPage })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

// Configurazione delle route in "data mode": un array di oggetti definito
// fuori dai componenti, come l'array `Routes` passato a `provideRouter(routes)`
// in Angular. `Component` è il componente da mostrare (≈ `component:`).
// È esportato a parte così i test possono creare un router in memoria.
export const routes: RouteObject[] = [
  {
    // Route padre senza contenuto proprio: mostra il Layout e, al posto del
    // suo `<Outlet />`, la route figlia che corrisponde all'URL
    // (≈ una route con `children` e un `<router-outlet>` nel suo template).
    // Il Layout è sempre visibile, quindi resta nel bundle iniziale.
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
]

export const router = createBrowserRouter(routes)
