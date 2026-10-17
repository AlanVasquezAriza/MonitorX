'use client'

import { ChevronRight, KeyRound, LayoutDashboard, Package } from 'lucide-react'
import Link from 'next/link'
import { useState, type FormEvent, type ReactNode } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { Field, FormError } from '@/components/ui-kit/field'
import { PillButton } from '@/components/ui-kit/pill-button'
import { getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { userService } from '@/lib/services'

export function AccountView() {
  const { user, refreshProfile, logout } = useAuth()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!user) return null

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!user) return
    const form = new FormData(event.currentTarget)
    const value = (key: string) => String(form.get(key) ?? '').trim()
    setError(null)
    setSaving(true)
    try {
      await userService.update(user.id, {
        first_name: value('first_name'),
        last_name: value('last_name'),
        email: value('email'),
        phone: value('phone'),
        address: value('address'),
      })
      await refreshProfile()
      toast.success('Tus datos se han guardado.')
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos guardar los cambios.'))
    } finally {
      setSaving(false)
    }
  }

  const displayName = user.firstName || user.username

  return (
    <div className="bg-muted">
      <div className="mx-auto max-w-[980px] px-6 pb-24 pt-14 md:pt-20">
        <header className="mb-10">
          <h1 className="text-4xl font-semibold text-foreground md:text-5xl">{`Hola, ${displayName}.`}</h1>
          {user.dateJoined && (
            <p className="mt-2 text-[17px] text-muted-foreground">{`Miembro desde ${formatDate(user.dateJoined)}`}</p>
          )}
        </header>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          <section aria-labelledby="perfil" className="rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] md:p-8">
            <h2 id="perfil" className="mb-6 text-xl font-semibold text-foreground">
              Información personal
            </h2>
            <form onSubmit={onSubmit} className="flex flex-col gap-3">
              <div className="grid gap-3 sm:grid-cols-2">
                <Field label="Nombre" name="first_name" defaultValue={user.firstName} autoComplete="given-name" />
                <Field label="Apellidos" name="last_name" defaultValue={user.lastName} autoComplete="family-name" />
              </div>
              <Field label="Correo electrónico" name="email" type="email" defaultValue={user.email} autoComplete="email" />
              <Field label="Teléfono" name="phone" type="tel" defaultValue={user.phone} autoComplete="tel" />
              <Field label="Dirección" name="address" defaultValue={user.address} autoComplete="street-address" />
              <FormError message={error} />
              <PillButton type="submit" loading={saving} className="mt-3 self-start">
                Guardar cambios
              </PillButton>
            </form>
          </section>

          <aside className="flex flex-col gap-6">
            <nav aria-label="Accesos rápidos" className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
              <ul className="divide-y divide-border">
                <QuickLink href="/orders" icon={<Package className="size-5" />} label="Mis pedidos" />
                <QuickLink href="/forgot-password" icon={<KeyRound className="size-5" />} label="Cambiar contraseña" />
                {user.isStaff && (
                  <QuickLink href="/admin" icon={<LayoutDashboard className="size-5" />} label="Panel de administración" />
                )}
              </ul>
            </nav>
            <button type="button" onClick={() => logout()} className="self-center text-[15px] text-primary hover:underline">
              Cerrar sesión
            </button>
          </aside>
        </div>
      </div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string; icon: ReactNode; label: string }) {
  return (
    <li>
      <Link href={href} className="flex items-center gap-4 px-5 py-4 text-[17px] text-foreground transition-colors hover:bg-muted">
        <span className="text-muted-foreground">{icon}</span>
        <span className="flex-1">{label}</span>
        <ChevronRight className="size-4 text-muted-foreground" />
      </Link>
    </li>
  )
}
