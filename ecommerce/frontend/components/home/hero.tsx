import { PillLink } from '@/components/ui-kit/pill-button'

export function Hero() {
  return (
    <section className="overflow-hidden bg-white pb-14 pt-14 text-center md:pb-20 md:pt-20">
      <div className="mx-auto max-w-3xl px-6">
        <p className="text-sm font-semibold text-warning md:text-base">Nuevo</p>
        <h1 className="mt-2 text-5xl font-semibold leading-[1.05] text-foreground md:text-7xl">Diseñado para inspirar.</h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-xl leading-snug text-muted-foreground md:text-2xl">
          Tecnología excepcional, materiales cuidados y una experiencia pensada hasta el último detalle.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <PillLink href="/shop" size="lg">
            Comprar ahora
          </PillLink>
          <PillLink href="#destacados" variant="ghost" size="lg">
            {'Más información ›'}
          </PillLink>
        </div>
      </div>
    </section>
  )
}
