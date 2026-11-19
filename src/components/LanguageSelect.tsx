import { useTranslation } from 'react-i18next'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SUPPORTED_LANGUAGES } from '@/i18n'

// Selettore della lingua nell'header. `i18n.changeLanguage` aggiorna tutti i
// componenti che usano `useTranslation` e il language detector salva la scelta
// in localStorage (`travel-app:lang`), così resta dopo un reload.
export function LanguageSelect() {
  const { t, i18n } = useTranslation()

  return (
    // `Select` di Radix è controllato come gli input: `value` + `onValueChange`
    // (≈ `[(ngModel)]` su un `mat-select`).
    <Select
      value={i18n.resolvedLanguage}
      onValueChange={(lng) => void i18n.changeLanguage(lng)}
    >
      <SelectTrigger size="sm" aria-label={t('language.label')}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent align="end">
        {SUPPORTED_LANGUAGES.map((lng) => (
          <SelectItem key={lng} value={lng}>
            {t(`language.names.${lng}`)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
