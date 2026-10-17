'use client'

import { ChevronRight, Package } from 'lucide-react'
import Link from 'next/link'
import { PillLink } from '@/components/ui-kit/pill-button'
import { ProductImage } from '@/components/ui-kit/product-image'
import { PageSpinner } from '@/components/ui-kit/spinner'
import { Badge, EmptyState, ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatDate, formatPrice, orderStatus } from '@/lib/format'
import { useOrders } from '@/lib/hooks'

export function OrdersList() {
  const { orders, error, isLoading, mutate } = useOrders()

  if (isLoading) return <PageSpinner />

  return (
    <div className="bg-muted">
      <div className="mx-auto max-w-[980px] px-6 pb-24 pt-14 md:pt-20">
        <h1 className="mb-10 text-4xl font-semibold text-foreground md:text-5xl">Tus pedidos.</h1>
        {error ? (
          <ErrorNotice message={getErrorMessage(error, 'No pudimos cargar tus pedidos.')} onRetry={() => mutate()} />
        ) : orders.length === 0 ? (
          <div className="rounded-3xl bg-white">
            <EmptyState
              icon={<Package />}
              title="Aún no tienes pedidos."
              description="Cuando realices tu primera compra, la verás aquí."
              action={<PillLink href="/shop">Empezar a comprar</PillLink>}
            />
          </div>
        ) : (
          <ul className="flex flex-col gap-4">
            {orders.map((order) => {
              const status = orderStatus(order.status)
              return (
                <li key={order.id}>
                  <Link
                    href={`/orders/${order.id}`}
                    className="group flex items-center gap-5 rounded-3xl bg-white p-5 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.1)] md:p-6"
                  >
                    <div className="hidden -space-x-4 sm:flex">
                      {order.items.slice(0, 3).map((item) => (
                        <ProductImage
                          key={item.id}
                          src={item.image}
                          alt=""
                          className="size-16 rounded-2xl border-2 border-white bg-muted"
                        />
                      ))}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-lg font-semibold text-foreground">{`Pedido #${order.id}`}</span>
                        <Badge tone={status.tone}>{status.label}</Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {`${formatDate(order.createdAt)} · ${order.items.length} ${order.items.length === 1 ? 'artículo' : 'artículos'}`}
                      </p>
                    </div>
                    <span className="text-lg font-semibold text-foreground">{formatPrice(order.total)}</span>
                    <ChevronRight className="size-5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
