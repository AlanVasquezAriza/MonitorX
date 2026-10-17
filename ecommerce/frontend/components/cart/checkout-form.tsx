'use client'

import { Lock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { Field, FormError, TextAreaField } from '@/components/ui-kit/field'
import { PillButton, PillLink } from '@/components/ui-kit/pill-button'
import { ProductImage } from '@/components/ui-kit/product-image'
import { PageSpinner } from '@/components/ui-kit/spinner'
import { EmptyState } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/lib/hooks'
import { orderService } from '@/lib/services'

export function CheckoutForm() {
  const { user } = useAuth()
  const { cart, isLoading, mutate } = useCart()
  const router = useRouter()
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (isLoading && !cart) return <PageSpinner />
  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        title="No hay nada que pagar."
        description="Añade productos a tu bolsa para continuar."
        action={<PillLink href="/shop">Ir a la tienda</PillLink>}
      />
    )
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const value = (key: string) => form.get(key)?.toString().trim() ?? ''
    setError(null)
    setSubmitting(true)
    try {
      const order = await orderService.create({
        full_name: value('full_name'),
        phone: value('phone'),
        address: value('address'),
        city: value('city'),
        postal_code: value('postal_code'),
        notes: value('notes') || undefined,
      })
      await mutate()
      toast.success('¡Gracias! Tu pedido se ha realizado.')
      router.push(`/orders/${order.id}?placed=1`)
    } catch (err) {
      setError(getErrorMessage(err, 'No pudimos procesar tu pedido.'))
      setSubmitting(false)
    }
  }

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ')

  return (
    <div className="bg-muted">
      <div className="mx-auto grid max-w-[1100px] gap-10 px-6 pb-24 pt-14 md:pt-20 lg:grid-cols-[1fr_380px]">
        <form onSubmit={onSubmit} className="flex flex-col gap-10">
          <header>
            <h1 className="text-4xl font-semibold text-foreground md:text-5xl">{'¿Dónde enviamos tu pedido?'}</h1>
            <p className="mt-3 text-[17px] text-muted-foreground">Introduce tus datos de envío.</p>
          </header>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-4 text-xl font-semibold text-foreground">Datos de contacto</legend>
            <Field label="Nombre completo" name="full_name" required autoComplete="name" defaultValue={fullName} />
            <Field label="Teléfono" name="phone" type="tel" required autoComplete="tel" defaultValue={user?.phone} />
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-4 text-xl font-semibold text-foreground">Dirección de envío</legend>
            <Field label="Dirección" name="address" required autoComplete="street-address" defaultValue={user?.address} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Ciudad" name="city" required autoComplete="address-level2" />
              <Field label="Código postal" name="postal_code" required autoComplete="postal-code" />
            </div>
            <TextAreaField label="Notas para la entrega (opcional)" name="notes" />
          </fieldset>

          <FormError message={error} />

          <div className="flex flex-col gap-3">
            <PillButton type="submit" size="lg" loading={submitting} className="w-full sm:w-auto sm:self-start sm:min-w-72">
              Realizar pedido
            </PillButton>
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="size-3.5" aria-hidden="true" />
              Tus datos se envían de forma segura.
            </p>
          </div>
        </form>

        <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-20 lg:self-start">
          <div className="rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
            <h2 className="text-xl font-semibold text-foreground">Resumen</h2>
            <ul className="mt-5 flex flex-col gap-4">
              {cart.items.map((item) => (
                <li key={item.id} className="flex items-center gap-4">
                  <div className="relative shrink-0">
                    <ProductImage src={item.image} alt={item.name} className="size-14 rounded-xl" />
                    <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-foreground text-[11px] text-background tabular-nums">
                      {item.quantity}
                    </span>
                  </div>
                  <span className="flex-1 truncate text-[15px] text-foreground">{item.name}</span>
                  <span className="text-[15px] text-foreground">{formatPrice(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <dl className="mt-6 flex flex-col gap-2 border-t border-border pt-5 text-[15px]">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Subtotal</dt>
                <dd>{formatPrice(cart.total)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted-foreground">Envío</dt>
                <dd>GRATIS</dd>
              </div>
              <div className="mt-2 flex justify-between border-t border-border pt-4 text-xl font-semibold">
                <dt>Total</dt>
                <dd>{formatPrice(cart.total)}</dd>
              </div>
            </dl>
          </div>
        </aside>
      </div>
    </div>
  )
}
