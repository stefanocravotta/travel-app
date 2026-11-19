import type { auth as enAuth } from '@/i18n/locales/en/auth'
import type { TranslationShape } from '@/i18n/types'

export const auth = {
  login: {
    title: 'Accedi',
    description: 'Bentornato! Accedi per vedere i tuoi viaggi.',
    submit: 'Accedi',
    submitting: 'Accesso in corso…',
    noAccount: 'Non hai un account?',
    toRegister: 'Registrati',
  },
  register: {
    title: 'Crea un account',
    description: 'Registrati con la tua email per iniziare a pianificare.',
    submit: 'Crea account',
    submitting: 'Creazione account…',
    haveAccount: 'Hai già un account?',
    toLogin: 'Accedi',
    confirmEmailTitle: 'Controlla la tua email',
    confirmEmail:
      "Abbiamo inviato un link di conferma a {{email}}. Aprilo per attivare l'account, poi accedi.",
  },
  fields: {
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Conferma password',
  },
  validation: {
    emailRequired: "L'email è obbligatoria.",
    emailInvalid: 'Inserisci un indirizzo email valido.',
    passwordRequired: 'La password è obbligatoria.',
    passwordTooShort: 'La password deve avere almeno {{min}} caratteri.',
    passwordsDontMatch: 'Le password non coincidono.',
  },
  errors: {
    invalidCredentials: 'Email o password errate.',
    emailNotConfirmed: "Conferma l'email prima di accedere.",
    userAlreadyExists: 'Esiste già un account con questa email.',
    weakPassword: 'Questa password è troppo debole. Scegline una più sicura.',
    invalidEmail: 'Questo indirizzo email non è valido.',
    rateLimited: 'Troppi tentativi. Attendi un momento e riprova.',
    signupDisabled: 'Le nuove registrazioni sono disattivate.',
    unknown: 'Qualcosa è andato storto. Riprova.',
  },
} satisfies TranslationShape<typeof enAuth>
