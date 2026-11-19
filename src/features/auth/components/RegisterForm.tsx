import { useState } from 'react'
import type { SubmitEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/features/auth/useAuth'
import {
  MIN_PASSWORD_LENGTH,
  validateRegister,
} from '@/features/auth/validation'
import type { AuthFormErrors, RegisterValues } from '@/features/auth/validation'
import type { AuthErrorKey } from '@/i18n/locales/en/auth'

const errorClass = 'text-sm text-destructive'

// Form di registrazione. Due esiti possibili:
// - Supabase crea subito la sessione (conferma email disattivata): arriva
//   SIGNED_IN e RegisterPage reindirizza nell'app;
// - serve la conferma email (default nei progetti hosted): mostriamo un
//   messaggio con l'invito a controllare la posta.
export function RegisterForm() {
  const { t } = useTranslation('auth')
  const { signUp } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [errors, setErrors] = useState<AuthFormErrors<RegisterValues>>({})
  const [serverError, setServerError] = useState<AuthErrorKey | null>(null)
  const [submitting, setSubmitting] = useState(false)
  // Email a cui è stato inviato il link di conferma (null = form visibile).
  const [confirmationSentTo, setConfirmationSentTo] = useState<string | null>(
    null,
  )

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    const newErrors = validateRegister({ email, password, confirmPassword })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    const result = await signUp(email.trim(), password)
    setSubmitting(false)
    if (result.error) {
      setServerError(result.error)
    } else if (result.needsConfirmation) {
      setConfirmationSentTo(email.trim())
    }
  }

  if (confirmationSentTo !== null) {
    return (
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">
            <h1>{t('register.confirmEmailTitle')}</h1>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p role="status">
            {t('register.confirmEmail', { email: confirmationSentTo })}
          </p>
        </CardContent>
        <CardFooter>
          <Button variant="link" className="px-0" asChild>
            <Link to="/login">{t('register.toLogin')}</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          <h1>{t('register.title')}</h1>
        </CardTitle>
        <CardDescription>{t('register.description')}</CardDescription>
      </CardHeader>

      <form noValidate onSubmit={handleSubmit} className="grid gap-4">
        <CardContent className="grid gap-4">
          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {t(`errors.${serverError}`)}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="register-email">{t('fields.email')}</Label>
            <Input
              id="register-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email !== undefined}
              aria-describedby={
                errors.email ? 'register-email-error' : undefined
              }
            />
            {errors.email && (
              <p id="register-email-error" className={errorClass}>
                {t(`validation.${errors.email}`, { min: MIN_PASSWORD_LENGTH })}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-password">{t('fields.password')}</Label>
            <Input
              id="register-password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password !== undefined}
              aria-describedby={
                errors.password ? 'register-password-error' : undefined
              }
            />
            {errors.password && (
              <p id="register-password-error" className={errorClass}>
                {t(`validation.${errors.password}`, {
                  min: MIN_PASSWORD_LENGTH,
                })}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="register-confirm-password">
              {t('fields.confirmPassword')}
            </Label>
            <Input
              id="register-confirm-password"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              aria-invalid={errors.confirmPassword !== undefined}
              aria-describedby={
                errors.confirmPassword
                  ? 'register-confirm-password-error'
                  : undefined
              }
            />
            {errors.confirmPassword && (
              <p id="register-confirm-password-error" className={errorClass}>
                {t(`validation.${errors.confirmPassword}`, {
                  min: MIN_PASSWORD_LENGTH,
                })}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? t('register.submitting') : t('register.submit')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('register.haveAccount')}{' '}
            <Link
              to="/login"
              className="text-foreground underline underline-offset-4"
            >
              {t('register.toLogin')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
