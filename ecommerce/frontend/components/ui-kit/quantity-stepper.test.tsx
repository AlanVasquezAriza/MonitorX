import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuantityStepper } from '@/components/ui-kit/quantity-stepper'

describe('QuantityStepper', () => {
  it('muestra el valor actual', () => {
    render(<QuantityStepper value={3} onChange={vi.fn()} />)
    expect(screen.getByText('3')).toBeInTheDocument()
  })

  it('aumenta la cantidad', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<QuantityStepper value={2} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /aumentar cantidad/i }))
    expect(onChange).toHaveBeenCalledWith(3)
  })

  it('disminuye la cantidad', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<QuantityStepper value={5} onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: /disminuir cantidad/i }))
    expect(onChange).toHaveBeenCalledWith(4)
  })

  it('deshabilita disminuir en el mínimo', () => {
    render(<QuantityStepper value={1} onChange={vi.fn()} min={1} />)
    expect(screen.getByRole('button', { name: /disminuir cantidad/i })).toBeDisabled()
  })

  it('deshabilita aumentar en el máximo', () => {
    render(<QuantityStepper value={10} onChange={vi.fn()} max={10} />)
    expect(screen.getByRole('button', { name: /aumentar cantidad/i })).toBeDisabled()
  })

  it('permite aumentar por debajo del máximo', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<QuantityStepper value={9} onChange={onChange} max={10} />)

    await user.click(screen.getByRole('button', { name: /aumentar cantidad/i }))
    expect(onChange).toHaveBeenCalledWith(10)
  })

  it('respeta un min distinto del valor por defecto', () => {
    render(<QuantityStepper value={3} onChange={vi.fn()} min={5} />)
    expect(screen.getByRole('button', { name: /disminuir cantidad/i })).toBeDisabled()
  })

  it('deshabilita ambos botones cuando disabled', () => {
    render(<QuantityStepper value={5} onChange={vi.fn()} disabled />)
    expect(screen.getByRole('button', { name: /aumentar cantidad/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /disminuir cantidad/i })).toBeDisabled()
  })

  it('no llama onChange al hacer clic en un botón deshabilitado', async () => {
    const onChange = vi.fn()
    const user = userEvent.setup({ delay: null })
    render(<QuantityStepper value={1} onChange={onChange} min={1} />)

    await user.click(screen.getByRole('button', { name: /disminuir cantidad/i }))
    expect(onChange).not.toHaveBeenCalled()
  })
})