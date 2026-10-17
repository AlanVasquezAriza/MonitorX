'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { Field, FormError } from '@/components/ui-kit/field'
import { PillButton } from '@/components/ui-kit/pill-button'
import { getErrorMessage } from '@/lib/api'
import { AuthShell } from './auth-shell'

export function RegisterForm({ next }: { next: string }) {
  const { register, status } = useAuth()
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const value = (key: string) => String(form.get(key) ?? '').trim()
    const password = String(form.get('password'))
    if (password !== String(form.get('confirm'))) {
      setError('Las contraseñas no coinciden.')
      return
    }
    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    setError(null)
    setSubmitting(true)
    try {
      await register({
        username: value('username'),
        email: value('email'),
        password,
        first_name: value('first_name'),
        last_name: value('last_name'),
      })
      toast.success('¡Bienvenido! Tu cuenta está lista.')
      router.replace(next)
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos crear tu cuenta.'))
      setSubmitting(false)
    }
  }

  return (
    <AuthShell
      title="Crea tu cuenta."
      subtitle="Una cuenta para comprar, seguir tus pedidos y guardar tus datos."
      footer={
        <>
          {'¿Ya tienes cuenta? '}
          <Link href={`/login${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`} className="text-primary hover:underline">
            {'Inicia sesión ›'}
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Nombre" name="first_name" required autoComplete="given-name" />
          <Field label="Apellidos" name="last_name" required autoComplete="family-name" />
        </div>
        <Field label="Nombre de usuario" name="username" required autoComplete="username" />
        <Field label="Correo electrónico" name="email" type="email" required autoComplete="email" />
        <Field label="Contraseña" name="password" type="password" required minLength={8} autoComplete="new-password" hint="Mínimo 8 caracteres." />
        <Field label="Confirmar contraseña" name="confirm" type="password" required autoComplete="new-password" />
        <FormError message={error} />
        <PillButton type="submit" size="lg" loading={submitting || status === 'loading'} className="mt-4 w-full">
          Crear cuenta
        </PillButton>
      </form>
    </AuthShell>
  )
}
