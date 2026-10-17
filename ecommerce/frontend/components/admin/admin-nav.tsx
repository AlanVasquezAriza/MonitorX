'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tabs = [
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/categories', label: 'Categorías' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/users', label: 'Usuarios' },
]

export function AdminNav() {
  const pathname = usePathname()
  return (
    <nav aria-label="Secciones de administración" className="my-8 overflow-x-auto [scrollbar-width:none]">
      <ul className="inline-flex gap-1 rounded-full bg-[#e8e8ed] p-1">
        {tabs.map((tab) => {
          const active = pathname.startsWith(tab.href)
          return (
            <li key={tab.href}>
              <Link
                href={tab.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex h-9 items-center whitespace-nowrap rounded-full px-5 text-[15px] transition-all',
                  active ? 'bg-white text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {tab.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

export function AdminPanel({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="overflow-hidden rounded-3xl bg-white shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
      <div className="flex items-center justify-between gap-4 border-b border-border px-6 py-4">
        <h2 className="text-xl font-semibold text-foreground">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}
