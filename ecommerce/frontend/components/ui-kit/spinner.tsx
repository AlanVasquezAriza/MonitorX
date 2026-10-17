import { cn } from '@/lib/utils'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      role="status"
      aria-label="Cargando"
      className={cn('inline-block size-5 animate-spin rounded-full border-2 border-current border-r-transparent', className)}
    />
  )
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[50vh] items-center justify-center text-muted-foreground">
      <Spinner className="size-6" />
    </div>
  )
}
