import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ThemeContext } from '@/components/theme/ThemeContext'
import type { Theme } from '@/components/theme/ThemeContext'

// Il tema di shadcn/ui è fatto di CSS variables definite in `src/index.css`:
// `:root` per il chiaro e `.dark` per lo scuro. Per cambiare tema basta
// mettere o togliere la classe `dark` su `<html>`. Questo provider decide quale.

const STORAGE_KEY = 'travel-app:theme'

function isTheme(value: string | null): value is Theme {
  return value === 'light' || value === 'dark' || value === 'system'
}

function loadTheme(): Theme {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isTheme(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

type ThemeProviderProps = {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<Theme>(loadTheme)

  // Sincronizza il DOM (fuori dal controllo di React) con lo stato: è il caso
  // d'uso tipico di `useEffect` (≈ `effect()` che tocca il DOM in Angular).
  useEffect(() => {
    const root = document.documentElement
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function apply() {
      const resolved =
        theme === 'system' ? (media.matches ? 'dark' : 'light') : theme
      root.classList.remove('light', 'dark')
      root.classList.add(resolved)
    }

    apply()

    if (theme !== 'system') {
      return
    }
    // In modalità 'system' ascoltiamo i cambi di preferenza del sistema.
    // La funzione restituita è il "cleanup": React la chiama prima di
    // rieseguire l'effetto o quando il componente viene smontato, così
    // rimuoviamo il listener (≈ `DestroyRef.onDestroy` / unsubscribe in Angular).
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [theme])

  const setTheme = useCallback((next: Theme) => {
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Storage non disponibile: il tema vale solo per questa sessione.
    }
    setThemeState(next)
  }, [])

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme])

  return <ThemeContext value={value}>{children}</ThemeContext>
}
