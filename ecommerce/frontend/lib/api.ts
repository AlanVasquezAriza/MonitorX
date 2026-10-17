import { API_URL, AUTH_HEADER_PREFIX } from './config'
import { tokenStore } from './token-store'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

const FIELD_LABELS: Record<string, string> = {
  username: 'Usuario',
  email: 'Correo',
  password: 'Contraseña',
  password2: 'Confirmación',
  new_password: 'Nueva contraseña',
  first_name: 'Nombre',
  last_name: 'Apellido',
  name: 'Nombre',
  price: 'Precio',
  stock: 'Stock',
  category: 'Categoría',
  quantity: 'Cantidad',
  product: 'Producto',
  product_id: 'Producto',
  shipping_address: 'Dirección',
  token: 'Token',
  uid: 'UID',
}

export function parseApiError(data: unknown, fallback: string): string {
  if (!data) return fallback
  if (typeof data === 'string') return data.length > 200 ? fallback : data
  if (Array.isArray(data)) return data.map(String).join(' ')
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>
    if (obj.error && typeof obj.error === 'object') {
      const errObj = obj.error as Record<string, unknown>
      if (typeof errObj.message === 'string') return errObj.message
    }
    for (const key of ['detail', 'message', 'error']) {
      if (typeof obj[key] === 'string') return obj[key] as string
    }
    const parts = Object.entries(obj)
      .map(([key, value]) => {
        const msg = Array.isArray(value) ? value.map(String).join(' ') : typeof value === 'string' ? value : ''
        if (!msg) return ''
        if (key === 'non_field_errors' || key === '__all__') return msg
        return `${FIELD_LABELS[key] ?? key}: ${msg}`
      })
      .filter(Boolean)
    if (parts.length) return parts.join(' · ')
  }
  return fallback
}

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken(): Promise<string | null> {
  const refresh = tokenStore.getRefresh()
  if (!refresh) return null
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/refresh/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        })
        if (!res.ok) {
          tokenStore.clear()
          return null
        }
        const data = await res.json()
        if (!data?.access) return null
        tokenStore.set(data.access, data.refresh ?? refresh)
        return data.access as string
      } catch {
        return null
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'
  body?: unknown
  auth?: boolean
}

export async function api<T = unknown>(path: string, { method = 'GET', body, auth = true }: RequestOptions = {}): Promise<T> {
  const url = path.startsWith('http') ? path : `${API_URL}${path}`
  const isForm = typeof FormData !== 'undefined' && body instanceof FormData

  const send = (token: string | null) => {
    const headers: Record<string, string> = { Accept: 'application/json' }
    if (!isForm && body !== undefined) headers['Content-Type'] = 'application/json'
    if (token) headers.Authorization = `${AUTH_HEADER_PREFIX} ${token}`
    return fetch(url, {
      method,
      headers,
      body: isForm ? (body as FormData) : body !== undefined ? JSON.stringify(body) : undefined,
    })
  }

  const token = auth ? tokenStore.getAccess() : null
  let res: Response
  try {
    res = await send(token)
    if (res.status === 401 && token) {
      const fresh = await refreshAccessToken()
      res = await send(fresh)
    }
  } catch {
    throw new ApiError('No se pudo conectar con el servidor. Verifica que el backend esté en ejecución.', 0, null)
  }

  const text = await res.text()
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  if (!res.ok) {
    throw new ApiError(parseApiError(data, `Error ${res.status}`), res.status, data)
  }
  return data as T
}

export function getErrorMessage(error: unknown, fallback = 'Algo salió mal. Inténtalo de nuevo.') {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return fallback
}
