'use client'

import { MailCheck } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Field, FormError } from '@/components/ui-kit/field'
import { PillButton } from '@/components/ui-kit/pill-button'
import { getErrorMessage } from '@/lib/api'
import { authService } from '@/lib/services'
import { AuthShell } from './auth-shell'

export function ForgotPasswordForm() {
  const [sentTo, setSentTo] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const email = String(new FormData(event.currentTarget).get('email')).trim()
    setError(null)
    setSubmitting(true)
    try {
      await authService.requestPasswordReset(email)
      setSentTo(email)
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos enviar el correo.'))
    } finally {
      setSubmitting(false)
    }
  }

  if (sentTo) {
    return (
      <AuthShell
        title="Revisa tu correo."
        subtitle={`Si existe una cuenta asociada a ${sentTo}, recibirás un enlace para restablecer tu contraseña.`}
        footer={
          <Link href="/login" className="text-primary hover:underline">
            {'Volver a iniciar sesión ›'}
          </Link>
        }
      >
        <div className="flex justify-center text-primary">
          <MailCheck className="size-14 stroke-[1.25]" aria-hidden="true" />
        </div>
      </AuthShell>
    )
  }

  return (
    <AuthShell
      title="¿Olvidaste tu contraseña?"
      subtitle="Introduce tu correo y te enviaremos un enlace para crear una nueva."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          {'Volver a iniciar sesión ›'}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="Correo electrónico" name="email" type="email" required autoComplete="email" autoFocus />
        <FormError message={error} />
        <PillButton type="submit" size="lg" loading={submitting} className="mt-4 w-full">
          Enviar enlace
        </PillButton>
      </form>
    </AuthShell>
  )
}
