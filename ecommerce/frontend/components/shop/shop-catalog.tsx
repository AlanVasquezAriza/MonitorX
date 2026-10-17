'use client'

import { Search, X } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'
import { EmptyState, ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { useCategories, useProducts } from '@/lib/hooks'
import { sameId } from '@/lib/normalize'
import { cn } from '@/lib/utils'
import { ProductCard, ProductGridSkeleton } from './product-card'

type Sort = 'featured' | 'price-asc' | 'price-desc' | 'name'

export function ShopCatalog({ category, search }: { category: string | null; search: string | null }) {
  const router = useRouter()
  const [sort, setSort] = useState<Sort>('featured')
  const { products, error, isLoading, mutate } = useProducts({ category, search })
  const { categories } = useCategories()

  const activeCategory = categories.find((c) => sameId(c.id, category))
  const visible = products
    .filter((p) => p.isActive)
    .sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price
      if (sort === 'price-desc') return b.price - a.price
      if (sort === 'name') return a.name.localeCompare(b.name)
      return 0
    })

  function hrefFor(next: { category?: string | null; search?: string | null }) {
    const qs = new URLSearchParams()
    const c = next.category !== undefined ? next.category : category
    const s = next.search !== undefined ? next.search : search
    if (c) qs.set('category', c)
    if (s) qs.set('search', s)
    const query = qs.toString()
    return query ? `/shop?${query}` : '/shop'
  }

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = new FormData(event.currentTarget).get('q')?.toString().trim() || null
    router.push(hrefFor({ search: term }))
  }

  return (
    <div className="bg-muted">
      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-14 md:pt-20">
        <header className="mb-10">
          <h1 className="text-5xl font-semibold text-foreground md:text-6xl">
            {activeCategory?.name ?? 'Tienda.'}
            {!activeCategory && <span className="block text-muted-foreground">La mejor forma de comprar.</span>}
          </h1>
          {activeCategory?.description && (
            <p className="mt-4 max-w-2xl text-pretty text-xl text-muted-foreground">{activeCategory.description}</p>
          )}
        </header>

        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <nav aria-label="Categorías" className="-mx-6 overflow-x-auto px-6 [scrollbar-width:none]">
            <ul className="flex gap-2">
              <li>
                <CategoryChip href={hrefFor({ category: null })} active={!category} label="Todo" />
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <CategoryChip href={hrefFor({ category: String(c.id) })} active={sameId(c.id, category)} label={c.name} />
                </li>
              ))}
            </ul>
          </nav>

          <div className="flex items-center gap-3">
            <form onSubmit={onSearch} role="search" className="relative flex-1 lg:w-64 lg:flex-none">
              <label htmlFor="shop-search" className="sr-only">
                Buscar productos
              </label>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <input
                key={search ?? ''}
                id="shop-search"
                name="q"
                type="search"
                defaultValue={search ?? ''}
                placeholder="Buscar"
                className="h-10 w-full rounded-full border border-transparent bg-white pl-10 pr-4 text-[15px] outline-none transition-shadow focus:border-primary focus:ring-4 focus:ring-primary/15"
              />
            </form>
            <label htmlFor="shop-sort" className="sr-only">
              Ordenar por
            </label>
            <select
              id="shop-sort"
              value={sort}
              onChange={(e) => setSort(e.target.value as Sort)}
              className="h-10 rounded-full border border-transparent bg-white px-4 text-[15px] text-foreground outline-none focus:border-primary focus:ring-4 focus:ring-primary/15"
            >
              <option value="featured">Destacados</option>
              <option value="price-asc">Precio: menor a mayor</option>
              <option value="price-desc">Precio: mayor a menor</option>
              <option value="name">Nombre</option>
            </select>
          </div>
        </div>

        {search && (
          <div className="mb-6 flex items-center gap-2 text-[15px] text-muted-foreground">
            <span>
              {'Resultados para '}
              <span className="text-foreground">{`“${search}”`}</span>
            </span>
            <Link href={hrefFor({ search: null })} aria-label="Quitar búsqueda" className="rounded-full p-1 hover:bg-white">
              <X className="size-4" />
            </Link>
          </div>
        )}

        {error ? (
          <ErrorNotice message={getErrorMessage(error, 'No pudimos cargar los productos.')} onRetry={() => mutate()} />
        ) : isLoading ? (
          <ProductGridSkeleton />
        ) : visible.length === 0 ? (
          <EmptyState
            icon={<Search />}
            title="Sin resultados"
            description="Prueba con otra búsqueda o explora otra categoría."
            action={
              <Link href="/shop" className="text-[17px] text-primary hover:underline">
                {'Ver todos los productos ›'}
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visible.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function CategoryChip({ href, active, label }: { href: string; active: boolean; label: string }) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'flex h-10 items-center whitespace-nowrap rounded-full px-4 text-[15px] transition-colors',
        active ? 'bg-foreground text-background' : 'bg-white text-foreground hover:bg-white/70',
      )}
    >
      {label}
    </Link>
  )
}
