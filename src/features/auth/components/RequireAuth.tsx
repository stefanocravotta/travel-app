import { Navigate, Outlet, useLocation } from 'react-router'
import { PageLoader } from '@/components/PageLoader'
import type { LoginRedirectState } from '@/features/auth/redirect'
import { useAuth } from '@/features/auth/useAuth'

// "Guard" delle rotte private. Nel router è una route di layout senza path:
// tutte le route figlie passano di qui prima di essere mostrate.
//
// Equivalente Angular: un `CanActivateFn` (o `canMatch`) sulle route private:
//   export const authGuard: CanActivateFn = (_route, state) =>
//     inject(AuthService).isLoggedIn()
//       ? true
//       : inject(Router).createUrlTree(['/login'], { queryParams: { returnUrl: state.url } })
// Differenze: qui la guard è un componente che decide cosa renderizzare, e la
// pagina richiesta viaggia nello `state` della navigazione (non visibile
// nell'URL) invece che in un query param.
// Alternativa in React Router data mode: un `loader`/middleware che fa
// `redirect('/login')`; qui usiamo un componente perché lo stato di auth vive
// in un context React (AuthProvider), che i loader non possono leggere.
export function RequireAuth() {
  const { status } = useAuth()
  const location = useLocation()

  // Sessione iniziale non ancora nota: non decidiamo nulla, altrimenti un
  // utente loggato verrebbe mandato al login per un istante a ogni reload.
  if (status === 'loading') {
    return <PageLoader />
  }

  if (status === 'unauthenticated') {
    const state: LoginRedirectState = { from: location }
    // `replace`: la pagina protetta non resta nella cronologia, così "Indietro"
    // dal login non riporta a una pagina che rimanderebbe di nuovo al login.
    return <Navigate to="/login" replace state={state} />
  }

  // Autenticato: mostra la route figlia (≈ `return true` della guard).
  return <Outlet />
}
