'use client'

import { ShoppingBag } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { PillLink } from '@/components/ui-kit/pill-button'
import { ProductImage } from '@/components/ui-kit/product-image'
import { QuantityStepper } from '@/components/ui-kit/quantity-stepper'
import { PageSpinner } from '@/components/ui-kit/spinner'
import { EmptyState, ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useCart } from '@/lib/hooks'
import type { CartItem } from '@/lib/types'

export function CartView() {
  const { cart, error, isLoading, update, remove, mutate } = useCart()

  if (isLoading && !cart) return <PageSpinner />
  if (error) {
    return (
      <div className="px-6 py-20">
        <ErrorNotice message={getErrorMessage(error, 'No pudimos cargar tu bolsa.')} onRetry={() => mutate()} />
      </div>
    )
  }

  if (!cart || cart.items.length === 0) {
    return (
      <EmptyState
        icon={<ShoppingBag />}
        title="Tu bolsa está vacía."
        description="Explora la tienda y encuentra algo que te encante."
        action={<PillLink href="/shop">Seguir comprando</PillLink>}
      />
    )
  }

  async function onQuantity(item: CartItem, quantity: number) {
    try {
      await update(item.id, quantity)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo actualizar la cantidad.'))
    }
  }

  async function onRemove(item: CartItem) {
    try {
      await remove(item.id)
      toast(`${item.name} se eliminó de tu bolsa`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo eliminar el artículo.'))
    }
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 pb-24 pt-14 md:pt-20">
      <header className="border-b border-border pb-10 text-center">
        <h1 className="text-4xl font-semibold text-foreground md:text-5xl">{`El total de tu bolsa es ${formatPrice(cart.total)}.`}</h1>
        <p className="mt-3 text-[17px] text-muted-foreground">Envío gratuito en todos los pedidos.</p>
        <PillLink href="/checkout" size="lg" className="mt-8 min-w-60">
          Pagar
        </PillLink>
      </header>

      <ul className="divide-y divide-border">
        {cart.items.map((item) => (
          <li key={item.id} className="flex flex-col gap-6 py-10 sm:flex-row">
            <Link
              href={item.productId ? `/product/${item.productId}` : '#'}
              className="shrink-0 overflow-hidden rounded-2xl bg-muted"
            >
              <ProductImage src={item.image} alt={item.name} className="size-32 sm:size-40" />
            </Link>
            <div className="flex flex-1 flex-col gap-4 sm:flex-row sm:justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-foreground">{item.name}</h2>
                <p className="mt-1 text-[15px] text-muted-foreground">{`${formatPrice(item.price)} c/u`}</p>
              </div>
              <div className="flex items-start gap-6 sm:flex-col sm:items-end">
                <QuantityStepper value={item.quantity} max={item.stock} onChange={(q) => onQuantity(item, q)} />
                <div className="flex flex-col items-end">
                  <span className="text-xl font-semibold text-foreground">{formatPrice(item.subtotal)}</span>
                  <button
                    type="button"
                    onClick={() => onRemove(item)}
                    className="mt-1 text-[15px] text-primary hover:underline"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <section aria-label="Resumen" className="border-t border-border pt-8 sm:ml-auto sm:max-w-md">
        <dl className="flex flex-col gap-3 text-[17px]">
          <div className="flex justify-between">
            <dt className="text-foreground">Subtotal</dt>
            <dd className="text-foreground">{formatPrice(cart.total)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-foreground">Envío</dt>
            <dd className="text-foreground">GRATIS</dd>
          </div>
          <div className="mt-3 flex justify-between border-t border-border pt-5 text-2xl font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(cart.total)}</dd>
          </div>
        </dl>
        <PillLink href="/checkout" size="lg" className="mt-8 w-full">
          Pagar
        </PillLink>
      </section>
    </div>
  )
}
