import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { TripForm } from '@/features/trips/components/TripForm'

// Testing Library ≈ `TestBed.createComponent` + `fixture` in Angular, con una
// filosofia diversa: non si accede all'istanza o allo stato interno del
// componente, si interagisce con il DOM come farebbe un utente e si verifica
// ciò che vede. Per questo gli elementi si cercano per ruolo e per label
// accessibile (`getByRole`, `getByLabelText`): se il test li trova, li trova
// anche uno screen reader.

// Renderizza il form con uno spy al posto di `onCreate`.
// `vi.fn()` ≈ `jasmine.createSpy()` / `jest.fn()`: registra le chiamate.
function setup() {
  const onCreate = vi.fn()
  // `userEvent` simula le interazioni reali (focus, keydown, input, click…),
  // più fedele di `fireEvent`, che lancia un singolo evento sintetico.
  const user = userEvent.setup()
  render(<TripForm onCreate={onCreate} />)

  const fields = {
    destination: screen.getByLabelText('Destinazione'),
    startDate: screen.getByLabelText('Data di inizio'),
    endDate: screen.getByLabelText('Data di fine'),
    budget: screen.getByLabelText('Budget (€)'),
    submit: screen.getByRole('button', { name: 'Aggiungi viaggio' }),
  }

  return { onCreate, user, fields }
}

describe('TripForm', () => {
  describe('validazione', () => {
    it('con il form vuoto mostra un errore per ogni campo obbligatorio e non chiama onCreate', async () => {
      const { onCreate, user, fields } = setup()

      await user.click(fields.submit)

      expect(
        screen.getByText('La destinazione è obbligatoria.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('La data di inizio è obbligatoria.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('La data di fine è obbligatoria.'),
      ).toBeInTheDocument()
      expect(
        screen.getByText('Il budget deve essere maggiore di 0.'),
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
        'La destinazione è obbligatoria.',
      )
      expect(fields.budget).toHaveAttribute('aria-invalid', 'true')
    })

    it('considera vuota una destinazione di soli spazi', async () => {
      const { user, fields } = setup()

      await user.type(fields.destination, '   ')
      await user.click(fields.submit)

      expect(
        screen.getByText('La destinazione è obbligatoria.'),
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
        screen.getByText(
          'La data di fine non può essere prima di quella di inizio.',
        ),
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
        screen.getByText('Il budget deve essere maggiore di 0.'),
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
      await user.click(screen.getByRole('checkbox', { name: 'cultura' }))
      await user.click(screen.getByRole('checkbox', { name: 'cibo' }))
      await user.click(fields.submit)

      expect(onCreate).toHaveBeenCalledOnce()
      expect(onCreate).toHaveBeenCalledWith({
        // L'id è generato con `crypto.randomUUID()`: verifichiamo solo il tipo.
        id: expect.any(String),
        destination: 'Roma', // senza spazi ai lati
        startDate: '2026-05-10',
        endDate: '2026-05-15',
        budget: 500, // numero, non stringa
        interests: ['cultura', 'cibo'],
      })

      // Nessun errore mostrato…
      expect(screen.queryByText(/obbligatoria|maggiore di 0/)).toBeNull()
      // …e il form è tornato vuoto (`queryBy*` restituisce null invece di
      // lanciare un errore: si usa per verificare che qualcosa NON ci sia).
      expect(fields.destination).toHaveValue('')
      expect(fields.startDate).toHaveValue('')
      expect(fields.endDate).toHaveValue('')
      expect(fields.budget).toHaveValue(null) // input number vuoto
      expect(
        screen.getByRole('checkbox', { name: 'cultura' }),
      ).not.toBeChecked()
    })

    it('una checkbox cliccata due volte non viene inclusa negli interessi', async () => {
      const { onCreate, user, fields } = setup()
      const relax = screen.getByRole('checkbox', { name: 'relax' })

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
  })
})
