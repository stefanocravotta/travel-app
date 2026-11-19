import type { Tables, TablesInsert } from '@/lib/database.types'
import { supabase } from '@/lib/supabase'
import { isInterest } from '@/types/trip'
import type { NewTrip, Trip } from '@/types/trip'

// Accesso ai dati dei viaggi su Supabase: funzioni async senza React
// (≈ i metodi di un `TripsApiService` Angular che usa `HttpClient`).
// I componenti non le chiamano direttamente: passano dai query hook
// (queries.ts), che aggiungono cache e stati di caricamento/errore.
//
// Non serve filtrare per utente: la Row Level Security del database
// restituisce solo le righe dell'utente autenticato.

type TripRow = Tables<'trips'>

// Riga del database (snake_case, tipi generati) → tipo di dominio (camelCase).
// `interests` nel database è `text[]`: teniamo solo i valori che conosciamo
// (il database li vincola già con un CHECK, questo è un controllo di tipo).
function toTrip(row: TripRow): Trip {
  return {
    id: row.id,
    destination: row.destination,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    interests: row.interests.filter(isInterest),
  }
}

function toInsert(trip: NewTrip): TablesInsert<'trips'> {
  // Niente `id` né `user_id`: li assegna il database (default gen_random_uuid()
  // e auth.uid()), e la policy di INSERT verifica il proprietario.
  return {
    destination: trip.destination,
    start_date: trip.startDate,
    end_date: trip.endDate,
    budget: trip.budget,
    interests: trip.interests,
  }
}

// Gli errori vengono lanciati: TanStack Query li intercetta e imposta
// `isError` / `error` sulla query o sulla mutation.
export async function fetchTrips(): Promise<Trip[]> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('start_date', { ascending: true })
  if (error) throw error
  return data.map(toTrip)
}

// `null` se il viaggio non esiste o appartiene a un altro utente (la RLS lo
// nasconde): per l'interfaccia è semplicemente "non trovato".
export async function fetchTrip(id: string): Promise<Trip | null> {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('id', id)
    .maybeSingle()
  if (error) throw error
  return data ? toTrip(data) : null
}

export async function createTrip(trip: NewTrip): Promise<Trip> {
  const { data, error } = await supabase
    .from('trips')
    .insert(toInsert(trip))
    // Restituisce la riga creata (con id e created_at generati).
    .select('*')
    .single()
  if (error) throw error
  return toTrip(data)
}
