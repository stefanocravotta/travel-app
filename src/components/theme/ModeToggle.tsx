import { Moon, Sun } from 'lucide-react'
import { useTheme } from '@/components/theme/useTheme'
import { Button } from '@/components/ui/button'

// Alterna tra chiaro e scuro. Se il tema è 'system', il primo click passa
// all'opposto di quello attualmente visibile.
export function ModeToggle() {
  const { theme, setTheme } = useTheme()

  function toggle() {
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'light' : 'dark')
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="relative"
      onClick={toggle}
      title={`Tema: ${theme}`}
    >
      {/* Le icone cambiano solo via CSS con la variante `dark:` di Tailwind. */}
      <Sun className="scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
      <Moon className="absolute scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
      <span className="sr-only">Cambia tema chiaro/scuro</span>
    </Button>
  )
}
