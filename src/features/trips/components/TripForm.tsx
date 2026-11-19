import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
// Componenti shadcn/ui: non arrivano da node_modules come Angular Material, ma
// sono file sorgente copiati in `src/components/ui` dalla CLI (`npx shadcn add`).
// Sono nostri: si leggono, si modificano, e si importano con l'alias `@/`.
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { ValidationErrorKey } from '@/i18n/locales/en/trips'
import { INTERESTS } from '@/types/trip'
import type { Interest, NewTrip } from '@/types/trip'

// --- Validazione ---
// In Angular useresti i Reactive Forms con `Validators.required` e un validator
// custom per le date. React non ha un sistema di form integrato: la validazione
// è una normale funzione. Più avanti la sostituiremo con React Hook Form + Zod.
// È una funzione pura fuori dal componente: riceve i valori e restituisce gli
// errori, quindi si potrà testare con Vitest senza fare il render del componente.
//
// Restituisce *chiavi* di traduzione, non testi: la logica resta indipendente
// dalla lingua e il componente traduce al momento del render. Così un errore
// già mostrato cambia lingua insieme al resto dell'interfaccia (≈ in Angular,
// errori come `{ required: true }` tradotti nel template con la pipe).

type FormValues = {
  destination: string
  startDate: string
  endDate: string
  budget: string
}

// Una chiave d'errore per ogni campo non valido; i campi validi sono assenti.
type FormErrors = Partial<Record<keyof FormValues, ValidationErrorKey>>

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}

  if (values.destination.trim() === '') {
    errors.destination = 'destinationRequired'
  }
  if (values.startDate === '') {
    errors.startDate = 'startDateRequired'
  }
  if (values.endDate === '') {
    errors.endDate = 'endDateRequired'
  } else if (values.startDate !== '' && values.endDate < values.startDate) {
    // Le date ISO `YYYY-MM-DD` si possono confrontare come stringhe:
    // l'ordine alfabetico coincide con quello cronologico.
    errors.endDate = 'endDateBeforeStart'
  }
  // `Number('')` vale 0 e `Number('abc')` vale NaN: in entrambi i casi
  // la condizione `> 0` è falsa, quindi basta un solo controllo.
  if (!(Number(values.budget) > 0)) {
    errors.budget = 'budgetPositive'
  }

  return errors
}

// `text-destructive` è un token del tema (CSS variable), non un colore fisso:
// cambia da solo tra tema chiaro e scuro.
const errorClass = 'text-sm text-destructive'
const fieldClass = 'grid gap-2'

// --- Props ---
// `onCreate` è una prop di tipo funzione: è il modo in cui il figlio comunica
// con il padre. Equivale a un `@Output() create = new EventEmitter<Trip>()`
// (o a `output<Trip>()`): invece di fare `this.create.emit(trip)` il figlio
// chiama `onCreate(trip)`, e il padre decide cosa fare (qui: salvarlo sul server).
// Per convenzione le prop-evento iniziano con `on`.
// Può restituire una Promise: il form la aspetta, mostra lo stato "in
// salvataggio" e si svuota solo se va a buon fine. Se viene rifiutata, i dati
// restano nei campi e il padre mostra l'errore.
type TripFormProps = {
  onCreate: (trip: NewTrip) => Promise<void> | void
}

export function TripForm({ onCreate }: TripFormProps) {
  const { t } = useTranslation('trips')

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
  // Vero mentre `onCreate` è in corso: disabilita il bottone (niente doppi invii).
  const [submitting, setSubmitting] = useState(false)

  function setInterest(interest: Interest, checked: boolean) {
    // Aggiornamento funzionale: passiamo al setter una funzione che riceve il
    // valore precedente (`prev`), così lavoriamo sempre sullo stato più recente.
    // L'array non va mai modificato in place (niente `push`/`splice`): creiamo un
    // nuovo array, altrimenti React non si accorgerebbe del cambiamento. È lo
    // stesso principio di `signal.update(...)` con dati immutabili.
    setInterests((prev) =>
      checked
        ? prev.includes(interest)
          ? prev
          : [...prev, interest]
        : prev.filter((i) => i !== interest),
    )
  }

  // `onSubmit` sul form ≈ `(ngSubmit)` in Angular. Differenza: Angular blocca
  // da solo il comportamento nativo (il ricaricamento della pagina), in React
  // va fatto a mano con `preventDefault()`.
  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()

    const newErrors = validate({ destination, startDate, endDate, budget })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) {
      return
    }

    setSubmitting(true)
    try {
      // L'id non lo generiamo più qui: lo assegna il database.
      await onCreate({
        destination: destination.trim(),
        startDate,
        endDate,
        budget: Number(budget),
        interests,
      })
    } catch {
      // Salvataggio fallito: l'errore lo mostra il padre; qui teniamo i dati
      // inseriti, così l'utente può riprovare senza riscriverli.
      return
    } finally {
      setSubmitting(false)
    }

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
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t('form.title')}</CardTitle>
      </CardHeader>

      {/*
        `noValidate` disattiva i fumetti di validazione nativi del browser
        (che compaiono con type="date"/"number"): mostriamo solo i nostri messaggi.
        Il form avvolge contenuto e footer, così il bottone di submit è dentro il form.
      */}
      <form noValidate onSubmit={handleSubmit} className="grid gap-4">
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {/*
            Accessibilità: `Label` (shadcn) rende un `<label>`, e `htmlFor` (in
            JSX al posto di `for`, parola riservata di JS) lo collega all'input.
            `aria-invalid` segnala l'errore agli screen reader e, in `Input`,
            attiva anche lo stile rosso del bordo: nessuna classe da aggiungere.
            `aria-describedby` collega l'input al messaggio d'errore.
            I messaggi sono un rendering condizionale con `&&`: se l'espressione a
            sinistra è falsy non viene mostrato nulla (≈ `@if (errors.destination)`).
            La chiave d'errore viene tradotta qui: `t(\`form.errors.${key}\`)`.
          */}
          <div className={`${fieldClass} sm:col-span-2`}>
            <Label htmlFor="destination">{t('form.destination')}</Label>
            {/*
              `Input` accetta tutte le props di un `<input>` nativo e le inoltra:
              il pattern "input controllato" resta identico a prima.
              `onChange` in React scatta a ogni battitura, come `(input)` in Angular.
            */}
            <Input
              id="destination"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              aria-invalid={errors.destination !== undefined}
              aria-describedby={
                errors.destination ? 'destination-error' : undefined
              }
            />
            {errors.destination && (
              <p id="destination-error" className={errorClass}>
                {t(`form.errors.${errors.destination}`)}
              </p>
            )}
          </div>

          <div className={fieldClass}>
            <Label htmlFor="startDate">{t('form.startDate')}</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-invalid={errors.startDate !== undefined}
              aria-describedby={
                errors.startDate ? 'startDate-error' : undefined
              }
            />
            {errors.startDate && (
              <p id="startDate-error" className={errorClass}>
                {t(`form.errors.${errors.startDate}`)}
              </p>
            )}
          </div>

          <div className={fieldClass}>
            <Label htmlFor="endDate">{t('form.endDate')}</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              // `min` aiuta l'utente nel date picker; la regola vera resta in `validate`.
              min={startDate || undefined}
              onChange={(e) => setEndDate(e.target.value)}
              aria-invalid={errors.endDate !== undefined}
              aria-describedby={errors.endDate ? 'endDate-error' : undefined}
            />
            {errors.endDate && (
              <p id="endDate-error" className={errorClass}>
                {t(`form.errors.${errors.endDate}`)}
              </p>
            )}
          </div>

          <div className={`${fieldClass} sm:col-span-2`}>
            <Label htmlFor="budget">{t('form.budget')}</Label>
            <Input
              id="budget"
              type="number"
              min="1"
              step="1"
              inputMode="numeric"
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              aria-invalid={errors.budget !== undefined}
              aria-describedby={errors.budget ? 'budget-error' : undefined}
            />
            {errors.budget && (
              <p id="budget-error" className={errorClass}>
                {t(`form.errors.${errors.budget}`)}
              </p>
            )}
          </div>

          {/*
            Un gruppo di checkbox va in un `<fieldset>` con `<legend>`: lo screen
            reader annuncia "Interessi" come etichetta del gruppo.
            Le checkbox sono generate con `map` sull'array `INTERESTS`
            (≈ `@for (interest of interests; track interest)`).
          */}
          <fieldset className="grid gap-3 sm:col-span-2">
            <legend className="mb-3 text-sm font-medium">
              {t('form.interests')}
            </legend>
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {INTERESTS.map((interest) => {
                const id = `interest-${interest}`
                return (
                  <div key={interest} className="flex items-center gap-2">
                    {/*
                      La Checkbox di shadcn non è un `<input type="checkbox">`
                      ma un `<button role="checkbox">` di Radix, accessibile da
                      tastiera. Per questo l'evento non è `onChange` ma
                      `onCheckedChange`, che riceve direttamente il nuovo stato
                      (`true`, `false` o `'indeterminate'`), non un evento DOM.
                      Resta "controllata": `checked` deriva dallo stato.
                    */}
                    <Checkbox
                      id={id}
                      checked={interests.includes(interest)}
                      onCheckedChange={(checked) =>
                        setInterest(interest, checked === true)
                      }
                    />
                    <Label htmlFor={id} className="font-normal">
                      {t(`interests.${interest}`)}
                    </Label>
                  </div>
                )
              })}
            </div>
          </fieldset>
        </CardContent>

        <CardFooter>
          <Button type="submit" disabled={submitting}>
            {submitting ? t('form.submitting') : t('form.submit')}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
