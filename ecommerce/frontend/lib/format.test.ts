import { describe, expect, it } from 'vitest'
import { formatDate, formatPrice, orderStatus } from '@/lib/format'

describe('formatPrice', () => {
  it('formatea un precio entero', () => {
    expect(formatPrice(10)).toContain('10')
  })

  it('formatea un precio decimal', () => {
    const result = formatPrice(999.99)
    expect(result).toContain('999')
  })

  it('formatea cero', () => {
    expect(formatPrice(0)).toContain('0')
  })

  it('devuelve texto con el símbolo de moneda configurado', () => {
    expect(formatPrice(100)).toMatch(/[$€£]|USD|EUR/i)
  })
})

describe('formatDate', () => {
  it('devuelve guion largo para null', () => {
    expect(formatDate(null)).toBe('—')
  })

  it('devuelve la cadena original si la fecha es inválida', () => {
    expect(formatDate('no-es-una-fecha')).toBe('no-es-una-fecha')
  })

  it('formatea una fecha ISO válida', () => {
    const result = formatDate('2026-10-09T12:00:00Z')
    expect(result).not.toBe('2026-10-09T12:00:00Z')
    expect(result).toContain('2026')
  })

  it('devuelve guion largo para cadena vacía', () => {
    expect(formatDate('')).toBe('—')
  })
})

describe('orderStatus', () => {
  it('mapea pending a Pendiente con tono naranja', () => {
    expect(orderStatus('pending')).toEqual({ label: 'Pendiente', tone: 'orange' })
  })

  it('mapea delivered a Entregado con tono verde', () => {
    expect(orderStatus('delivered')).toEqual({ label: 'Entregado', tone: 'green' })
  })

  it('mapea cancelled a Cancelado con tono rojo', () => {
    expect(orderStatus('cancelled')).toEqual({ label: 'Cancelado', tone: 'red' })
  })

  it('mapea canceled (variante americana) igual que cancelled', () => {
    expect(orderStatus('canceled')).toEqual({ label: 'Cancelado', tone: 'red' })
  })

  it('es case-insensitive', () => {
    expect(orderStatus('PENDING')).toEqual({ label: 'Pendiente', tone: 'orange' })
  })

  it('devuelve tono neutral para estados desconocidos', () => {
    expect(orderStatus('inventado')).toEqual({ label: 'inventado', tone: 'neutral' })
  })
})