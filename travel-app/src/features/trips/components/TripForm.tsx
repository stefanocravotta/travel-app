import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { INTERESTS } from '../../../types/trip'
import type { Interest, Trip } from '../../../types/trip'

// --- Validazione ---
// In Angular useresti i Reactive Forms con `Validators.required` e un validator
// custom per le date. React non ha un sistema di form integrato: la validazione
// è una normale funzione. Più avanti la sostituiremo con React Hook Form + Zod.
// È una funzione pura fuori dal componente: riceve i valori e restituisce gli
// errori, quindi si potrà testare con Vitest senza fare il render del componente.

type FormValues = {
  destination: string
  startDate: string
  endDate: string
  budget: string
}

// Un messaggio per ogni campo non valido; i campi validi sono assenti.
type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (values.destination.trim() === '') {
    errors.destination = 'La destinazione è obbligatoria.'
  }
  if (values.startDate === '') {
    errors.startDate = 'La data di inizio è obbligatoria.'
  }
  if (values.endDate === '') {
    errors.endDate = 'La data di fine è obbligatoria.'
  } else if (values.startDate !== '' && values.endDate < values.startDate) {
    // Le date ISO `YYYY-MM-DD` si possono confrontare come stringhe:
    // l'ordine alfabetico coincide con quello cronologico.
    errors.endDate = 'La data di fine non può essere prima di quella di inizio.'
  }
  // `Number('')` vale 0 e `Number('abc')` vale NaN: in entrambi i casi
  // la condizione `> 0` è falsa, quindi basta un solo controllo.
  if (!(Number(values.budget) > 0)) {
    errors.budget = 'Il budget deve essere maggiore di 0.'
  }

  return errors
}

// Classi Tailwind condivise dagli input, per non ripeterle.
const inputClass =
  'mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none aria-invalid:border-red-500'
const errorClass = 'mt-1 text-sm text-red-600'

// --- Props ---
// `onCreate` è una prop di tipo funzione: è il modo in cui il figlio comunica
// con il padre. Equivale a un `@Output() create = new EventEmitter<Trip>()`
// (o a `output<Trip>()`): invece di fare `this.create.emit(trip)` il figlio
// chiama `onCreate(trip)`, e il padre decide cosa fare (qui: aggiornare lo stato).
// Per convenzione le prop-evento iniziano con `on`.
type TripFormProps = {
  onCreate: (trip: Trip) => void
}

export function TripForm({ onCreate }: TripFormProps) {
  // Un `useState` per campo. Sono "input controllati": il valore mostrato
  // dall'input viene sempre dallo stato e ogni battitura aggiorna lo stato con il
  // setter. È l'equivalente di `[(ngModel)]` (o `[value]` + `(input)`), ma
  // esplicito: React non ha il two-way binding, il collegamento lo scrivi tu.
  const [destination, setDestination] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  // Il budget è una stringa: `<input type="number">` restituisce comunque una
  // stringa, e così il campo vuoto resta vuoto invece di diventare 0.
  // Lo convertiamo in numero solo al submit.
  const [budget, setBudget] = useState('')
  // Il tipo generico serve perché da `[]` TypeScript non saprebbe dedurre il
  // tipo degli elementi.
  const [interests, setInterests] = useState<Interest[]>([])
  const [errors, setErrors] = useState<FormErrors>({})

  function toggleInterest(interest: Interest) {
    // Aggiornamento funzionale: passiamo al setter una funzione che riceve il
    // valore precedente (`prev`), così lavoriamo sempre sullo stato più recente.
    // L'array non va mai modificato in place (niente `push`/`splice`): creiamo un
    // nuovo array, altrimenti React non si accorgerebbe del cambiamento. È lo
    // stesso principio di `signal.update(...)` con dati immutabili.
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest],
    )
  }

  // `onSubmit` sul form ≈ `(ngSubmit)` in Angular. Differenza: Angular blocca
  // da solo il comportamento nativo (il ricaricamento della pagina), in React
  // va fatto a mano con `preventDefault()`.
  function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const newErrors = validate({ destination, startDate, endDate, budget })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    onCreate({
      id: crypto.randomUUID(),
      destination: destination.trim(),
      startDate,
      endDate,
      budget: Number(budget),
      interests,
    })

    // Reset: in React non esiste un `form.reset()` da chiamare, il form è
    // lo stato. Basta rimettere ogni stato al suo valore iniziale e gli input
    // controllati si svuotano da soli al render successivo.
    setDestination('')
    setStartDate('')
    setEndDate('')
    setBudget('')
    setInterests([])
  }

  return (
    // `noValidate` disattiva i fumetti di validazione nativi del browser
    // (che compaiono con type="date"/"number"): mostriamo solo i nostri messaggi.
    <form
      noValidate
      onSubmit={handleSubmit}
      className="mb-8 grid gap-4 rounded-lg border border-gray-200 p-4 shadow-sm sm:grid-cols-2"
    >
      <h2 className="text-xl font-semibold sm:col-span-2">Nuovo viaggio</h2>

      {/*
        Accessibilità: `htmlFor` (in JSX al posto di `for`, parola riservata di JS)
        collega la label all'input. `aria-invalid` segnala l'errore agli screen
        reader e `aria-describedby` collega l'input al messaggio d'errore.
        In JSX gli attributi `aria-*` accettano direttamente un booleano.
        I messaggi sono un rendering condizionale con `&&`: se l'espressione a
        sinistra è falsy non viene mostrato nulla (≈ `@if (errors.destination)`).
      */}
      <div className="sm:col-span-2">
        <label htmlFor="destination" className="font-medium">
          Destinazione
        </label>
        <input
          id="destination"
          value={destination}
          // `onChange` in React scatta a ogni battitura, come `(input)` in
          // Angular, non solo quando il campo perde il focus come il `change` nativo.
          onChange={(e) => setDestination(e.target.value)}
          aria-invalid={errors.destination !== undefined}
          aria-describedby={
            errors.destination ? 'destination-error' : undefined
          }
          className={inputClass}
        />
        {errors.destination && (
          <p id="destination-error" className={errorClass}>
            {errors.destination}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="startDate" className="font-medium">
          Data di inizio
        </label>
        <input
          id="startDate"
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          aria-invalid={errors.startDate !== undefined}
          aria-describedby={errors.startDate ? 'startDate-error' : undefined}
          className={inputClass}
        />
        {errors.startDate && (
          <p id="startDate-error" className={errorClass}>
            {errors.startDate}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="endDate" className="font-medium">
          Data di fine
        </label>
        <input
          id="endDate"
          type="date"
          value={endDate}
          // `min` aiuta l'utente nel date picker; la regola vera resta in `validate`.
          min={startDate || undefined}
          onChange={(e) => setEndDate(e.target.value)}
          aria-invalid={errors.endDate !== undefined}
          aria-describedby={errors.endDate ? 'endDate-error' : undefined}
          className={inputClass}
        />
        {errors.endDate && (
          <p id="endDate-error" className={errorClass}>
            {errors.endDate}
          </p>
        )}
      </div>

      <div className="sm:col-span-2">
        <label htmlFor="budget" className="font-medium">
          Budget (€)
        </label>
        <input
          id="budget"
          type="number"
          min="1"
          step="1"
          inputMode="numeric"
          value={budget}
          onChange={(e) => setBudget(e.target.value)}
          aria-invalid={errors.budget !== undefined}
          aria-describedby={errors.budget ? 'budget-error' : undefined}
          className={inputClass}
        />
        {errors.budget && (
          <p id="budget-error" className={errorClass}>
            {errors.budget}
          </p>
        )}
      </div>

      {/*
        Un gruppo di checkbox va in un `<fieldset>` con `<legend>`: lo screen
        reader annuncia "Interessi" come etichetta del gruppo.
        Le checkbox sono generate con `map` sull'array `INTERESTS`
        (≈ `@for (interest of interests; track interest)`).
        Anche qui sono controllate: `checked` deriva dallo stato.
        La label avvolge l'input, quindi non serve `htmlFor`.
      */}
      <fieldset className="sm:col-span-2">
        <legend className="font-medium">Interessi</legend>
        <div className="mt-2 flex flex-wrap gap-4">
          {INTERESTS.map((interest) => (
            <label key={interest} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={interests.includes(interest)}
                onChange={() => toggleInterest(interest)}
                className="h-4 w-4 accent-blue-600"
              />
              {interest}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="sm:col-span-2">
        <button
          type="submit"
          className="rounded-md bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 focus:outline-none"
        >
          Aggiungi viaggio
        </button>
      </div>
    </form>
  )
}
