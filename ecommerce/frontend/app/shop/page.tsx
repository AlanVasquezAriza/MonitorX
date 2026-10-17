import type { Metadata } from 'next'
import { ShopCatalog } from '@/components/shop/shop-catalog'

export const metadata: Metadata = { title: 'Tienda' }

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ category?: string; search?: string }> }) {
  const { category, search } = await searchParams
  return <ShopCatalog category={category ?? null} search={search ?? null} />
}
