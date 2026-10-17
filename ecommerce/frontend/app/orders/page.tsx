import type { Metadata } from 'next'
import { OrdersList } from '@/components/orders/orders-list'
import { RequireAuth } from '@/components/providers/require-auth'

export const metadata: Metadata = { title: 'Mis pedidos' }

export default function OrdersPage() {
  return (
    <RequireAuth>
      <OrdersList />
    </RequireAuth>
  )
}
