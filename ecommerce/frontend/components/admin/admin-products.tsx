'use client'

import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { Field, FormError, SelectField, TextAreaField } from '@/components/ui-kit/field'
import { Modal } from '@/components/ui-kit/modal'
import { PillButton } from '@/components/ui-kit/pill-button'
import { ProductImage } from '@/components/ui-kit/product-image'
import { Spinner } from '@/components/ui-kit/spinner'
import { Badge, ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useCategories, useProducts } from '@/lib/hooks'
import { productService } from '@/lib/services'
import type { Product } from '@/lib/types'
import { AdminPanel } from './admin-nav'

export function AdminProducts() {
  const { products, error, isLoading, mutate } = useProducts()
  const { categories } = useCategories()
  const [editing, setEditing] = useState<Product | 'new' | null>(null)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  function close() {
    setEditing(null)
    setFormError(null)
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const image = form.get('image')
    const hasImage = image instanceof File && image.size > 0

    const category = String(form.get('category') ?? '').trim()
    const fields: Record<string, any> = {
      name: String(form.get('name')).trim(),
      description: String(form.get('description') ?? '').trim(),
      price: String(form.get('price')),
      stock: String(form.get('stock')),
      is_active: form.get('is_active') === 'on',
      category: category ? category : null,
    }

    let body: FormData | Record<string, unknown> = fields
    if (hasImage) {
      body = new FormData()
      for (const [key, value] of Object.entries(fields)) {
        if (value !== null && value !== undefined) {
          body.append(key, String(value))
        }
      }
      body.append('image', image)
    }

    setSaving(true)
    setFormError(null)
    try {
      if (editing === 'new') await productService.create(body)
      else if (editing) await productService.update(editing.id, body)
      await mutate()
      toast.success(editing === 'new' ? 'Producto creado.' : 'Producto actualizado.')
      close()
    } catch (err) {
      setFormError(getErrorMessage(err, 'No se pudo guardar el producto.'))
    } finally {
      setSaving(false)
    }
  }

  async function onDelete(product: Product) {
    if (!window.confirm(`¿Eliminar “${product.name}”? Esta acción no se puede deshacer.`)) return
    try {
      await productService.remove(product.id)
      await mutate()
      toast.success('Producto eliminado.')
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar el producto.'))
    }
  }

  const current = editing && editing !== 'new' ? editing : null

  return (
    <>
      <AdminPanel
        title={`Productos${products.length ? ` (${products.length})` : ''}`}
        action={
          <PillButton size="sm" onClick={() => setEditing('new')}>
            <Plus className="size-4" /> Nuevo
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
        ) : products.length === 0 ? (
          <p className="p-10 text-center text-muted-foreground">Todavía no hay productos.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-[15px]">
              <thead className="text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="px-6 py-3 font-medium">Producto</th>
                  <th className="px-6 py-3 font-medium">Categoría</th>
                  <th className="px-6 py-3 font-medium">Precio</th>
                  <th className="px-6 py-3 font-medium">Stock</th>
                  <th className="px-6 py-3 font-medium">
                    <span className="sr-only">Acciones</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <ProductImage src={p.image} alt="" className="size-11 shrink-0 rounded-xl bg-muted" />
                        <div className="min-w-0">
                          <p className="truncate font-medium text-foreground">{p.name}</p>
                          {!p.isActive && <Badge>Oculto</Badge>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{p.categoryName ?? '—'}</td>
                    <td className="px-6 py-3">{formatPrice(p.price)}</td>
                    <td className="px-6 py-3">
                      {p.stock === null ? '—' : p.stock <= 0 ? <Badge tone="red">Agotado</Badge> : p.stock}
                    </td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-1">
                        <IconButton label={`Editar ${p.name}`} onClick={() => setEditing(p)}>
                          <Pencil className="size-4" />
                        </IconButton>
                        <IconButton label={`Eliminar ${p.name}`} onClick={() => onDelete(p)} danger>
                          <Trash2 className="size-4" />
                        </IconButton>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>

      <Modal open={editing !== null} onClose={close} title={current ? 'Editar producto' : 'Nuevo producto'}>
        <form key={current?.id ?? 'new'} onSubmit={onSubmit} className="flex flex-col gap-3">
          <Field label="Nombre" name="name" required defaultValue={current?.name} />
          <TextAreaField label="Descripción" name="description" defaultValue={current?.description} />
          <div className="grid grid-cols-2 gap-3">
            <Field label="Precio" name="price" type="number" step="0.01" min="0" required defaultValue={current?.price} />
            <Field label="Stock" name="stock" type="number" step="1" min="0" required defaultValue={current?.stock ?? 0} />
          </div>
          <SelectField label="Categoría" name="category" defaultValue={current?.categoryId ? String(current.categoryId) : ''}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>
                {c.name}
              </option>
            ))}
          </SelectField>
          <label className="flex flex-col gap-2 rounded-xl border border-border px-4 py-3 text-sm text-muted-foreground">
            Imagen {current?.image ? '(deja vacío para mantener la actual)' : ''}
            <input type="file" name="image" accept="image/*" className="text-sm text-foreground file:mr-3 file:rounded-full file:border-0 file:bg-muted file:px-4 file:py-1.5 file:text-sm" />
          </label>
          <label className="flex items-center gap-3 py-2 text-[15px] text-foreground">
            <input type="checkbox" name="is_active" defaultChecked={current?.isActive ?? true} className="size-5 accent-primary" />
            Visible en la tienda
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
      </Modal>
    </>
  )
}

export function IconButton({
  label,
  onClick,
  danger,
  children,
}: {
  label: string
  onClick: () => void
  danger?: boolean
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={
        danger
          ? 'flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive'
          : 'flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground'
      }
    >
      {children}
    </button>
  )
}
