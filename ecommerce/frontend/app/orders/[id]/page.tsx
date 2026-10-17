import { OrderDetail } from '@/components/orders/order-detail'
import { RequireAuth } from '@/components/providers/require-auth'

export default async function OrderPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ placed?: string }>
}) {
  const [{ id }, { placed }] = await Promise.all([params, searchParams])
  return (
    <RequireAuth>
      <OrderDetail id={id} justPlaced={placed === '1'} />
    </RequireAuth>
  )
}
