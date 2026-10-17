import type { ReactNode } from 'react'

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="flex min-h-[calc(100dvh-3rem)] items-start justify-center bg-white px-6 pb-20 pt-16 md:pt-24">
      <div className="w-full max-w-[420px]">
        <header className="mb-10 text-center">
          <h1 className="text-balance text-4xl font-semibold text-foreground">{title}</h1>
          {subtitle && <p className="mt-3 text-pretty text-[17px] text-muted-foreground">{subtitle}</p>}
        </header>
        {children}
        {footer && <div className="mt-10 border-t border-border pt-8 text-center text-[15px] text-muted-foreground">{footer}</div>}
      </div>
    </div>
  )
}
