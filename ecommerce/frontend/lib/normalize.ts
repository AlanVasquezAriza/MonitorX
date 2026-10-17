import { API_URL } from './config'
import type { Cart, CartItem, Category, Id, Order, Product, User } from './types'

/*
 * These normalizers adapt the backend responses (Django REST Framework style)
 * to the shapes used by the UI. If your serializers use different field names,
 * adjust them here and the rest of the frontend keeps working.
 */

type Raw = Record<string, any>

export function toList(data: unknown): Raw[] {
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object') {
    const obj = data as Raw
    for (const key of ['results', 'data', 'items']) {
      if (Array.isArray(obj[key])) return obj[key]
    }
  }
  return []
}

function num(value: unknown): number {
  const n = typeof value === 'number' ? value : Number.parseFloat(String(value ?? ''))
  return Number.isFinite(n) ? n : 0
}

function str(value: unknown): string {
  return value === null || value === undefined ? '' : String(value)
}

export function mediaUrl(value: unknown): string | null {
  if (!value) return null
  if (typeof value === 'object') {
    const obj = value as Raw
    return mediaUrl(obj.image ?? obj.url ?? obj.src)
  }
  const url = String(value)
  if (/^(https?:|data:|blob:)/.test(url)) return url
  if (url.startsWith('/images/')) return url
  return `${API_URL}${url.startsWith('/') ? '' : '/'}${url}`
}

export function normalizeCategory(raw: Raw): Category {
  return {
    id: raw.id ?? raw.pk,
    name: str(raw.name ?? raw.title) || 'Sin nombre',
    description: str(raw.description),
    slug: raw.slug ?? null,
  }
}

export function normalizeProduct(raw: Raw): Product {
  const category = raw.category
  const stockRaw = raw.stock ?? raw.inventory ?? raw.quantity_available ?? raw.quantity
  return {
    id: raw.id ?? raw.pk,
    name: str(raw.name ?? raw.title) || 'Producto',
    description: str(raw.description),
    price: num(raw.price ?? raw.unit_price),
    stock: stockRaw === undefined || stockRaw === null ? null : num(stockRaw),
    image: mediaUrl(raw.image ?? raw.image_url ?? raw.thumbnail ?? raw.photo ?? raw.images?.[0]),
    categoryId: category && typeof category === 'object' ? (category.id ?? null) : (category ?? raw.category_id ?? null),
    categoryName: category && typeof category === 'object' ? str(category.name) : (raw.category_name ?? null),
    isActive: raw.is_active ?? raw.available ?? raw.active ?? true,
  }
}

export function normalizeCartItem(raw: Raw): CartItem {
  const product = raw.product && typeof raw.product === 'object' ? normalizeProduct(raw.product) : null
  const quantity = num(raw.quantity) || 1
  const price = num(raw.price ?? raw.unit_price ?? raw.product_price ?? product?.price)
  const subtotal = num(raw.subtotal ?? raw.total_price ?? raw.total ?? raw.line_total) || price * quantity
  return {
    id: raw.id ?? raw.pk,
    productId: product?.id ?? raw.product ?? raw.product_id ?? null,
    name: product?.name ?? (str(raw.product_name ?? raw.name) || 'Producto'),
    image: product?.image ?? mediaUrl(raw.product_image ?? raw.image),
    price,
    quantity,
    subtotal,
    stock: product?.stock ?? null,
  }
}

export function normalizeCart(raw: unknown): Cart {
  const obj = (raw && typeof raw === 'object' ? raw : {}) as Raw
  const itemsRaw = Array.isArray(raw) ? raw : toList(obj.items ?? obj.cart_items ?? obj.cartitems ?? [])
  const items = itemsRaw.map(normalizeCartItem)
  const computed = items.reduce((sum, item) => sum + item.subtotal, 0)
  return {
    id: Array.isArray(raw) ? null : (obj.id ?? null),
    items,
    total: num(obj.total ?? obj.total_price ?? obj.subtotal ?? obj.total_amount) || computed,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
  }
}

export function normalizeOrder(raw: Raw): Order {
  const items = toList(raw.items ?? raw.order_items ?? raw.orderitems ?? []).map(normalizeCartItem)
  const user = raw.user
  return {
    id: raw.id ?? raw.pk,
    status: str(raw.status) || 'pending',
    total: num(raw.total ?? raw.total_price ?? raw.total_amount ?? raw.amount) || items.reduce((s, i) => s + i.subtotal, 0),
    createdAt: raw.created_at ?? raw.created ?? raw.date ?? null,
    items,
    shippingAddress: str(raw.shipping_address ?? raw.address),
    customer:
      raw.user_email ??
      raw.customer_email ??
      (user && typeof user === 'object' ? (user.email ?? user.username) : user !== undefined ? str(user) : null),
  }
}

export function normalizeUser(raw: Raw): User {
  const data = (raw?.user && typeof raw.user === 'object' ? raw.user : raw) as Raw
  return {
    id: data.id ?? data.pk,
    username: str(data.username ?? data.email),
    email: str(data.email),
    firstName: str(data.first_name ?? data.firstName),
    lastName: str(data.last_name ?? data.lastName),
    isStaff: Boolean(
      data.is_staff ??
      data.is_superuser ??
      data.is_admin ??
      data.role === 'admin' ??
      data.role === 'ADMIN'
    ),
    phone: str(data.phone ?? data.phone_number),
    address: str(data.address),
    dateJoined: data.date_joined ?? data.created_at ?? null,
  }
}

export function sameId(a: Id | null | undefined, b: Id | null | undefined) {
  return a !== null && a !== undefined && b !== null && b !== undefined && String(a) === String(b)
}
