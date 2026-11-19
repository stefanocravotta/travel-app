// Helper di formattazione condivisi da TripList e TripDetailPage.
// Sono funzioni pure a livello di modulo, come la logica di una pure pipe
// Angular (`date`, `currency`), ma ricevono la lingua come parametro: il
// componente passa quella attiva (`i18n.resolvedLanguage`).

// Creare un formatter `Intl` ha un costo: ne teniamo uno per lingua.
const dateFormatters = new Map<string, Intl.DateTimeFormat>()
const currencyFormatters = new Map<string, Intl.NumberFormat>()

function getDateFormatter(locale: string): Intl.DateTimeFormat {
  let formatter = dateFormatters.get(locale)
  if (formatter === undefined) {
    formatter = new Intl.DateTimeFormat(locale, {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      // `new Date('2026-05-10')` viene interpretata come mezzanotte UTC:
      // formattando in UTC la data non slitta di un giorno nei fusi negativi.
      timeZone: 'UTC',
    })
    dateFormatters.set(locale, formatter)
  }
  return formatter
}

function getCurrencyFormatter(locale: string): Intl.NumberFormat {
  let formatter = currencyFormatters.get(locale)
  if (formatter === undefined) {
    formatter = new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
    })
    currencyFormatters.set(locale, formatter)
  }
  return formatter
}

// `formatRange` unisce le parti in comune secondo le regole della lingua:
// "10–15 mag 2026" in italiano, "May 10 – 15, 2026" in inglese.
export function formatDateRange(
  startDate: string,
  endDate: string,
  locale: string,
): string {
  return getDateFormatter(locale).formatRange(
    new Date(startDate),
    new Date(endDate),
  )
}

// "1.500 €" in italiano, "€1,500" in inglese.
export function formatBudget(budget: number, locale: string): string {
  return getCurrencyFormatter(locale).format(budget)
}
