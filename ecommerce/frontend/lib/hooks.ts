'use client'

import { useCallback } from 'react'
import useSWR from 'swr'
import { useAuth } from '@/components/providers/auth-provider'
import { cartService, categoryService, orderService, productService, userService } from './services'
import type { Id } from './types'

export function useProducts(params: { category?: string | null; search?: string | null } = {}) {
  const key = ['products', params.category ?? '', params.search ?? '']
  const { data, error, isLoading, mutate } = useSWR(key, () => productService.list(params), { keepPreviousData: true })
  return { products: data?.products ?? [], error, isLoading, mutate }
}

export function useProduct(id: Id | undefined) {
  const { data, error, isLoading } = useSWR(id ? ['product', String(id)] : null, () => productService.get(id as Id))
  return { product: data?.product ?? null, error, isLoading }
}

export function useCategories() {
  const { data, error, isLoading, mutate } = useSWR('categories', () => categoryService.list())
  return { categories: data?.categories ?? [], error, isLoading, mutate }
}

export function useCart() {
  const { status } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(status === 'authenticated' ? '/api/cart/' : null, () => cartService.get())

  const add = useCallback(
    async (productId: Id, quantity = 1) => {
      await cartService.add(productId, quantity)
      await mutate()
    },
    [mutate],
  )

  const update = useCallback(
    async (itemId: Id, quantity: number) => {
      if (data) {
        const items = data.items.map((i) => (String(i.id) === String(itemId) ? { ...i, quantity, subtotal: i.price * quantity } : i))
        mutate(
          { ...data, items, count: items.reduce((s, i) => s + i.quantity, 0), total: items.reduce((s, i) => s + i.subtotal, 0) },
          { revalidate: false },
        )
      }
      try {
        await cartService.updateItem(itemId, quantity)
      } finally {
        await mutate()
      }
    },
    [data, mutate],
  )

  const remove = useCallback(
    async (itemId: Id) => {
      if (data) {
        const items = data.items.filter((i) => String(i.id) !== String(itemId))
        mutate(
          { ...data, items, count: items.reduce((s, i) => s + i.quantity, 0), total: items.reduce((s, i) => s + i.subtotal, 0) },
          { revalidate: false },
        )
      }
      try {
        await cartService.removeItem(itemId)
      } finally {
        await mutate()
      }
    },
    [data, mutate],
  )

  return { cart: data ?? null, error, isLoading: status === 'loading' || isLoading, add, update, remove, mutate }
}

export function useOrders() {
  const { status } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(status === 'authenticated' ? '/api/orders/' : null, () => orderService.list())
  return { orders: data ?? [], error, isLoading: status === 'loading' || isLoading, mutate }
}

export function useOrder(id: Id | undefined) {
  const { status } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(status === 'authenticated' && id ? ['order', String(id)] : null, () =>
    orderService.get(id as Id),
  )
  return { order: data ?? null, error, isLoading: status === 'loading' || isLoading, mutate }
}

export function useUsers() {
  const { user } = useAuth()
  const { data, error, isLoading, mutate } = useSWR(user?.isStaff ? '/api/auth/users/' : null, () => userService.list())
  return { users: data ?? [], error, isLoading, mutate }
}
