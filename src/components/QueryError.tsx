import { RotateCw } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

type QueryErrorProps = {
  // Messaggio già tradotto dal chiamante (dipende dal contesto).
  message: string
  // Di solito `refetch` della query fallita.
  onRetry: () => void
}

// Stato di errore di una query, con un bottone per riprovare.
// `role="alert"`: lo screen reader annuncia l'errore appena compare.
export function QueryError({ message, onRetry }: QueryErrorProps) {
  const { t } = useTranslation()

  return (
    <div
      role="alert"
      className="grid justify-items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-center"
    >
      <p className="text-destructive">{message}</p>
      <Button variant="outline" size="sm" onClick={onRetry}>
        <RotateCw />
        {t('retry')}
      </Button>
    </div>
  )
}
