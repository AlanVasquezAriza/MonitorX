import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
  className?: string
}) {
  return (
    <div className={cn('flex flex-col items-center justify-center px-6 py-20 text-center', className)}>
      {icon && <div className="mb-5 text-muted-foreground [&_svg]:size-12 [&_svg]:stroke-[1.25]">{icon}</div>}
      <h2 className="text-2xl font-semibold text-foreground md:text-3xl">{title}</h2>
      {description && <p className="mt-3 max-w-md text-pretty text-[17px] leading-relaxed text-muted-foreground">{description}</p>}
      {action && <div className="mt-8">{action}</div>}
    </div>
  )
}

export function ErrorNotice({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="mx-auto max-w-lg rounded-2xl bg-muted px-6 py-8 text-center">
      <p className="text-[17px] text-foreground">{message}</p>
      {onRetry && (
        <button type="button" onClick={onRetry} className="mt-3 text-[15px] text-primary hover:underline">
          Reintentar
        </button>
      )}
    </div>
  )
}

const tones = {
  neutral: 'bg-muted text-muted-foreground',
  blue: 'bg-accent text-accent-foreground',
  green: 'bg-success/10 text-success',
  orange: 'bg-warning/10 text-warning',
  red: 'bg-destructive/10 text-destructive',
}

export function Badge({ tone = 'neutral', children }: { tone?: keyof typeof tones; children: ReactNode }) {
  return <span className={cn('inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium', tones[tone])}>{children}</span>
}
