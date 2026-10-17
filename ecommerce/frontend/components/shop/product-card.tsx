import Link from 'next/link'
import { ProductImage } from '@/components/ui-kit/product-image'
import { formatPrice } from '@/lib/format'
import type { Product } from '@/lib/types'

export function ProductCard({ product }: { product: Product }) {
  const soldOut = product.stock !== null && product.stock <= 0
  return (
    <Link
      href={`/product/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_40px_rgba(0,0,0,0.1)] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30"
    >
      <div className="flex min-h-5 items-center">
        {soldOut ? (
          <span className="text-xs font-medium text-muted-foreground">Agotado</span>
        ) : product.stock !== null && product.stock <= 5 ? (
          <span className="text-xs font-medium text-warning">{`Quedan ${product.stock}`}</span>
        ) : product.categoryName ? (
          <span className="text-xs font-medium text-muted-foreground">{product.categoryName}</span>
        ) : null}
      </div>
      <div className="relative my-4 aspect-square overflow-hidden rounded-2xl bg-muted">
        <ProductImage
          src={product.image}
          alt={product.name}
          className="size-full transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>
      <h3 className="text-pretty text-lg font-semibold leading-snug text-foreground">{product.name}</h3>
      {product.description && (
        <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{product.description}</p>
      )}
      <div className="mt-auto flex items-center justify-between pt-5">
        <span className="text-[15px] text-foreground">{formatPrice(product.price)}</span>
        <span className="rounded-full bg-primary px-4 py-1.5 text-sm text-primary-foreground transition-colors group-hover:bg-[#0077ed]">
          Comprar
        </span>
      </div>
    </Link>
  )
}

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-3xl bg-white p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
          <div className="h-4 w-16 animate-pulse rounded bg-muted" />
          <div className="my-4 aspect-square animate-pulse rounded-2xl bg-muted" />
          <div className="h-5 w-3/4 animate-pulse rounded bg-muted" />
          <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}
