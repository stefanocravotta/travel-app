import { useContext } from 'react'
import { ThemeContext } from '@/components/theme/ThemeContext'
import type { ThemeContextValue } from '@/components/theme/ThemeContext'

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (context === null) {
    throw new Error('useTheme deve essere usato dentro <ThemeProvider>.')
  }
  return context
}
