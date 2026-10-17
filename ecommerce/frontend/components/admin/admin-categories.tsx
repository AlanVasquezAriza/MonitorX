'use client'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Field, FormError, TextAreaField } from '@/components/ui-kit/field'
import { Modal } from '@/components/ui-kit/modal'
import { PillButton } from '@/components/ui-kit/pill-button'
import { Spinner } from '@/components/ui-kit/spinner'
import { ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { useCategories } from '@/lib/hooks'
import { categoryService } from '@/lib/services'
import type { Category } from '@/lib/types'
import { AdminPanel } from './admin-nav'
import { IconButton } from './admin-products'

export function AdminCategories() {
  const { categories, error, isLoading, mutate } = useCategories()
  const [editing, setEditing] = useState<Category | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const current = editing && editing !== 'new' ? editing : null

  function close() {
    setEditing(null)
    setFormError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const body = {
      name: String(form.get('name')).trim(),
      description: String(form.get('description') ?? '').trim(),
    }
    setSaving(true)
    setFormError(null)
    try {
      if (current) await categoryService.update(current.id, body)
      else await categoryService.create(body)
      await mutate()
      toast.success(current ? 'Categoría actualizada.' : 'Categoría creada.')
      close()
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo guardar la categoría.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(category: Category) {
    if (!window.confirm(`¿Eliminar la categoría “${category.name}”?`)) return
    try {
      await categoryService.remove(category.id)
      await mutate()
      toast.success('Categoría eliminada.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar la categoría.'))
    }
  }

  return (
    <>
      <AdminPanel
        title="Categorías"
        action={
          <PillButton size="sm" onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Nueva
          </PillButton>
        }
      >
        {error ? (
          <div className="p-6">
            <ErrorNotice message={getErrorMessage(error)} onRetry={() => mutate()} />
          </div>
        ) : isLoading ? (
          <div className="flex justify-center p-16">
            <Spinner />
          </div>
        ) : categories.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Todavía no hay categorías.</p>
        ) : (
          <ul className="divide-y divide-border">
            {categories.map((c) => (
              <li key={c.id} className="flex items-center gap-4 px-6 py-4">
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{c.name}</p>
                  {c.description && <p className="truncate text-sm text-muted-foreground">{c.description}</p>}
                </div>
                <IconButton label={`Editar ${c.name}`} onClick={() => setEditing(c)}>
                  <Pencil className="size-4" />
                </IconButton>
                <IconButton label={`Eliminar ${c.name}`} onClick={() => onDelete(c)} danger>
                  <Trash2 className="size-4" />
                </IconButton>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>

      <Modal open={editing !== null} onClose={close} title={current ? 'Editar categoría' : 'Nueva categoría'}>
        <form key={current?.id ?? 'new'} onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label="Nombre" name="name" required defaultValue={current?.name} />
          <TextAreaField label="Descripción" name="description" defaultValue={current?.description} />
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
      </Modal>
    </>
  )
}
