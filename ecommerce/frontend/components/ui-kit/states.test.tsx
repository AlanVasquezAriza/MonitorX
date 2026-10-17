import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Badge, EmptyState, ErrorNotice } from '@/components/ui-kit/states'

describe('EmptyState', () => {
  it('muestra el título', () => {
    render(<EmptyState title="Tu bolsa está vacía." />)
    expect(screen.getByRole('heading', { name: 'Tu bolsa está vacía.' })).toBeInTheDocument()
  })

  it('muestra la descripción cuando se pasa', () => {
    render(<EmptyState title="Vacío" description="Explora la tienda." />)
    expect(screen.getByText('Explora la tienda.')).toBeInTheDocument()
  })

  it('omite la descripción cuando no se pasa', () => {
    render(<EmptyState title="Vacío" />)
    expect(screen.queryByText('Explora la tienda.')).not.toBeInTheDocument()
  })

  it('renderiza el icono cuando se pasa', () => {
    render(<EmptyState title="Vacío" icon={<svg data-testid="icon" />} />)
    expect(screen.getByTestId('icon')).toBeInTheDocument()
  })

  it('renderiza la acción cuando se pasa', () => {
    render(<EmptyState title="Vacío" action={<button>Seguir comprando</button>} />)
    expect(screen.getByRole('button', { name: 'Seguir comprando' })).toBeInTheDocument()
  })
})

describe('ErrorNotice', () => {
  it('muestra el mensaje de error', () => {
    render(<ErrorNotice message="No pudimos cargar tu bolsa." />)
    expect(screen.getByText('No pudimos cargar tu bolsa.')).toBeInTheDocument()
  })

  it('muestra el botón Reintentar cuando hay onRetry', async () => {
    const onRetry = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<ErrorNotice message="Error" onRetry={onRetry} />)

    await user.click(screen.getByRole('button', { name: 'Reintentar' }))
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('omite el botón Reintentar cuando no hay onRetry', () => {
    render(<ErrorNotice message="Error" />)
    expect(screen.queryByRole('button', { name: 'Reintentar' })).not.toBeInTheDocument()
  })
})

describe('Badge', () => {
  it('muestra el contenido', () => {
    render(<Badge>Pendiente</Badge>)
    expect(screen.getByText('Pendiente')).toBeInTheDocument()
  })

  it('aplica el tono neutral por defecto', () => {
    render(<Badge>Nuevo</Badge>)
    expect(screen.getByText('Nuevo')).toHaveClass('bg-muted')
  })

  it('aplica el tono indicado', () => {
    render(<Badge tone="green">Completado</Badge>)
    expect(screen.getByText('Completado')).toHaveClass('text-success')
  })

  it('aplica el tono destructivo', () => {
    render(<Badge tone="red">Cancelado</Badge>)
    expect(screen.getByText('Cancelado')).toHaveClass('text-destructive')
  })
})