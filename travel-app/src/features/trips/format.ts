// Helper di formattazione condivisi da TripList e TripDetailPage.
// Sono funzioni pure a livello di modulo: in React il corpo di un componente
// viene rieseguito a ogni render, quindi tutto ciò che non dipende da props o
// stato conviene tenerlo fuori (come una utility importata in Angular, o la
// logica di una pure pipe tipo `date`/`currency`).

const dateFormatter = new Intl.DateTimeFormat('it-IT', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
  // `new Date('2026-05-10')` viene interpretata come mezzanotte UTC: formattando
  // in UTC evitiamo che in un fuso orario negativo la data slitti di un giorno.
  timeZone: 'UTC',
})

const currencyFormatter = new Intl.NumberFormat('it-IT', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
})

export function formatDateRange(startDate: string, endDate: string): string {
  return `${dateFormatter.format(new Date(startDate))} – ${dateFormatter.format(new Date(endDate))}`
}

export function formatBudget(budget: number): string {
  return currencyFormatter.format(budget)
}
