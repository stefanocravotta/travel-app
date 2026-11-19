import { describe, expect, it } from 'vitest'
import { readSupabaseConfig } from '@/lib/supabaseConfig'

describe('readSupabaseConfig', () => {
  it('restituisce URL e publishable key quando ci sono', () => {
    expect(
      readSupabaseConfig({
        VITE_SUPABASE_URL: 'https://abc.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: 'sb_publishable_123',
      }),
    ).toEqual({
      url: 'https://abc.supabase.co',
      publishableKey: 'sb_publishable_123',
    })
  })

  it('lancia un errore che elenca tutte le variabili mancanti', () => {
    expect(() => readSupabaseConfig({})).toThrow(
      /Missing Supabase configuration: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY\..*\.env\.example/,
    )
  })

  it('considera mancante una variabile vuota o di soli spazi', () => {
    expect(() =>
      readSupabaseConfig({
        VITE_SUPABASE_URL: 'https://abc.supabase.co',
        VITE_SUPABASE_PUBLISHABLE_KEY: '   ',
      }),
    ).toThrow(/Missing Supabase configuration: VITE_SUPABASE_PUBLISHABLE_KEY\./)
  })
})
