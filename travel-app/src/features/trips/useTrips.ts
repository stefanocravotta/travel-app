import { useContext } from 'react'
import { TripsContext } from './TripsContext'
import type { TripsContextValue } from './TripsContext'

// Custom hook: una funzione che inizia con `use` e usa altri hook.
// È il modo React di incapsulare logica riutilizzabile; qui nasconde il
// context ai componenti, che scrivono solo `const { trips } = useTrips()`.
// Equivale a `inject(TripsService)` in Angular.
//
// Regola degli hook: si chiamano solo al primo livello di un componente o di
// un altro hook (mai dentro if, cicli o callback), perché React li riconosce
// in base all'ordine di chiamata.
export function useTrips(): TripsContextValue {
  const context = useContext(TripsContext)
  if (context === null) {
    // Come un `NullInjectorError` di Angular: il provider manca nell'albero.
    throw new Error('useTrips deve essere usato dentro <TripsProvider>.')
  }
  return context
}
