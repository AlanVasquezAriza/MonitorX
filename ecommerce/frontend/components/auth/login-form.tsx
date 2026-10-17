'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState, type FormEvent } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { Field, FormError } from '@/components/ui-kit/field'
import { PillButton } from '@/components/ui-kit/pill-button'
import { getErrorMessage } from '@/lib/api'
import { AuthShell } from './auth-shell'

export function LoginForm({ next }: { next: string }) {
  const { login, status } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') router.replace(next)
  }, [status, next, router])

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    setError(null)
    setSubmitting(true)
    try {
      await login(String(form.get('identifier')).trim(), String(form.get('password')))
      router.replace(next)
    } catch (err) {
      setError(getErrorMessage(err, 'Usuario o contraseña incorrectos.'))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Inicia sesión."
      subtitle="Accede a tu bolsa, tus pedidos y mucho más."
      footer={
        <>
          {'¿No tienes cuenta? '}
          <Link href={`/register${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-primary hover:underline">
            {'Crea una ahora ›'}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <Field label="Usuario o correo electrónico" name="identifier" required autoComplete="username" autoFocus />
        <Field label="Contraseña" name="password" type="password" required autoComplete="current-password" />
        <FormError message={error} />
        <PillButton type="submit" size="lg" loading={submitting} className="mt-4 w-full">
          Continuar
        </PillButton>
        <Link href="/forgot-password" className="mt-4 self-center text-[15px] text-primary hover:underline">
          {'¿Has olvidado tu contraseña?'}
        </Link>
      </form>
    </AuthShell>
  )
}
