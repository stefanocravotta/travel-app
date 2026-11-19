import type { AuthError } from '@supabase/supabase-js'
import type { AuthErrorKey } from '@/i18n/locales/en/auth'

// Traduce un errore di Supabase in una chiave i18n. Usiamo `error.code`
// (stabile, documentato nei tipi di auth-js) e non `error.message` (testo
// inglese che può cambiare). Codici non previsti → messaggio generico.
const errorKeysByCode: Partial<Record<string, AuthErrorKey>> = {
  invalid_credentials: 'invalidCredentials',
  email_not_confirmed: 'emailNotConfirmed',
  user_already_exists: 'userAlreadyExists',
  email_exists: 'userAlreadyExists',
  weak_password: 'weakPassword',
  email_address_invalid: 'invalidEmail',
  over_email_send_rate_limit: 'rateLimited',
  over_request_rate_limit: 'rateLimited',
  signup_disabled: 'signupDisabled',
}

export function toAuthErrorKey(error: AuthError): AuthErrorKey {
  return (error.code && errorKeysByCode[error.code]) || 'unknown'
}
