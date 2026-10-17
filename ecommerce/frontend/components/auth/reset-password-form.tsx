'use client'

import { CircleCheck } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent } from 'react'
import { Field, FormError } from '@/components/ui-kit/field'
import { PillButton, PillLink } from '@/components/ui-kit/pill-button'
import { getErrorMessage } from '@/lib/api'
import { authService } from '@/lib/services'
import { AuthShell } from './auth-shell'

export function ResetPasswordForm({ uid, token }: { uid: string; token: string }) {
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  if (!uid || !token) {
    return (
      <AuthShell title="Enlace no válido." subtitle="El enlace ha caducado o está incompleto. Solicita uno nuevo.">
        <PillLink href="/forgot-password" size="lg" className="w-full">
          Solicitar nuevo enlace
        </PillLink>
      </AuthShell>
    )
  }

  if (done) {
    return (
      <AuthShell title="Contraseña actualizada." subtitle="Ya puedes iniciar sesión con tu nueva contraseña.">
        <div className="mb-8 flex justify-center text-success">
          <CircleCheck className="size-14 stroke-[1.25]" aria-hidden="true" />
        </div>
        <PillLink href="/login" size="lg" className="w-full">
          Iniciar sesión
        </PillLink>
      </AuthShell>
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const password = String(form.get('password'))
    if (password !== String(form.get('confirm'))) {
      setError('Las contraseñas no coinciden.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await authService.confirmPasswordReset(uid, token, password)
      setDone(true)
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos actualizar tu contraseña.'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Crea una nueva contraseña."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          {'Volver a iniciar sesión ›'}
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="Nueva contraseña" name="password" type="password" required minLength={8} autoComplete="new-password" autoFocus />
        <Field label="Confirmar contraseña" name="confirm" type="password" required autoComplete="new-password" />
        <FormError message={error} />
        <PillButton type="submit" size="lg" loading={submitting} className="mt-4 w-full">
          Guardar contraseña
        </PillButton>
      </form>
    </AuthShell>
  )
}
