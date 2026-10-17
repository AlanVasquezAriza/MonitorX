'use client'

import { LayoutGrid, LogOut, Package, User } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/providers/auth-provider'

export function AccountMenu() {
  const { user, logout } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  async function onLogout() {
    setOpen(false)
    await logout()
    toast('Has cerrado sesión')
    router.push('/')
  }

  const initials = (user?.firstName?.[0] ?? user?.username?.[0] ?? user?.email?.[0] ?? '?').toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        aria-label="Menú de cuenta"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex size-9 items-center justify-center rounded-full"
      >
        <span className="flex size-6 items-center justify-center rounded-full bg-foreground text-[11px] font-medium text-background">
          {initials}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-11 w-64 overflow-hidden rounded-2xl border border-black/[0.06] bg-white/95 p-1.5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] backdrop-blur-xl"
        >
          <div className="px-3 pb-2 pt-2.5">
            <p className="truncate text-[15px] font-medium text-foreground">
              {[user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.username}
            </p>
            <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
          </div>
          <div className="my-1 h-px bg-border/60" />
          <MenuLink href="/account" icon={<User className="size-4" />} label="Cuenta" onSelect={() => setOpen(false)} />
          <MenuLink href="/orders" icon={<Package className="size-4" />} label="Pedidos" onSelect={() => setOpen(false)} />
          {user?.isStaff && (
            <MenuLink href="/admin" icon={<LayoutGrid className="size-4" />} label="Administración" onSelect={() => setOpen(false)} />
          )}
          <div className="my-1 h-px bg-border/60" />
          <button
            type="button"
            role="menuitem"
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-[15px] text-foreground transition-colors hover:bg-muted"
          >
            <LogOut className="size-4" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  )
}

function MenuLink({ href, icon, label, onSelect }: { href: string; icon: React.ReactNode; label: string; onSelect: () => void }) {
  return (
    <Link
      href={href}
      role="menuitem"
      onClick={onSelect}
      className="flex items-center gap-3 rounded-xl px-3 py-2 text-[15px] text-foreground transition-colors hover:bg-muted"
    >
      {icon}
      {label}
    </Link>
  )
}
