import { ProductDetail } from '@/components/shop/product-detail'

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <ProductDetail id={id} />
}
