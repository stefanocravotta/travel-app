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
import { MIN_PASSWORD_LENGTH, validateLogin } from '@/features/auth/validation'
import type { AuthFormErrors, LoginValues } from '@/features/auth/validation'
import type { AuthErrorKey } from '@/i18n/locales/en/auth'

const errorClass = 'text-sm text-destructive'

// Form di accesso. Dopo un login riuscito non naviga da solo: Supabase emette
// SIGNED_IN, AuthProvider passa a 'authenticated' e LoginPage reindirizza.
export function LoginForm() {
  const { t } = useTranslation('auth')
  const { signIn } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<AuthFormErrors<LoginValues>>({})
  const [serverError, setServerError] = useState<AuthErrorKey | null>(null)
  // Stato "in invio": disabilita il bottone ed evita doppi submit.
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: SubmitEvent<HTMLFormElement>) {
    e.preventDefault()
    setServerError(null)

    const newErrors = validateLogin({ email, password })
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setSubmitting(true)
    const { error } = await signIn(email.trim(), password)
    setSubmitting(false)
    if (error) setServerError(error)
  }

  return (
    <Card className="mx-auto w-full max-w-sm">
      <CardHeader>
        <CardTitle className="text-xl">
          <h1>{t('login.title')}</h1>
        </CardTitle>
        <CardDescription>{t('login.description')}</CardDescription>
      </CardHeader>

      <form noValidate onSubmit={handleSubmit} className="grid gap-4">
        <CardContent className="grid gap-4">
          {/* `role="alert"`: lo screen reader annuncia subito l'errore del server. */}
          {serverError && (
            <p
              role="alert"
              className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            >
              {t(`errors.${serverError}`)}
            </p>
          )}

          <div className="grid gap-2">
            <Label htmlFor="login-email">{t('fields.email')}</Label>
            <Input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={errors.email !== undefined}
              aria-describedby={errors.email ? 'login-email-error' : undefined}
            />
            {errors.email && (
              <p id="login-email-error" className={errorClass}>
                {t(`validation.${errors.email}`, { min: MIN_PASSWORD_LENGTH })}
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="login-password">{t('fields.password')}</Label>
            <Input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={errors.password !== undefined}
              aria-describedby={
                errors.password ? 'login-password-error' : undefined
              }
            />
            {errors.password && (
              <p id="login-password-error" className={errorClass}>
                {t(`validation.${errors.password}`, {
                  min: MIN_PASSWORD_LENGTH,
                })}
              </p>
            )}
          </div>
        </CardContent>

        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? t('login.submitting') : t('login.submit')}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            {t('login.noAccount')}{' '}
            <Link
              to="/register"
              className="text-foreground underline underline-offset-4"
            >
              {t('login.toRegister')}
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
