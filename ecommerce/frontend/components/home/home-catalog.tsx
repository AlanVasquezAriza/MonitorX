'use client'

import Link from 'next/link'
import { ProductCard, ProductGridSkeleton } from '@/components/shop/product-card'
import { PillLink } from '@/components/ui-kit/pill-button'
import { ErrorNotice } from '@/components/ui-kit/states'
import { getErrorMessage } from '@/lib/api'
import { useCategories, useProducts } from '@/lib/hooks'

export function HomeCatalog() {
  const { products, error, isLoading, mutate } = useProducts()
  const { categories } = useCategories()
  const featured = products.filter((p) => p.isActive).slice(0, 6)

  return (
    <>
      {categories.length > 0 && (
        <section aria-labelledby="categorias" className="bg-white py-14">
          <div className="mx-auto max-w-[1024px] px-6">
            <h2 id="categorias" className="sr-only">
              Categorías
            </h2>
            <ul className="flex snap-x gap-3 overflow-x-auto pb-2 [scrollbar-width:none] md:justify-center">
              {categories.map((category) => (
                <li key={category.id} className="snap-start">
                  <Link
                    href={`/shop?category=${category.id}`}
                    className="flex h-11 items-center rounded-full bg-muted px-5 text-sm text-foreground transition-colors hover:bg-[#e8e8ed]"
                  >
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <section id="destacados" aria-labelledby="destacados-title" className="bg-muted py-20 md:py-28">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="destacados-title" className="text-4xl font-semibold text-foreground md:text-5xl">
              Lo último. <span className="text-muted-foreground">Elige tu favorito.</span>
            </h2>
            <Link href="/shop" className="text-[17px] text-primary hover:underline">
              {'Ver todo ›'}
            </Link>
          </div>
          {error ? (
            <ErrorNotice message={getErrorMessage(error, 'No pudimos cargar los productos.')} onRetry={() => mutate()} />
          ) : isLoading ? (
            <ProductGridSkeleton />
          ) : featured.length === 0 ? (
            <p className="text-center text-[17px] text-muted-foreground">Todavía no hay productos disponibles.</p>
          ) : (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {featured.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="bg-white py-20 md:py-28">
        <div className="mx-auto grid max-w-[1024px] gap-10 px-6 text-center md:grid-cols-3">
          {[
            { title: 'Envío gratuito', text: 'Recibe tu pedido sin coste adicional, directamente en tu puerta.' },
            { title: 'Pago seguro', text: 'Tus datos protegidos en cada paso del proceso de compra.' },
            { title: 'Devoluciones fáciles', text: 'Si no te encanta, lo devuelves. Sin complicaciones.' },
          ].map((item) => (
            <div key={item.title}>
              <h3 className="text-xl font-semibold text-foreground">{item.title}</h3>
              <p className="mt-2 text-pretty text-[17px] leading-relaxed text-muted-foreground">{item.text}</p>
            </div>
          ))}
        </div>
        <div className="mt-14 flex justify-center">
          <PillLink href="/shop" variant="dark" size="lg">
            Explorar la tienda
          </PillLink>
        </div>
      </section>
    </>
  )
}
