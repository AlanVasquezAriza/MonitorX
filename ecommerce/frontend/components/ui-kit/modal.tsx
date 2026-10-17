'use client'

import { X } from 'lucide-react'
import { useEffect, useRef, type ReactNode } from 'react'

export function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === ref.current) onClose()
      }}
      aria-labelledby="modal-title"
      className="m-auto w-[min(560px,calc(100vw-2rem))] rounded-3xl bg-white p-0 text-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm"
    >
      {open && (
        <div className="max-h-[85dvh] overflow-y-auto p-6 md:p-8">
          <div className="mb-6 flex items-start justify-between gap-4">
            <h2 id="modal-title" className="text-2xl font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="flex size-8 items-center justify-center rounded-full bg-muted text-muted-foreground transition-colors hover:text-foreground"
            >
              <X className="size-4" />
            </button>
          </div>
          {children}
        </div>
      )}
    </dialog>
  )
}
