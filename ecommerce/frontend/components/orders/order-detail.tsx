'use client'

import { CircleCheck, Package } from 'lucide-react'
import Link from 'next/link'
import { PillLink } from '@/components/ui-kit/pill-button'
import { ProductImage } from '@/components/ui-kit/product-image'
import { PageSpinner } from '@/components/ui-kit/spinner'
import { Badge, EmptyState } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatDate, formatPrice, orderStatus } from '@/lib/format'
import { useOrder } from '@/lib/hooks'

export function OrderDetail({ id, justPlaced }: { id: string; justPlaced: boolean }) {
  const { order, error, isLoading } = useOrder(id)

  if (isLoading) return <PageSpinner />
  if (error || !order) {
    return (
      <EmptyState
        icon={<Package />}
        title="Pedido no encontrado"
        description={error ? getErrorMessage(error) : undefined}
        action={<PillLink href="/orders">Ver mis pedidos</PillLink>}
      />
    )
  }

  const status = orderStatus(order.status)

  return (
    <div className="mx-auto max-w-[820px] px-6 pb-24 pt-14 md:pt-20">
      {justPlaced && (
        <div className="mb-12 text-center">
          <CircleCheck className="mx-auto size-14 stroke-[1.25] text-success" aria-hidden="true" />
          <h1 className="mt-4 text-4xl font-semibold text-foreground md:text-5xl">Gracias por tu pedido.</h1>
          <p className="mt-3 text-[17px] text-muted-foreground">Te avisaremos cuando esté en camino.</p>
        </div>
      )}

      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-6">
        <div>
          <Link href="/orders" className="text-[15px] text-primary hover:underline">
            {'‹ Mis pedidos'}
          </Link>
          {justPlaced ? (
            <h2 className="mt-2 text-2xl font-semibold text-foreground">{`Pedido #${order.id}`}</h2>
          ) : (
            <h1 className="mt-2 text-3xl font-semibold text-foreground md:text-4xl">{`Pedido #${order.id}`}</h1>
          )}
          <p className="mt-1 text-[15px] text-muted-foreground">{formatDate(order.createdAt)}</p>
        </div>
        <Badge tone={status.tone}>{status.label}</Badge>
      </div>

      <ul className="divide-y divide-border">
        {order.items.map((item) => (
          <li key={item.id} className="flex items-center gap-5 py-6">
            <ProductImage src={item.image} alt={item.name} className="size-20 shrink-0 rounded-2xl bg-muted" />
            <div className="min-w-0 flex-1">
              <p className="text-[17px] font-semibold text-foreground">{item.name}</p>
              <p className="text-sm text-muted-foreground">{`${item.quantity} × ${formatPrice(item.price)}`}</p>
            </div>
            <span className="text-[17px] text-foreground">{formatPrice(item.subtotal)}</span>
          </li>
        ))}
      </ul>

      <div className="grid gap-8 border-t border-border pt-8 md:grid-cols-2">
        {order.shippingAddress && (
          <div>
            <h3 className="text-[15px] font-semibold text-foreground">Envío a</h3>
            <p className="mt-2 whitespace-pre-line text-[15px] leading-relaxed text-muted-foreground">{order.shippingAddress}</p>
          </div>
        )}
        <dl className="flex flex-col gap-2 text-[15px] md:col-start-2">
          <div className="flex justify-between">
            <dt className="text-muted-foreground">Envío</dt>
            <dd>GRATIS</dd>
          </div>
          <div className="flex justify-between border-t border-border pt-3 text-xl font-semibold">
            <dt>Total</dt>
            <dd>{formatPrice(order.total)}</dd>
          </div>
        </dl>
      </div>

      {justPlaced && (
        <div className="mt-14 flex justify-center">
          <PillLink href="/shop" variant="secondary" size="lg">
            Seguir comprando
          </PillLink>
        </div>
      )}
    </div>
  )
}
