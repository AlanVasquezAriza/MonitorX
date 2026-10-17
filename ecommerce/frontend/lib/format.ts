import { CURRENCY, LOCALE } from './config'

const currency = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: CURRENCY })

export function formatPrice(value: number) {
  return currency.format(value)
}

export function formatDate(value: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'long', year: 'numeric' }).format(date)
}

const STATUS_LABELS: Record<string, { label: string; tone: 'neutral' | 'blue' | 'green' | 'orange' | 'red' }> = {
  pending: { label: 'Pendiente', tone: 'orange' },
  processing: { label: 'En preparación', tone: 'blue' },
  paid: { label: 'Pagado', tone: 'blue' },
  confirmed: { label: 'Confirmado', tone: 'blue' },
  shipped: { label: 'Enviado', tone: 'blue' },
  delivered: { label: 'Entregado', tone: 'green' },
  completed: { label: 'Completado', tone: 'green' },
  cancelled: { label: 'Cancelado', tone: 'red' },
  canceled: { label: 'Cancelado', tone: 'red' },
}

export const ORDER_STATUSES = ['pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled']

export function orderStatus(status: string) {
  return STATUS_LABELS[status.toLowerCase()] ?? { label: status, tone: 'neutral' as const }
}
