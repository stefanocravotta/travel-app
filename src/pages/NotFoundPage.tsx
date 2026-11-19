import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export function NotFoundPage() {
  return (
    <div className="grid justify-items-center gap-2 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold">Pagina non trovata</h1>
      <p className="text-muted-foreground">
        L'indirizzo che hai aperto non esiste.
      </p>
      <Button variant="link" asChild>
        <Link to="/">Torna alla home</Link>
      </Button>
    </div>
  )
}
