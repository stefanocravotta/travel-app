import { Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

// Fallback mostrato da `<Suspense>` mentre arriva il chunk JS di una pagina.
// `role="status"` + `aria-live="polite"`: gli screen reader annunciano il
// caricamento senza interrompere ciò che stanno leggendo.
export function PageLoader() {
  const { t } = useTranslation()

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center gap-2 py-16 text-muted-foreground"
    >
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span>{t('loading')}</span>
    </div>
  )
}
