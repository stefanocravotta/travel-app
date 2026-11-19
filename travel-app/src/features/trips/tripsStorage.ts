import type { Trip } from '@/types/trip'

// Persistenza dei viaggi in localStorage. Niente React qui: è un modulo di
// funzioni pure di I/O, come un piccolo service Angular senza DI.

const STORAGE_KEY = 'travel-app:trips'

// Viaggi di esempio, usati solo al primo avvio (localStorage vuoto)
// o se il dato salvato non è leggibile.
const sampleTrips: Trip[] = [
  {
    id: '1',
    destination: 'Lisbona',
    startDate: '2026-05-10',
    endDate: '2026-05-15',
    budget: 900,
    interests: ['cultura', 'cibo', 'nightlife'],
  },
  {
    id: '2',
    destination: 'Kyoto',
    startDate: '2026-10-02',
    endDate: '2026-10-12',
    budget: 3200,
    interests: ['cultura', 'natura', 'relax'],
  },
]

export function loadTrips(): Trip[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === null) {
      return sampleTrips
    }
    const parsed: unknown = JSON.parse(raw)
    // Controllo minimo: localStorage può contenere qualunque cosa (dati vecchi,
    // modifiche a mano). Verifichiamo solo che sia un array; la validazione
    // completa della forma di ogni `Trip` arriverà con uno schema Zod.
    return Array.isArray(parsed) ? (parsed as Trip[]) : sampleTrips
  } catch {
    // JSON non valido o storage non accessibile (es. navigazione privata).
    return sampleTrips
  }
}

export function saveTrips(trips: Trip[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trips))
  } catch {
    // Storage pieno o bloccato: l'app continua a funzionare in memoria.
  }
}
