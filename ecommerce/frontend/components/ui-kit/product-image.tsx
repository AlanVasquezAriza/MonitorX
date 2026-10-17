'use client'

import { ImageOff } from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export function ProductImage({ src, alt, className }: { src: string | null; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false)
  if (!src || failed) {
    return (
      <div className={cn('flex items-center justify-center bg-muted text-muted-foreground/60', className)}>
        <ImageOff className="size-8 stroke-[1.25]" aria-hidden="true" />
        <span className="sr-only">{alt}</span>
      </div>
    )
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element -- images come from the Django media server
    <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} className={cn('object-cover', className)} />
  )
}
