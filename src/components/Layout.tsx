import { Link, NavLink, Outlet } from 'react-router'
import { ModeToggle } from '@/components/theme/ModeToggle'
import { buttonVariants } from '@/components/ui/button'

// `buttonVariants` è la funzione (generata con class-variance-authority) che
// produce le classi di `Button` per una variante. Applicata a un `NavLink`, dà
// l'aspetto di un bottone a un elemento che resta semanticamente un link `<a>`.
// Con `NavLink` la prop `className` può essere una funzione, chiamata con
// `{ isActive }`: ≈ `routerLinkActive="classe-attiva"` in Angular.
function navLinkClass({ isActive }: { isActive: boolean }): string {
  return buttonVariants({ variant: isActive ? 'secondary' : 'ghost' })
}

// Layout comune a tutte le pagine. Nel router è la route padre: le route
// figlie vengono renderizzate al posto di `<Outlet />`, che è l'equivalente
// di `<router-outlet>` in Angular.
export function Layout() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-4 px-8 py-4">
          <Link to="/" className="font-heading text-xl font-semibold">
            Travel App
          </Link>
          <div className="flex items-center gap-2">
            <nav aria-label="Navigazione principale">
              <ul className="flex gap-1">
                <li>
                  {/*
                    `end` fa sì che "/" sia attivo solo sulla home e non su ogni
                    URL che inizia con "/": ≈ `[routerLinkActiveOptions]="{ exact: true }"`.
                    NavLink aggiunge anche `aria-current="page"` al link attivo.
                  */}
                  <NavLink to="/" end className={navLinkClass}>
                    Viaggi
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/trips/new" className={navLinkClass}>
                    Nuovo viaggio
                  </NavLink>
                </li>
              </ul>
            </nav>
            <ModeToggle />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-8">
        <Outlet />
      </main>
    </div>
  )
}
