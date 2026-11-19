import { createContext } from 'react'

// 'system' segue la preferenza del sistema operativo (prefers-color-scheme).
export type Theme = 'light' | 'dark' | 'system'

export type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
}

// Stesso schema di TripsContext: `null` = nessun Provider sopra.
export const ThemeContext = createContext<ThemeContextValue | null>(null)
