import type { AuthValidationKey } from '@/i18n/locales/en/auth'

// Validazione lato client dei form di autenticazione: funzioni pure che
// restituiscono chiavi i18n (stesso schema di `validate()` in TripForm).
// Il server (Supabase) resta comunque l'autorità finale.

// Minimo di default di Supabase per le password.
export const MIN_PASSWORD_LENGTH = 6

// Controllo volutamente semplice: "qualcosa@qualcosa.qualcosa", senza spazi.
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type LoginValues = { email: string; password: string }
export type RegisterValues = LoginValues & { confirmPassword: string }

export type AuthFormErrors<T> = Partial<Record<keyof T, AuthValidationKey>>

function validateEmail(email: string): AuthValidationKey | undefined {
  if (email.trim() === '') return 'emailRequired'
  if (!EMAIL_PATTERN.test(email.trim())) return 'emailInvalid'
  return undefined
}

export function validateLogin(
  values: LoginValues,
): AuthFormErrors<LoginValues> {
  const errors: AuthFormErrors<LoginValues> = {}
  const email = validateEmail(values.email)
  if (email) errors.email = email
  if (values.password === '') errors.password = 'passwordRequired'
  return errors
}

export function validateRegister(
  values: RegisterValues,
): AuthFormErrors<RegisterValues> {
  const errors: AuthFormErrors<RegisterValues> = {}
  const email = validateEmail(values.email)
  if (email) errors.email = email
  if (values.password === '') {
    errors.password = 'passwordRequired'
  } else if (values.password.length < MIN_PASSWORD_LENGTH) {
    errors.password = 'passwordTooShort'
  }
  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = 'passwordsDontMatch'
  }
  return errors
}
