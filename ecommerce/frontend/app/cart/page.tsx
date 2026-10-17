import type { Metadata } from 'next'
import { CartView } from '@/components/cart/cart-view'
import { RequireAuth } from '@/components/providers/require-auth'

export const metadata: Metadata = { title: 'Bolsa' }

export default function CartPage() {
  return (
    <RequireAuth>
      <CartView />
    </RequireAuth>
  )
}
