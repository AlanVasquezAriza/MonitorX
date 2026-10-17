import type { Metadata } from 'next'
import type { ReactNode } from 'react'
import { AdminNav } from '@/components/admin/admin-nav'
import { RequireAuth } from '@/components/providers/require-auth'

export const metadata: Metadata = { title: 'Administración' }

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <RequireAuth staff>
      <div className="min-h-[calc(100dvh-3rem)] bg-muted">
        <div className="mx-auto max-w-[1200px] px-6 pb-24 pt-10 md:pt-14">
          <h1 className="text-4xl font-semibold text-foreground">Administración</h1>
          <AdminNav />
          {children}
        </div>
      </div>
    </RequireAuth>
  )
}
