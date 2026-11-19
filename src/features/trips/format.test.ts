import { describe, expect, it } from 'vitest'
import { formatBudget, formatDateRange } from '@/features/trips/format'

// `Intl` usa spazi speciali (non-breaking, thin space…) che variano tra le
// versioni dei dati ICU di Node: li normalizziamo a spazi normali per
// confrontare i testi in modo stabile.
function normalize(text: string): string {
  return text.replace(/\s/g, ' ')
}

describe('formatBudget', () => {
  it('usa separatori e posizione del simbolo della lingua', () => {
    expect(normalize(formatBudget(15000, 'it'))).toBe('15.000 €')
    expect(normalize(formatBudget(15000, 'en'))).toBe('€15,000')
  })

  it('in italiano non raggruppa i numeri di 4 cifre (regola CLDR)', () => {
    // L'italiano ha `minimumGroupingDigits: 2`: "1500 €", non "1.500 €".
    expect(normalize(formatBudget(1500, 'it'))).toBe('1500 €')
    expect(normalize(formatBudget(1500, 'en'))).toBe('€1,500')
  })

  it('non mostra decimali', () => {
    expect(normalize(formatBudget(999.6, 'en'))).toBe('€1,000')
  })
})

describe('formatDateRange', () => {
  it('formatta l’intervallo nella lingua richiesta', () => {
    const it_ = normalize(formatDateRange('2026-05-10', '2026-05-15', 'it'))
    const en = normalize(formatDateRange('2026-05-10', '2026-05-15', 'en'))

    expect(it_).toMatch(/10.*15 mag 2026/)
    expect(en).toMatch(/May 10.*15, 2026/)
  })

  it('non sposta le date di un giorno (le stringhe ISO sono trattate in UTC)', () => {
    const text = normalize(formatDateRange('2026-01-01', '2026-01-31', 'en'))

    expect(text).toMatch(/Jan 1\b/)
    expect(text).toMatch(/31, 2026/)
  })
})
