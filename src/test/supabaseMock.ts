import { act } from '@testing-library/react'
import { AuthError, PostgrestError } from '@supabase/supabase-js'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { vi } from 'vitest'
import type { Tables } from '@/lib/database.types'

// Supabase finto per i test: nessuna chiamata di rete, nessuna variabile
// d'ambiente. `src/test/setup.ts` sostituisce `@/lib/supabase` con questo
// oggetto in tutti i test (≈ in Angular `{ provide: SupabaseService, useValue: mock }`
// nei `providers` del TestBed).

type AuthListener = (event: AuthChangeEvent, session: Session | null) => void

let listener: AuthListener | null = null
// Sessione emessa come INITIAL_SESSION all'iscrizione. `undefined` = non
// emettere nulla (per testare lo stato 'loading').
let initialSession: Session | null | undefined = null

export const unsubscribe = vi.fn()

// --- Query builder finto (supabase.from('trips').select().eq()…) ---
// Ogni metodo registra la chiamata e restituisce il builder stesso (come il
// vero client, che si concatena). Il builder è "thenable": `await` lo
// risolve con il prossimo risultato configurato dal test.
type QueryResult = { data: unknown; error: PostgrestError | null }

export type QueryCall = { table: string; method: string; args: unknown[] }

// Metodi del query builder usati dall'app (aggiungerne qui se servono).
type BuilderMethod =
  | 'select'
  | 'insert'
  | 'update'
  | 'delete'
  | 'eq'
  | 'order'
  | 'single'
  | 'maybeSingle'

// Tutte le chiamate al query builder, in ordine: i test le ispezionano.
export const queryCalls: QueryCall[] = []
let defaultResult: QueryResult = { data: [], error: null }
let queuedResults: QueryResult[] = []

type QueryBuilder = Record<
  BuilderMethod,
  (...args: unknown[]) => QueryBuilder
> &
  PromiseLike<QueryResult>

function createQueryBuilder(table: string): QueryBuilder {
  // Crea un metodo che registra la chiamata e restituisce il builder.
  const record =
    (method: BuilderMethod) =>
    (...args: unknown[]) => {
      queryCalls.push({ table, method, args })
      return builder
    }

  const builder: QueryBuilder = {
    select: record('select'),
    insert: record('insert'),
    update: record('update'),
    delete: record('delete'),
    eq: record('eq'),
    order: record('order'),
    single: record('single'),
    maybeSingle: record('maybeSingle'),
    then(onFulfilled, onRejected) {
      const result = queuedResults.shift() ?? defaultResult
      return Promise.resolve(result).then(onFulfilled, onRejected)
    },
  }
  return builder
}

// Risultato di tutte le query successive (finché non viene cambiato).
export function mockQueryResult(result: QueryResult) {
  defaultResult = result
}

// Risultato solo della prossima query (poi si torna al default).
export function mockQueryResultOnce(result: QueryResult) {
  queuedResults.push(result)
}

// Chiamate a un metodo specifico, es. `callsTo('insert')`.
export function callsTo(method: string): QueryCall[] {
  return queryCalls.filter((call) => call.method === method)
}

export const supabaseMock = {
  from: vi.fn((table: string) => createQueryBuilder(table)),
  auth: {
    // Come il vero client: registra il listener ed emette subito la sessione
    // iniziale; restituisce la sottoscrizione per il cleanup.
    onAuthStateChange: vi.fn((callback: AuthListener) => {
      listener = callback
      if (initialSession !== undefined) {
        callback('INITIAL_SESSION', initialSession)
      }
      return { data: { subscription: { unsubscribe } } }
    }),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
  },
}

// Ripristina il comportamento di default prima di ogni test (chiamato da setup.ts).
export function resetSupabaseMock() {
  listener = null
  initialSession = null
  queryCalls.length = 0
  defaultResult = { data: [], error: null }
  queuedResults = []
  supabaseMock.from.mockClear()
  unsubscribe.mockReset()
  supabaseMock.auth.onAuthStateChange.mockClear()
  supabaseMock.auth.signInWithPassword
    .mockReset()
    .mockResolvedValue({ data: { user: null, session: null }, error: null })
  supabaseMock.auth.signUp
    .mockReset()
    .mockResolvedValue({ data: { user: null, session: null }, error: null })
  supabaseMock.auth.signOut.mockReset().mockResolvedValue({ error: null })
}

// Da chiamare prima del render: sessione con cui parte l'app.
export function setInitialSession(session: Session | null | undefined) {
  initialSession = session
}

// Simula un evento di Supabase (SIGNED_IN, SIGNED_OUT…). `act` fa applicare
// a React gli aggiornamenti di stato prima delle verifiche.
export function emitAuthChange(
  event: AuthChangeEvent,
  session: Session | null,
) {
  act(() => {
    listener?.(event, session)
  })
}

export function fakeSession(email = 'mario@example.com'): Session {
  return {
    access_token: 'test-access-token',
    refresh_token: 'test-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user: {
      id: 'user-1',
      email,
      aud: 'authenticated',
      app_metadata: {},
      user_metadata: {},
      created_at: '2026-01-01T00:00:00Z',
    },
  }
}

// Riga della tabella `trips` come la restituirebbe il database.
export function fakeTripRow(
  overrides: Partial<Tables<'trips'>> = {},
): Tables<'trips'> {
  return {
    id: '3f0c6a4e-8a52-4d7e-9a43-0c2a1f7e5b11',
    user_id: 'user-1',
    destination: 'Lisbona',
    start_date: '2026-05-10',
    end_date: '2026-05-15',
    budget: 900,
    interests: ['cultura', 'cibo'],
    created_at: '2026-01-01T00:00:00Z',
    ...overrides,
  }
}

// Errore come quelli restituiti da PostgREST (query al database).
export function fakeDbError(message = 'Database error'): PostgrestError {
  return new PostgrestError({
    message,
    details: '',
    hint: '',
    code: 'XX000',
  })
}

// Errore come quelli restituiti da Supabase: conta il `code`.
export function fakeAuthError(code: string, status = 400): AuthError {
  return new AuthError(`Supabase error: ${code}`, status, code)
}
