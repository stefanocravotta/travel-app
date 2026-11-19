// Legge e valida la configurazione di Supabase dalle variabili d'ambiente.
// È separata da `supabase.ts` (che crea il client all'import) per poterla
// testare senza creare client né toccare la rete.

export type SupabaseConfig = {
  url: string
  publishableKey: string
}

type SupabaseEnv = {
  VITE_SUPABASE_URL?: string
  VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

export function readSupabaseConfig(env: SupabaseEnv): SupabaseConfig {
  const url = env.VITE_SUPABASE_URL?.trim()
  const publishableKey = env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim()

  const missing = [
    !url && 'VITE_SUPABASE_URL',
    !publishableKey && 'VITE_SUPABASE_PUBLISHABLE_KEY',
  ].filter((name): name is string => typeof name === 'string')

  if (!url || !publishableKey) {
    // Messaggio per lo sviluppatore (in console), non per l'utente finale:
    // per questo non passa da i18n.
    throw new Error(
      `Missing Supabase configuration: ${missing.join(', ')}. ` +
        'Copy .env.example to .env.local, fill in the values from the ' +
        'Supabase dashboard (Project Settings → API Keys) and restart the dev server. ' +
        'On Vercel, set the same variables in Project Settings → Environment Variables.',
    )
  }

  return { url, publishableKey }
}
