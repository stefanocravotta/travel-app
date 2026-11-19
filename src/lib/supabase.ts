import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/database.types'
import { readSupabaseConfig } from '@/lib/supabaseConfig'

// Unica istanza del client Supabase per tutta l'app (un singleton di modulo):
// ≈ un service Angular `providedIn: 'root'` che incapsula `HttpClient`.
// Se le variabili d'ambiente mancano, `readSupabaseConfig` lancia un errore
// chiaro già all'avvio, invece di fallire più tardi con richieste invalide.
// La sessione è salvata in localStorage e il token si rinnova da solo.
// Nei test questo modulo è sostituito da un mock (vedi src/test/setup.ts).
const { url, publishableKey } = readSupabaseConfig(import.meta.env)

// `<Database>`: i tipi generati dal database (`npm run db:types`) rendono
// tipizzate tabelle, colonne e risultati delle query.
export const supabase = createClient<Database>(url, publishableKey)
