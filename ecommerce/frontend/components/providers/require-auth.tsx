'use client'

import { usePathname, useRouter } from 'next/navigation'
import { useEffect, type ReactNode } from 'react'
import { EmptyState } from '@/components/ui-kit/states'
import { PillLink } from '@/components/ui-kit/pill-button'
import { PageSpinner } from '@/components/ui-kit/spinner'
import { useAuth } from './auth-provider'

export function RequireAuth({ children, staff = false }: { children: ReactNode; staff?: boolean }) {
  const { status, user } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (status === 'guest') router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [status, router, pathname])

  if (status !== 'authenticated') return <PageSpinner />

  if (staff && !user?.isStaff) {
    return (
      <EmptyState
        title="Acceso restringido"
        description="Esta sección es solo para administradores de la tienda."
        action={<PillLink href="/">Volver al inicio</PillLink>}
      />
    )
  }

  return <>{children}</>
}
