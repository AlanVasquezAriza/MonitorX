'use client'

import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useAuth } from '@/components/providers/auth-provider'
import { STORE_NAME } from '@/lib/config'
import { useCart, useCategories } from '@/lib/hooks'
import { cn } from '@/lib/utils'
import { AccountMenu } from './account-menu'

export function SiteHeader() {
  const pathname = usePathname()
  const router = useRouter()
  const { status } = useAuth()
  const { cart } = useCart()
  const { categories } = useCategories()
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const searchRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [pathname])

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus()
  }, [searchOpen])

  const navCategories = categories.slice(0, 5)
  const count = cart?.count ?? 0

  function onSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const term = new FormData(event.currentTarget).get('q')?.toString().trim()
    router.push(term ? `/shop?search=${encodeURIComponent(term)}` : '/shop')
  }

  return (
    <header className="sticky top-0 z-50">
      <nav
        aria-label="Navegación principal"
        className="border-b border-black/[0.06] bg-white/80 backdrop-blur-xl backdrop-saturate-150"
      >
        <div className="mx-auto flex h-12 max-w-[1024px] items-center justify-between gap-4 px-4 md:px-6">
          <Link href="/" className="text-[17px] font-semibold tracking-tight text-foreground">
            {STORE_NAME}
          </Link>

          <ul className="hidden items-center gap-8 text-xs text-foreground/80 md:flex">
            <li>
              <Link href="/shop" className={cn('transition-colors hover:text-foreground', pathname === '/shop' && 'text-foreground')}>
                Tienda
              </Link>
            </li>
            {navCategories.map((category) => (
              <li key={category.id}>
                <Link href={`/shop?category=${category.id}`} className="transition-colors hover:text-foreground">
                  {category.name}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/orders" className="transition-colors hover:text-foreground">
                Pedidos
              </Link>
            </li>
          </ul>

          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Buscar"
              aria-expanded={searchOpen}
              onClick={() => setSearchOpen((v) => !v)}
              className="flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground"
            >
              <Search className="size-[18px]" />
            </button>

            {status === 'authenticated' ? (
              <AccountMenu />
            ) : (
              <Link
                href={`/login?next=${encodeURIComponent(pathname)}`}
                aria-label="Iniciar sesión"
                className="flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground"
              >
                <User className="size-[18px]" />
              </Link>
            )}

            <Link
              href="/cart"
              aria-label={`Bolsa de compras, ${count} artículos`}
              className="relative flex size-9 items-center justify-center rounded-full text-foreground/80 transition-colors hover:text-foreground"
            >
              <ShoppingBag className="size-[18px]" />
              {count > 0 && (
                <span className="absolute right-0.5 top-0.5 flex min-w-4 items-center justify-center rounded-full bg-foreground px-1 text-[10px] font-medium leading-4 text-background tabular-nums">
                  {count}
                </span>
              )}
            </Link>

            <button
              type="button"
              aria-label={menuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen((v) => !v)}
              className="flex size-9 items-center justify-center rounded-full text-foreground/80 md:hidden"
            >
              {menuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {searchOpen && (
          <div className="border-t border-black/[0.06]">
            <form onSubmit={onSearch} role="search" className="mx-auto flex max-w-[680px] items-center gap-3 px-4 py-4 md:px-6">
              <Search className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              <label htmlFor="site-search" className="sr-only">
                Buscar productos
              </label>
              <input
                ref={searchRef}
                id="site-search"
                name="q"
                type="search"
                placeholder="Buscar en la tienda"
                className="h-10 flex-1 bg-transparent text-xl text-foreground outline-none placeholder:text-muted-foreground md:text-2xl"
              />
            </form>
          </div>
        )}

        {menuOpen && (
          <div className="border-t border-black/[0.06] md:hidden">
            <ul className="flex flex-col px-6 py-4">
              {[{ href: '/shop', label: 'Tienda' }, ...navCategories.map((c) => ({ href: `/shop?category=${c.id}`, label: c.name })), { href: '/orders', label: 'Pedidos' }, { href: '/account', label: 'Cuenta' }].map(
                (item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="block py-3 text-2xl font-semibold text-foreground">
                      {item.label}
                    </Link>
                  </li>
                ),
              )}
            </ul>
          </div>
        )}
      </nav>
    </header>
  )
}
