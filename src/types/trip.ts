// Tipi di dominio condivisi. Qui c'è solo TypeScript, niente React:
// è lo stesso codice che scriveresti in un file `trip.model.ts` in Angular.

// I tipi TypeScript spariscono dopo la compilazione: non si può fare un ciclo
// su una union type per generare le checkbox. Per questo la lista dei valori
// esiste come array a runtime e il tipo `Interest` viene ricavato da essa.
// È un'unica fonte di verità: aggiungendo un valore qui si aggiornano sia il tipo
// sia il form.
// `as const` rende l'array readonly e fa sì che i suoi elementi abbiano tipi
// letterali ('cultura', 'cibo', ...) invece del generico `string`.
export const INTERESTS = [
  'cultura',
  'cibo',
  'natura',
  'relax',
  'nightlife',
] as const

// Union type ricavata dall'array: 'cultura' | 'cibo' | 'natura' | 'relax' | 'nightlife'.
// È un'alternativa leggera a un `enum` (che con `erasableSyntaxOnly` nel
// tsconfig non è comunque ammesso).
export type Interest = (typeof INTERESTS)[number]

export type Trip = {
  id: string
  destination: string
  // Date come stringa ISO `YYYY-MM-DD`: serializzabili così come sono
  // (JSON, Supabase). Si convertono in testo leggibile solo quando si mostrano.
  startDate: string
  endDate: string
  // Budget totale in euro.
  budget: number
  // Un viaggio può avere più interessi, quindi è un array di `Interest`.
  interests: Interest[]
}

// Dati per creare un viaggio: l'`id` (e il proprietario) li assegna il database.
export type NewTrip = Omit<Trip, 'id'>

// Type guard: restringe una stringa qualsiasi (es. dal database) a `Interest`.
export function isInterest(value: string): value is Interest {
  return (INTERESTS as readonly string[]).includes(value)
}
