import Link from 'next/link'
import { STORE_NAME } from '@/lib/config'

const columns = [
  {
    title: 'Comprar',
    links: [
      { href: '/shop', label: 'Todos los productos' },
      { href: '/cart', label: 'Bolsa' },
    ],
  },
  {
    title: 'Cuenta',
    links: [
      { href: '/account', label: 'Mi cuenta' },
      { href: '/orders', label: 'Estado del pedido' },
      { href: '/login', label: 'Iniciar sesión' },
    ],
  },
  {
    title: 'Ayuda',
    links: [
      { href: '/forgot-password', label: 'Restablecer contraseña' },
      { href: '/register', label: 'Crear cuenta' },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="bg-muted text-xs text-muted-foreground">
      <div className="mx-auto max-w-[1024px] px-4 py-10 md:px-6">
        <p className="border-b border-border pb-4 leading-relaxed">
          Envío gratuito en todos los pedidos. Los precios incluyen impuestos. Las imágenes de los productos son
          ilustrativas.
        </p>
        <div className="grid grid-cols-2 gap-8 py-6 md:grid-cols-4">
          {columns.map((column) => (
            <div key={column.title}>
              <h2 className="mb-2.5 font-semibold text-foreground">{column.title}</h2>
              <ul className="flex flex-col gap-2">
                {column.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col gap-2 border-t border-border pt-4 md:flex-row md:items-center md:justify-between">
          <p>{`Copyright © ${new Date().getFullYear()} ${STORE_NAME}. Todos los derechos reservados.`}</p>
          <p>España</p>
        </div>
      </div>
    </footer>
  )
}
