import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ProductCard, ProductGridSkeleton } from '@/components/shop/product-card'
import type { Product } from '@/lib/types'

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

function buildProduct(overrides: Partial<Product> = {}): Product {
  return {
    id: 7,
    name: 'Laptop Pro',
    slug: 'laptop-pro',
    description: 'Potente y ligero.',
    price: 1299,
    stock: 12,
    image: null,
    categoryName: 'Electrónica',
    isActive: true,
    ...overrides,
  } as Product
}

describe('ProductCard', () => {
  it('muestra el nombre del producto', () => {
    render(<ProductCard product={buildProduct()} />)
    expect(screen.getByRole('heading', { name: 'Laptop Pro' })).toBeInTheDocument()
  })

  it('enlaza al detalle del producto', () => {
    render(<ProductCard product={buildProduct()} />)
    expect(screen.getByRole('link')).toHaveAttribute('href', '/product/7')
  })

  it('muestra la categoría cuando hay stock', () => {
    render(<ProductCard product={buildProduct({ stock: 12 })} />)
    expect(screen.getByText('Electrónica')).toBeInTheDocument()
  })

  it('muestra Agotado cuando no hay stock', () => {
    render(<ProductCard product={buildProduct({ stock: 0 })} />)
    expect(screen.getByText('Agotado')).toBeInTheDocument()
  })

  it('muestra el aviso de últimas unidades con stock bajo', () => {
    render(<ProductCard product={buildProduct({ stock: 3 })} />)
    expect(screen.getByText('Quedan 3')).toBeInTheDocument()
  })

  it('muestra el precio formateado', () => {
    render(<ProductCard product={buildProduct({ price: 1299 })} />)
    expect(screen.getByText(/1\.299|1299/)).toBeInTheDocument()
  })

  it('omite la descripción cuando está vacía', () => {
    render(<ProductCard product={buildProduct({ description: '' })} />)
    expect(screen.queryByText('Potente y ligero.')).not.toBeInTheDocument()
  })

  it('no muestra Agotado cuando el stock es null', () => {
    render(<ProductCard product={buildProduct({ stock: null })} />)
    expect(screen.queryByText('Agotado')).not.toBeInTheDocument()
  })
})

describe('ProductGridSkeleton', () => {
  it('renderiza 6 placeholders por defecto', () => {
    const { container } = render(<ProductGridSkeleton />)
    expect(container.querySelectorAll('.animate-pulse').length).toBeGreaterThan(0)
  })

  it('acepta un count personalizado', () => {
    const { container } = render(<ProductGridSkeleton count={3} />)
    expect(container.querySelectorAll('.rounded-3xl')).toHaveLength(3)
  })

  it('está oculto para lectores de pantalla', () => {
    const { container } = render(<ProductGridSkeleton />)
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true')
  })
})