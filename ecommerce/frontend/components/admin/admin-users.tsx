'use client'

import { Pencil } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { Field, FormError } from '@/components/ui-kit/field'
import { Modal } from '@/components/ui-kit/modal'
import { PillButton } from '@/components/ui-kit/pill-button'
import { Spinner } from '@/components/ui-kit/spinner'
import { Badge, ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatDate } from '@/lib/format'
import { useUsers } from '@/lib/hooks'
import { sameId } from '@/lib/normalize'
import { userService } from '@/lib/services'
import type { User } from '@/lib/types'
import { AdminPanel } from './admin-nav'
import { IconButton } from './admin-products'

export function AdminUsers() {
  const { user: me } = useAuth()
  const { users, error, isLoading, mutate } = useUsers()
  const [editing, setEditing] = useState<User | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function close() {
    setEditing(null)
    setFormError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!editing) return
    const form = new FormData(event.currentTarget)
    const value = (key: string) => String(form.get(key) ?? '').trim()
    setSaving(true)
    setFormError(null)
    try {
      await userService.update(editing.id, {
        first_name: value('first_name'),
        last_name: value('last_name'),
        email: value('email'),
        is_staff: form.get('is_staff') === 'on',
      })
      await mutate()
      toast.success('Usuario actualizado.')
      close()
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo actualizar el usuario.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <AdminPanel title={`Usuarios${users.length ? ` (${users.length})` : ''}`}>
        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} onRetry={() => mutate()} />
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-16">
            <Spinner />
          </div>
        ) : users.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">No hay usuarios.</p>
        ) : (
          <ul className="divide-y divide-border">
            {users.map((u) => {
              const name = [u.firstName, u.lastName].filter(Boolean).join(' ') || u.username
              return (
                <li key={u.id} className="flex items-center gap-4 px-6 py-4">
                  <span
                    aria-hidden="true"
                    className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-sm font-semibold uppercase text-muted-foreground"
                  >
                    {name.slice(0, 1)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{name}</p>
                      {u.isStaff && <Badge tone="blue">Admin</Badge>}
                      {sameId(u.id, me?.id) && <Badge>Tú</Badge>}
                    </div>
                    <p className="truncate text-sm text-muted-foreground">
                      {[u.email, u.dateJoined ? `desde ${formatDate(u.dateJoined)}` : null].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                  <IconButton label={`Editar ${name}`} onClick={() => setEditing(u)}>
                    <Pencil className="size-4" />
                  </IconButton>
                </li>
              )
            })}
          </ul>
        )}
      </AdminPanel>

      <Modal open={editing !== null} onClose={close} title="Editar usuario">
        {editing && (
          <form key={editing.id} onSubmit={onSubmit} className="flex flex-col gap-3">
            <p className="mb-2 text-sm text-muted-foreground">{`@${editing.username}`}</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nombre" name="first_name" defaultValue={editing.firstName} />
              <Field label="Apellidos" name="last_name" defaultValue={editing.lastName} />
            </div>
            <Field label="Correo electrónico" name="email" type="email" defaultValue={editing.email} />
            <label className="flex items-center gap-3 py-2 text-[15px] text-foreground">
              <input
                type="checkbox"
                name="is_staff"
                defaultChecked={editing.isStaff}
                disabled={sameId(editing.id, me?.id)}
                className="size-5 accent-primary"
              />
              Administrador
            </label>
            <FormError message={formError} />
            <div className="mt-3 flex justify-end gap-3">
              <PillButton variant="secondary" onClick={close}>
                Cancelar
              </PillButton>
              <PillButton type="submit" loading={saving}>
                Guardar
              </PillButton>
            </div>
          </form>
        )}
      </Modal>
    </>
  )
}
