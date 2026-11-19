import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  // Senza argomenti usa il namespace di default, "common".
  const { t } = useTranslation()

  return (
    <div className="grid justify-items-center gap-2 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold">{t('notFound.title')}</h1>
      <p className="text-muted-foreground">{t('notFound.description')}</p>
      <Button variant="link" asChild>
        <Link to="/">{t('notFound.backHome')}</Link>
      </Button>
    </div>
  )
}
