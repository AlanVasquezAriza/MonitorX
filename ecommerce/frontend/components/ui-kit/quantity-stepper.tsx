'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max,
  disabled,
  className,
}: {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number | null
  disabled?: boolean
  className?: string
}) {
  const canDecrease = !disabled && value > min
  const canIncrease = !disabled && (max === null || max === undefined || value < max)
  return (
    <div className={cn('inline-flex h-10 items-center rounded-full border border-border', className)}>
      <button
        type="button"
        aria-label="Disminuir cantidad"
        disabled={!canDecrease}
        onClick={() => onChange(value - 1)}
        className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30"
      >
        <Minus className="size-4" />
      </button>
      <span className="w-8 text-center text-[15px] tabular-nums" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label="Aumentar cantidad"
        disabled={!canIncrease}
        onClick={() => onChange(value + 1)}
        className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-muted disabled:opacity-30"
      >
        <Plus className="size-4" />
      </button>
    </div>
  )
}
