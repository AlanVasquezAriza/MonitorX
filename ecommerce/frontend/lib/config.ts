export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000').replace(/\/$/, '')

export const AUTH_HEADER_PREFIX = process.env.NEXT_PUBLIC_AUTH_HEADER_PREFIX ?? 'Bearer'

export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? 'USD'

export const LOCALE = process.env.NEXT_PUBLIC_LOCALE ?? 'es-ES'

export const STORE_NAME = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Store'
