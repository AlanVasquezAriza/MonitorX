'use client'

import Link from 'next/link'
import { toast } from 'sonner'
import { Spinner } from '@/components/ui-kit/spinner'
import { ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { formatDate, formatPrice, ORDER_STATUSES, orderStatus } from '@/lib/format'
import { useOrders } from '@/lib/hooks'
import { orderService } from '@/lib/services'
import type { Order } from '@/lib/types'
import { AdminPanel } from './admin-nav'

export function AdminOrders() {
  const { orders, error, isLoading, mutate } = useOrders()

  async function onStatus(order: Order, status: string) {
    try {
      await orderService.updateStatus(order.id, status)
      await mutate()
      toast.success(`Pedido #${order.id}: ${orderStatus(status).label}`)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo actualizar el estado.'))
    }
  }

  return (
    <AdminPanel title={`Pedidos${orders.length ? ` (${orders.length})` : ''}`}>
      {error ? (
        <div className="p-6">
          <ErrorNotice message={getErrorMessage(error)} onRetry={() => mutate()} />
        </div>
      ) : isLoading ? (
        <div className="flex justify-center p-16">
          <Spinner />
        </div>
      ) : orders.length === 0 ? (
        <p className="p-10 text-center text-muted-foreground">No hay pedidos todavía.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] text-left text-[15px]">
            <thead className="text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-6 py-3 font-medium">Pedido</th>
                <th className="px-6 py-3 font-medium">Cliente</th>
                <th className="px-6 py-3 font-medium">Fecha</th>
                <th className="px-6 py-3 font-medium">Total</th>
                <th className="px-6 py-3 font-medium">Estado</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((order) => {
                const known = ORDER_STATUSES.includes(order.status.toLowerCase())
                return (
                  <tr key={order.id}>
                    <td className="px-6 py-3">
                      <Link href={`/orders/${order.id}`} className="font-medium text-primary hover:underline">
                        {`#${order.id}`}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-muted-foreground">{order.customer ?? '—'}</td>
                    <td className="px-6 py-3 text-muted-foreground">{formatDate(order.createdAt)}</td>
                    <td className="px-6 py-3">{formatPrice(order.total)}</td>
                    <td className="px-6 py-3">
                      <label className="sr-only" htmlFor={`status-${order.id}`}>
                        {`Estado del pedido ${order.id}`}
                      </label>
                      <select
                        id={`status-${order.id}`}
                        value={order.status.toLowerCase()}
                        onChange={(e) => onStatus(order, e.target.value)}
                        className="h-9 rounded-full bg-muted px-3 text-sm text-foreground outline-none focus:ring-4 focus:ring-primary/15"
                      >
                        {!known && <option value={order.status.toLowerCase()}>{orderStatus(order.status).label}</option>}
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {orderStatus(s).label}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </AdminPanel>
  )
}
