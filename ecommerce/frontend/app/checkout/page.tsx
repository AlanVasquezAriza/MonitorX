import type { Metadata } from 'next'
import { CheckoutForm } from '@/components/cart/checkout-form'
import { RequireAuth } from '@/components/providers/require-auth'

export const metadata: Metadata = { title: 'Pagar' }

export default function CheckoutPage() {
  return (
    <RequireAuth>
      <CheckoutForm />
    </RequireAuth>
  )
}
