'use client'

import { Check, Package, RotateCcw, Truck } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'
import { PillButton } from '@/components/ui-kit/pill-button'
import { ProductImage } from '@/components/ui-kit/product-image'
import { QuantityStepper } from '@/components/ui-kit/quantity-stepper'
import { PageSpinner } from '@/components/ui-kit/spinner'
import { EmptyState } from '@/components/ui-kit/states'
import { PillLink } from '@/components/ui-kit/pill-button'
import { getErrorMessage } from '@/lib/api'
import { formatPrice } from '@/lib/format'
import { useCart, useProduct } from '@/lib/hooks'

export function ProductDetail({ id }: { id: string }) {
  const { product, error, isLoading } = useProduct(id)
  const { status } = useAuth()
  const { add } = useCart()
  const router = useRouter()
  const pathname = usePathname()
  const [quantity, setQuantity] = useState(1)
  const [adding, setAdding] = useState(false)
  const [added, setAdded] = useState(false)

  if (isLoading) return <PageSpinner />
  if (error || !product) {
    return (
      <EmptyState
        icon={<Package />}
        title="Producto no encontrado"
        description={error ? getErrorMessage(error) : 'Es posible que ya no esté disponible.'}
        action={<PillLink href="/shop">Volver a la tienda</PillLink>}
      />
    )
  }

  const soldOut = product.stock !== null && product.stock <= 0

  async function onAdd() {
    if (status !== 'authenticated') {
      router.push(`/login?next=${encodeURIComponent(pathname)}`)
      return
    }
    if (!product) return
    setAdding(true)
    try {
      await add(product.id, quantity)
      setAdded(true)
      toast.success(`${product.name} se añadió a tu bolsa`, {
        action: { label: 'Ver bolsa', onClick: () => router.push('/cart') },
      })
      setTimeout(() => setAdded(false), 2000)
    } catch (err) {
      toast.error(getErrorMessage(err, 'No se pudo añadir a la bolsa.'))
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="bg-white">
      <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-8 md:pt-12">
        <nav aria-label="Ruta de navegación" className="mb-8 text-xs text-muted-foreground">
          <ol className="flex items-center gap-1.5">
            <li>
              <Link href="/shop" className="hover:text-foreground">
                Tienda
              </Link>
            </li>
            {product.categoryName && (
              <>
                <li aria-hidden="true">{'›'}</li>
                <li>
                  <Link href={`/shop?category=${product.categoryId}`} className="hover:text-foreground">
                    {product.categoryName}
                  </Link>
                </li>
              </>
            )}
            <li aria-hidden="true">{'›'}</li>
            <li className="truncate text-foreground" aria-current="page">
              {product.name}
            </li>
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1.2fr_1fr] lg:gap-16">
          <div className="overflow-hidden rounded-3xl bg-muted lg:sticky lg:top-20 lg:self-start">
            <ProductImage src={product.image} alt={product.name} className="aspect-square w-full" />
          </div>

          <div className="flex flex-col">
            {product.categoryName && <p className="text-sm font-semibold text-warning">{product.categoryName}</p>}
            <h1 className="mt-1 text-4xl font-semibold leading-tight text-foreground md:text-5xl">{product.name}</h1>
            <p className="mt-4 text-2xl text-foreground">{formatPrice(product.price)}</p>

            {product.description && (
              <p className="mt-6 whitespace-pre-line text-pretty text-[17px] leading-relaxed text-muted-foreground">
                {product.description}
              </p>
            )}

            <div className="mt-8 border-t border-border pt-8">
              <div className="flex items-center justify-between gap-4">
                <span className="text-[17px] text-foreground">Cantidad</span>
                <QuantityStepper value={quantity} onChange={setQuantity} max={product.stock} disabled={soldOut} />
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                {soldOut
                  ? 'Agotado temporalmente.'
                  : product.stock !== null
                    ? `${product.stock} unidades disponibles.`
                    : 'Disponible.'}
              </p>

              <PillButton size="lg" className="mt-8 w-full" onClick={onAdd} loading={adding} disabled={soldOut}>
                {added ? (
                  <>
                    <Check className="size-5" /> Añadido
                  </>
                ) : soldOut ? (
                  'Agotado'
                ) : (
                  'Añadir a la bolsa'
                )}
              </PillButton>
            </div>

            <ul className="mt-10 flex flex-col gap-5 rounded-3xl bg-muted p-6">
              <Perk icon={<Truck className="size-5" />} title="Envío gratuito" text="Entrega a domicilio en todos los pedidos." />
              <Perk icon={<RotateCcw className="size-5" />} title="Devolución gratuita" text="Tienes 14 días para cambiar de opinión." />
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

function Perk({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <li className="flex gap-4">
      <span className="mt-0.5 text-foreground">{icon}</span>
      <div>
        <p className="text-[15px] font-semibold text-foreground">{title}</p>
        <p className="text-sm text-muted-foreground">{text}</p>
      </div>
    </li>
  )
}
