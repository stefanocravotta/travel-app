/// <reference types="vite/client" />

// Tipi delle variabili d'ambiente esposte da Vite (`import.meta.env`).
// Sono `string | undefined`: se mancano in `.env.local`, TypeScript ci
// costringe a gestire il caso (vedi `src/lib/supabaseConfig.ts`).
// ≈ `environment.ts` in Angular, ma letto a build time dai file `.env`.
interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string
  readonly VITE_SUPABASE_PUBLISHABLE_KEY?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
