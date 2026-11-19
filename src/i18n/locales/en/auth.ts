export const auth = {
  login: {
    title: 'Sign in',
    description: 'Welcome back! Sign in to see your trips.',
    submit: 'Sign in',
    submitting: 'Signing in…',
    noAccount: "Don't have an account?",
    toRegister: 'Create one',
  },
  register: {
    title: 'Create an account',
    description: 'Sign up with your email to start planning trips.',
    submit: 'Create account',
    submitting: 'Creating account…',
    haveAccount: 'Already have an account?',
    toLogin: 'Sign in',
    confirmEmailTitle: 'Check your email',
    confirmEmail:
      'We sent a confirmation link to {{email}}. Open it to activate your account, then sign in.',
  },
  fields: {
    email: 'Email',
    password: 'Password',
    confirmPassword: 'Confirm password',
  },
  // Client-side validation (returned as keys by `validation.ts`).
  validation: {
    emailRequired: 'Email is required.',
    emailInvalid: 'Enter a valid email address.',
    passwordRequired: 'Password is required.',
    passwordTooShort: 'Password must be at least {{min}} characters.',
    passwordsDontMatch: "Passwords don't match.",
  },
  // Server errors, mapped from Supabase `AuthError.code` in AuthProvider.
  errors: {
    invalidCredentials: 'Wrong email or password.',
    emailNotConfirmed: 'Confirm your email before signing in.',
    userAlreadyExists: 'An account with this email already exists.',
    weakPassword: 'This password is too weak. Choose a stronger one.',
    invalidEmail: 'This email address is not valid.',
    rateLimited: 'Too many attempts. Please wait a moment and try again.',
    signupDisabled: 'New sign-ups are currently disabled.',
    unknown: 'Something went wrong. Please try again.',
  },
} as const

export type AuthValidationKey = keyof typeof auth.validation
export type AuthErrorKey = keyof typeof auth.errors
