import { beforeEach, describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

const mockUseCart = vi.fn()
const mockUpdate = vi.fn()
const mockRemove = vi.fn()
const mockMutate = vi.fn()
const toastMock = vi.hoisted(() => ({
  error: vi.fn(),
  success: vi.fn(),
}))
const toasterMock = vi.hoisted(() => vi.fn())

vi.mock('@/lib/hooks', () => ({
  useCart: () => mockUseCart(),
}))
vi.mock('sonner', () => ({
  toast: Object.assign(toasterMock, toastMock),
}))
vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  ),
}))

import { CartView } from '@/components/cart/cart-view'
import type { Cart, CartItem } from '@/lib/types'

function buildItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 1,
    productId: 10,
    name: 'Laptop',
    price: 999.99,
    quantity: 2,
    subtotal: 1999.98,
    image: null,
    stock: 10,
    ...overrides,
  } as CartItem
}

function buildCart(overrides: Partial<Cart> = {}): Cart {
  return {
    id: 1,
    items: [buildItem()],
    total: 1999.98,
    count: 2,
    ...overrides,
  } as Cart
}

beforeEach(() => {
  vi.clearAllMocks()
  mockUpdate.mockResolvedValue(undefined)
  mockRemove.mockResolvedValue(undefined)
  mockMutate.mockResolvedValue(undefined)
})

describe('CartView — estados', () => {
  it('muestra spinner mientras carga y no hay carrito', () => {
    mockUseCart.mockReturnValue({
      cart: null, error: null, isLoading: true,
      update: mockUpdate, remove: mockRemove, mutate: mockMutate,
    })
    const { container } = render(<CartView />)
    expect(container.querySelector('.animate-spin')).toBeInTheDocument()
  })

  it('muestra ErrorNotice cuando hay error', () => {
    mockUseCart.mockReturnValue({
      cart: null, error: new Error('boom'), isLoading: false,
      update: mockUpdate, remove: mockRemove, mutate: mockMutate,
    })
    render(<CartView />)
    expect(screen.getByRole('button', { name: 'Reintentar' })).toBeInTheDocument()
  })

  it('reintenta al pulsar Reintentar', async () => {
    mockUseCart.mockReturnValue({
      cart: null, error: new Error('boom'), isLoading: false,
      update: mockUpdate, remove: mockRemove, mutate: mockMutate,
    })
    const user = userEvent.setup({ delay: null })
    render(<CartView />)

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(mockMutate).toHaveBeenCalled()
  })

  it('muestra EmptyState cuando el carrito no existe', () => {
    mockUseCart.mockReturnValue({
      cart: null, error: null, isLoading: false,
      update: mockUpdate, remove: mockRemove, mutate: mockMutate,
    })
    render(<CartView />)
    expect(screen.getByRole('heading', { name: /Tu bolsa está vacía/i })).toBeInTheDocument()
  })

  it('muestra EmptyState cuando el carrito no tiene items', () => {
    mockUseCart.mockReturnValue({
      cart: buildCart({ items: [] }), error: null, isLoading: false,
      update: mockUpdate, remove: mockRemove, mutate: mockMutate,
    })
    render(<CartView />)
    expect(screen.getByRole('heading', { name: /Tu bolsa está vacía/i })).toBeInTheDocument()
  })
})

describe('CartView — items', () => {
  beforeEach(() => {
    mockUseCart.mockReturnValue({
      cart: buildCart(), error: null, isLoading: false,
      update: mockUpdate, remove: mockRemove, mutate: mockMutate,
    })
  })

  it('lista los productos del carrito', () => {
    render(<CartView />)
    expect(screen.getByRole('heading', { name: 'Laptop' })).toBeInTheDocument()
  })

  it('muestra el total del carrito', () => {
    render(<CartView />)
    expect(screen.getByText(/El total de tu bolsa es/)).toBeInTheDocument()
  })

  it('renderiza un stepper por item', () => {
    render(<CartView />)
    expect(screen.getAllByRole('button', { name: /aumentar cantidad/i })).toHaveLength(1)
  })

  it('actualiza la cantidad al aumentar', async () => {
    const user = userEvent.setup({ delay: null })
    render(<CartView />)

    await user.click(screen.getByRole('button', { name: /aumentar cantidad/i }))
    expect(mockUpdate).toHaveBeenCalledWith(1, 3)
  })

  it('elimina un item', async () => {
    const user = userEvent.setup({ delay: null })
    render(<CartView />)

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(mockRemove).toHaveBeenCalledWith(1)
  })

  it('muestra toast de error si actualizar falla', async () => {
    mockUpdate.mockRejectedValue(new Error('fallo'))
    const user = userEvent.setup({ delay: null })
    render(<CartView />)

    await user.click(screen.getByRole('button', { name: /aumentar cantidad/i }))
    expect(toastMock.error).toHaveBeenCalled()
  })

  it('muestra toast de error si eliminar falla', async () => {
    mockRemove.mockRejectedValue(new Error('fallo'))
    const user = userEvent.setup({ delay: null })
    render(<CartView />)

    await user.click(screen.getByRole('button', { name: 'Eliminar' }))
    expect(toastMock.error).toHaveBeenCalled()
  })
})