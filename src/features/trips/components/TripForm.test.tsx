import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TripForm } from '@/features/trips/components/TripForm'
import i18n from '@/i18n'

// Testing Library ≈ `TestBed.createComponent` + `fixture` in Angular, con una
// filosofia diversa: non si accede all'istanza o allo stato interno del
// componente, si interagisce con il DOM come farebbe un utente e si verifica
// ciò che vede. Per questo gli elementi si cercano per ruolo e per label
// accessibile (`getByRole`, `getByLabelText`): se il test li trova, li trova
// anche uno screen reader.

// I testi attesi arrivano dalle traduzioni inglesi (lingua impostata in
// `src/test/setup.ts`). `getFixedT` restituisce una `t` legata a lingua e
// namespace, con le stesse chiavi tipizzate dell'app: se una chiave cambia
// nome, il test non compila invece di fallire in modo misterioso.
const t = i18n.getFixedT('en', 'trips')

// Renderizza il form con uno spy al posto di `onCreate`.
// `vi.fn()` ≈ `jasmine.createSpy()` / `jest.fn()`: registra le chiamate.
function setup() {
  const onCreate = vi.fn()
  // `userEvent` simula le interazioni reali (focus, keydown, input, click…),
  // più fedele di `fireEvent`, che lancia un singolo evento sintetico.
  const user = userEvent.setup()
  render(<TripForm onCreate={onCreate} />)

  const fields = {
    destination: screen.getByLabelText(t('form.destination')),
    startDate: screen.getByLabelText(t('form.startDate')),
    endDate: screen.getByLabelText(t('form.endDate')),
    budget: screen.getByLabelText(t('form.budget')),
    submit: screen.getByRole('button', { name: t('form.submit') }),
  }

  return { onCreate, user, fields }
}

describe('TripForm', () => {
  describe('validazione', () => {
    it('con il form vuoto mostra un errore per ogni campo obbligatorio e non chiama onCreate', async () => {
      const { onCreate, user, fields } = setup()

      await user.click(fields.submit)

      expect(
        screen.getByText(t('form.errors.destinationRequired')),
      ).toBeInTheDocument()
      expect(
        screen.getByText(t('form.errors.startDateRequired')),
      ).toBeInTheDocument()
      expect(
        screen.getByText(t('form.errors.endDateRequired')),
      ).toBeInTheDocument()
      expect(
        screen.getByText(t('form.errors.budgetPositive')),
      ).toBeInTheDocument()
      expect(onCreate).not.toHaveBeenCalled()
    })

    it('marca i campi non validi con aria-invalid e li collega al messaggio', async () => {
      const { user, fields } = setup()

      await user.click(fields.submit)

      expect(fields.destination).toHaveAttribute('aria-invalid', 'true')
      // `toHaveAccessibleDescription` verifica il collegamento via
      // `aria-describedby`: è il testo che lo screen reader legge sul campo.
      expect(fields.destination).toHaveAccessibleDescription(
        t('form.errors.destinationRequired'),
      )
      expect(fields.budget).toHaveAttribute('aria-invalid', 'true')
    })

    it('considera vuota una destinazione di soli spazi', async () => {
      const { user, fields } = setup()

      await user.type(fields.destination, '   ')
      await user.click(fields.submit)

      expect(
        screen.getByText(t('form.errors.destinationRequired')),
      ).toBeInTheDocument()
    })

    it('segnala una data di fine precedente a quella di inizio', async () => {
      const { onCreate, user, fields } = setup()

      await user.type(fields.destination, 'Roma')
      await user.type(fields.startDate, '2026-05-10')
      await user.type(fields.endDate, '2026-05-01')
      await user.type(fields.budget, '500')
      await user.click(fields.submit)

      expect(
        screen.getByText(t('form.errors.endDateBeforeStart')),
      ).toBeInTheDocument()
      expect(onCreate).not.toHaveBeenCalled()
    })

    it('accetta data di fine uguale a quella di inizio', async () => {
      const { onCreate, user, fields } = setup()

      await user.type(fields.destination, 'Roma')
      await user.type(fields.startDate, '2026-05-10')
      await user.type(fields.endDate, '2026-05-10')
      await user.type(fields.budget, '100')
      await user.click(fields.submit)

      expect(onCreate).toHaveBeenCalledOnce()
    })

    it('rifiuta un budget pari a 0', async () => {
      const { onCreate, user, fields } = setup()

      await user.type(fields.destination, 'Roma')
      await user.type(fields.startDate, '2026-05-10')
      await user.type(fields.endDate, '2026-05-12')
      await user.type(fields.budget, '0')
      await user.click(fields.submit)

      expect(
        screen.getByText(t('form.errors.budgetPositive')),
      ).toBeInTheDocument()
      expect(onCreate).not.toHaveBeenCalled()
    })
  })

  describe('submit', () => {
    it('con dati validi chiama onCreate con il viaggio e resetta il form', async () => {
      const { onCreate, user, fields } = setup()

      await user.type(fields.destination, '  Roma  ')
      await user.type(fields.startDate, '2026-05-10')
      await user.type(fields.endDate, '2026-05-15')
      await user.type(fields.budget, '500')
      await user.click(
        screen.getByRole('checkbox', { name: t('interests.cultura') }),
      )
      await user.click(
        screen.getByRole('checkbox', { name: t('interests.cibo') }),
      )
      await user.click(fields.submit)

      expect(onCreate).toHaveBeenCalledOnce()
      // Esattamente questi campi: niente `id`, lo assegna il database.
      expect(onCreate).toHaveBeenCalledWith({
        destination: 'Roma', // senza spazi ai lati
        startDate: '2026-05-10',
        endDate: '2026-05-15',
        budget: 500, // numero, non stringa
        // I valori salvati restano le chiavi del dominio, non le etichette tradotte.
        interests: ['cultura', 'cibo'],
      })

      // Nessun errore mostrato (`queryBy*` restituisce null invece di lanciare
      // un errore: si usa per verificare che qualcosa NON ci sia)…
      expect(
        screen.queryByText(t('form.errors.destinationRequired')),
      ).toBeNull()
      // …e il form è tornato vuoto.
      expect(fields.destination).toHaveValue('')
      expect(fields.startDate).toHaveValue('')
      expect(fields.endDate).toHaveValue('')
      expect(fields.budget).toHaveValue(null) // input number vuoto
      expect(
        screen.getByRole('checkbox', { name: t('interests.cultura') }),
      ).not.toBeChecked()
    })

    it('una checkbox cliccata due volte non viene inclusa negli interessi', async () => {
      const { onCreate, user, fields } = setup()
      const relax = screen.getByRole('checkbox', {
        name: t('interests.relax'),
      })

      await user.click(relax)
      expect(relax).toBeChecked()
      await user.click(relax)
      expect(relax).not.toBeChecked()

      await user.type(fields.destination, 'Oslo')
      await user.type(fields.startDate, '2026-07-01')
      await user.type(fields.endDate, '2026-07-05')
      await user.type(fields.budget, '1200')
      await user.click(fields.submit)

      expect(onCreate).toHaveBeenCalledWith(
        expect.objectContaining({ interests: [] }),
      )
    })

    it('mentre il salvataggio è in corso disabilita il bottone', async () => {
      const { onCreate, user, fields } = setup()
      // Promise che risolviamo noi: simula una richiesta ancora in corso.
      let finish: () => void = () => {}
      onCreate.mockReturnValue(
        new Promise<void>((resolve) => {
          finish = resolve
        }),
      )

      await user.type(fields.destination, 'Roma')
      await user.type(fields.startDate, '2026-05-10')
      await user.type(fields.endDate, '2026-05-12')
      await user.type(fields.budget, '300')
      await user.click(fields.submit)

      const saving = screen.getByRole('button', { name: t('form.submitting') })
      expect(saving).toBeDisabled()

      await act(async () => finish())
      expect(
        screen.getByRole('button', { name: t('form.submit') }),
      ).toBeEnabled()
    })

    it('se il salvataggio fallisce non svuota i campi', async () => {
      const { onCreate, user, fields } = setup()
      onCreate.mockRejectedValue(new Error('network down'))

      await user.type(fields.destination, 'Roma')
      await user.type(fields.startDate, '2026-05-10')
      await user.type(fields.endDate, '2026-05-12')
      await user.type(fields.budget, '300')
      await user.click(fields.submit)

      expect(onCreate).toHaveBeenCalledOnce()
      // L'utente può riprovare senza riscrivere nulla.
      expect(fields.destination).toHaveValue('Roma')
      expect(fields.budget).toHaveValue(300)
      expect(
        screen.getByRole('button', { name: t('form.submit') }),
      ).toBeEnabled()
    })
  })

  describe('i18n', () => {
    // Qui usiamo testi letterali in italiano: vogliamo verificare che
    // l'interfaccia sia davvero tradotta, non solo che chiavi e test coincidano.
    it('mostra label ed errori in italiano', async () => {
      await i18n.changeLanguage('it')
      const user = userEvent.setup()
      render(<TripForm onCreate={vi.fn()} />)

      await user.click(screen.getByRole('button', { name: 'Aggiungi viaggio' }))

      expect(screen.getByLabelText('Destinazione')).toBeInTheDocument()
      expect(
        screen.getByText('La destinazione è obbligatoria.'),
      ).toBeInTheDocument()
      expect(
        screen.getByRole('checkbox', { name: 'Vita notturna' }),
      ).toBeInTheDocument()
    })

    it('traduce gli errori già mostrati quando cambia la lingua', async () => {
      const { user, fields } = setup()
      await user.click(fields.submit)
      expect(screen.getByText('Destination is required.')).toBeInTheDocument()

      // `act` fa applicare a React gli aggiornamenti causati dal cambio lingua
      // prima delle verifiche (≈ `fixture.detectChanges()` in Angular).
      await act(() => i18n.changeLanguage('it'))

      // `validate()` ha salvato una chiave, non un testo: il messaggio cambia
      // lingua senza un nuovo submit.
      expect(
        screen.getByText('La destinazione è obbligatoria.'),
      ).toBeInTheDocument()
    })
  })
})
