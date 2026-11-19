import type { Location } from 'react-router'

// Stato di navigazione che RequireAuth allega al redirect verso /login:
// ricorda la pagina richiesta per tornarci dopo l'accesso.
export type LoginRedirectState = { from: Location }

const AUTH_PAGES = ['/login', '/register']

// `location.state` è `unknown` (chiunque può navigare con qualsiasi state):
// lo validiamo invece di fare un cast alla cieca.
export function getRedirectTarget(state: unknown): string {
  if (
    typeof state === 'object' &&
    state !== null &&
    'from' in state &&
    typeof state.from === 'object' &&
    state.from !== null &&
    'pathname' in state.from &&
    typeof state.from.pathname === 'string'
  ) {
    const from = state.from as Location
    // Mai tornare a login/registrazione: creerebbe un giro a vuoto.
    if (!AUTH_PAGES.includes(from.pathname)) {
      return `${from.pathname}${from.search}${from.hash}`
    }
  }
  return '/'
}
