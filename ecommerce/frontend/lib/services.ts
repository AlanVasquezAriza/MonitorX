import { api, ApiError } from './api'
import { normalizeCart, normalizeCategory, normalizeOrder, normalizeProduct, normalizeUser, sameId, toList } from './normalize'
import { tokenStore } from './token-store'
import type { Id } from './types'

/* -------------------------------- Auth -------------------------------- */

export type RegisterPayload = {
  username: string
  email: string
  password: string
  first_name?: string
  last_name?: string
}

function extractTokens(data: any) {
  const access = data?.access ?? data?.tokens?.access ?? data?.token?.access ?? data?.access_token ?? data?.token
  const refresh = data?.refresh ?? data?.tokens?.refresh ?? data?.token?.refresh ?? data?.refresh_token ?? null
  return { access: typeof access === 'string' ? access : null, refresh: typeof refresh === 'string' ? refresh : null }
}

export const authService = {
  async login(identifier: string, password: string) {
    // Backend uses email as USERNAME_FIELD — send as 'email' for SimpleJWT
    const data = await api<any>('/api/auth/login/', {
      method: 'POST',
      auth: false,
      body: { email: identifier, password },
    })
    const { access, refresh } = extractTokens(data)
    if (!access) throw new ApiError('El servidor no devolvió un token de acceso.', 500, data)
    tokenStore.set(access, refresh)
    return data?.user ? normalizeUser(data.user) : null
  },

  async register(payload: RegisterPayload) {
    const data = await api<any>('/api/auth/register/', {
      method: 'POST',
      auth: false,
      body: { ...payload, password2: payload.password, password_confirm: payload.password },
    })
    const { access, refresh } = extractTokens(data)
    if (access) {
      tokenStore.set(access, refresh)
      return true
    }
    return false
  },

  async logout() {
    const refresh = tokenStore.getRefresh()
    try {
      if (refresh) await api('/api/auth/logout/', { method: 'POST', body: { refresh } })
    } finally {
      tokenStore.clear()
    }
  },

  async profile() {
    return normalizeUser(await api<any>('/api/auth/profile/'))
  },

  requestPasswordReset(email: string) {
    return api('/api/auth/password-reset/', { method: 'POST', auth: false, body: { email } })
  },

  confirmPasswordReset(uid: string, token: string, password: string) {
    return api('/api/auth/password-reset/confirm/', {
      method: 'POST',
      auth: false,
      body: { uid, uidb64: uid, token, new_password: password, new_password2: password, password },
    })
  },
}

/* -------------------------------- Users ------------------------------- */

export const userService = {
  async list() {
    return toList(await api('/api/auth/users/')).map(normalizeUser)
  },
  async get(id: Id) {
    return normalizeUser(await api<any>(`/api/auth/users/${id}/`))
  },
  async update(id: Id, body: Record<string, unknown>) {
    return normalizeUser(await api<any>(`/api/auth/users/${id}/`, { method: 'PATCH', body }))
  },
  async replace(id: Id, body: Record<string, unknown>) {
    return normalizeUser(await api<any>(`/api/auth/users/${id}/`, { method: 'PUT', body }))
  },
}

/* ------------------------------ Catalogue ----------------------------- */

export const productService = {
  async list(params: { category?: string | null; search?: string | null } = {}) {
    const qs = new URLSearchParams()
    if (params.category) qs.set('category', params.category)
    if (params.search) qs.set('search', params.search)
    const query = qs.toString()
    const products = toList(await api(`/api/products/${query ? `?${query}` : ''}`)).map(normalizeProduct)
    return { products: filterProducts(products, params) }
  },

  async get(id: Id) {
    return { product: normalizeProduct(await api<any>(`/api/products/${id}/`)) }
  },

  async create(body: FormData | Record<string, unknown>) {
    return normalizeProduct(await api<any>('/api/products/', { method: 'POST', body }))
  },
  async update(id: Id, body: FormData | Record<string, unknown>) {
    return normalizeProduct(await api<any>(`/api/products/${id}/`, { method: 'PATCH', body }))
  },
  async replace(id: Id, body: FormData | Record<string, unknown>) {
    return normalizeProduct(await api<any>(`/api/products/${id}/`, { method: 'PUT', body }))
  },
  remove(id: Id) {
    return api(`/api/products/${id}/`, { method: 'DELETE' })
  },
}

function filterProducts<T extends { categoryId: Id | null; name: string; description: string }>(
  products: T[],
  { category, search }: { category?: string | null; search?: string | null },
) {
  const term = search?.trim().toLowerCase()
  return products.filter((p) => {
    if (category && p.categoryId !== null && !sameId(p.categoryId, category)) return false
    if (term && !`${p.name} ${p.description}`.toLowerCase().includes(term)) return false
    return true
  })
}

export const categoryService = {
  async list() {
    return { categories: toList(await api('/api/categories/')).map(normalizeCategory) }
  },
  async get(id: Id) {
    return normalizeCategory(await api<any>(`/api/categories/${id}/`))
  },
  async create(body: Record<string, unknown>) {
    return normalizeCategory(await api<any>('/api/categories/', { method: 'POST', body }))
  },
  async update(id: Id, body: Record<string, unknown>) {
    return normalizeCategory(await api<any>(`/api/categories/${id}/`, { method: 'PATCH', body }))
  },
  async replace(id: Id, body: Record<string, unknown>) {
    return normalizeCategory(await api<any>(`/api/categories/${id}/`, { method: 'PUT', body }))
  },
  remove(id: Id) {
    return api(`/api/categories/${id}/`, { method: 'DELETE' })
  },
}

/* -------------------------------- Cart -------------------------------- */

export const cartService = {
  async get() {
    return normalizeCart(await api('/api/cart/'))
  },
  add(productId: Id, quantity = 1) {
    return api('/api/cart/add/', { method: 'POST', body: { product_id: productId, product: productId, quantity } })
  },
  updateItem(itemId: Id, quantity: number) {
    return api(`/api/cart/items/${itemId}/`, { method: 'PATCH', body: { quantity } })
  },
  removeItem(itemId: Id) {
    return api(`/api/cart/items/${itemId}/remove/`, { method: 'DELETE' })
  },
}

/* ------------------------------- Orders ------------------------------- */

export type CreateOrderPayload = {
  full_name: string
  phone: string
  address: string
  city: string
  postal_code: string
  notes?: string
}

export const orderService = {
  async list() {
    return toList(await api('/api/orders/')).map(normalizeOrder)
  },
  async get(id: Id) {
    return normalizeOrder(await api<any>(`/api/orders/${id}/`))
  },
  async create(payload?: CreateOrderPayload) {
    const body: Record<string, unknown> = {}
    if (payload) {
      const shipping_address = [payload.full_name, payload.address, `${payload.postal_code} ${payload.city}`.trim(), payload.phone]
        .filter(Boolean)
        .join(', ')
      body.shipping_address = shipping_address
      if (payload.notes) body.notes = payload.notes
    }
    return normalizeOrder(await api<any>('/api/orders/', { method: 'POST', body }))
  },
  async updateStatus(id: Id, status: string) {
    return normalizeOrder(await api<any>(`/api/orders/${id}/`, { method: 'PATCH', body: { status } }))
  },
}

/* ------------------------------- Health ------------------------------- */

export async function checkHealth() {
  try {
    await api('/api/health', { auth: false })
    return true
  } catch {
    return false
  }
}
