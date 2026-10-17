import Link from 'next/link'
import type { ComponentProps, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Spinner } from './spinner'

type Variant = 'primary' | 'secondary' | 'dark' | 'ghost' | 'danger'
type Size = 'sm' | 'md' | 'lg'

const variants: Record<Variant, string> = {
  primary: 'bg-primary text-primary-foreground hover:bg-[#0077ed] active:bg-[#006edb]',
  secondary: 'bg-secondary text-foreground hover:bg-[#e8e8ed]',
  dark: 'bg-foreground text-background hover:bg-black',
  ghost: 'bg-transparent text-primary hover:bg-accent',
  danger: 'bg-transparent text-destructive hover:bg-destructive/10',
}

const sizes: Record<Size, string> = {
  sm: 'h-8 px-4 text-sm',
  md: 'h-11 px-6 text-[15px]',
  lg: 'h-14 px-8 text-[17px]',
}

export function pillClasses(variant: Variant = 'primary', size: Size = 'md', className?: string) {
  return cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-normal transition-colors duration-200 select-none whitespace-nowrap',
    'focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-primary/30',
    'disabled:opacity-40 disabled:pointer-events-none',
    variants[variant],
    sizes[size],
    className,
  )
}

type ButtonProps = ComponentProps<'button'> & {
  variant?: Variant
  size?: Size
  loading?: boolean
  children: ReactNode
}

export function PillButton({ variant, size, loading, className, children, disabled, type = 'button', ...props }: ButtonProps) {
  return (
    <button type={type} className={pillClasses(variant, size, className)} disabled={disabled || loading} {...props}>
      {loading && <Spinner className="size-4" />}
      {children}
    </button>
  )
}

type LinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size }

export function PillLink({ variant, size, className, ...props }: LinkProps) {
  return <Link className={pillClasses(variant, size, className)} {...props} />
}
