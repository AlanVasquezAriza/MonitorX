import { useId, type ComponentProps } from 'react'
import { cn } from '@/lib/utils'

const fieldBase =
  'peer w-full rounded-xl border border-input bg-white px-4 pt-6 pb-2 text-[17px] text-foreground outline-none transition-shadow placeholder-transparent focus:border-primary focus:ring-4 focus:ring-primary/15 disabled:bg-muted disabled:text-muted-foreground'

const labelBase =
  'pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[17px] text-muted-foreground transition-all duration-150 peer-focus:top-3.5 peer-focus:text-xs peer-[:not(:placeholder-shown)]:top-3.5 peer-[:not(:placeholder-shown)]:text-xs'

type FieldProps = ComponentProps<'input'> & { label: string; hint?: string }

export function Field({ label, hint, className, id, ...props }: FieldProps) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <div className={className}>
      <div className="relative">
        <input id={inputId} placeholder={label} className={cn(fieldBase, 'h-14')} {...props} />
        <label htmlFor={inputId} className={labelBase}>
          {label}
        </label>
      </div>
      {hint && <p className="mt-1.5 px-1 text-xs text-muted-foreground">{hint}</p>}
    </div>
  )
}

type TextAreaProps = ComponentProps<'textarea'> & { label: string }

export function TextAreaField({ label, className, id, ...props }: TextAreaProps) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <div className={cn('relative', className)}>
      <textarea id={inputId} placeholder={label} className={cn(fieldBase, 'min-h-28 resize-y pt-7')} {...props} />
      <label
        htmlFor={inputId}
        className="pointer-events-none absolute left-4 top-3.5 text-xs text-muted-foreground"
      >
        {label}
      </label>
    </div>
  )
}

type SelectProps = ComponentProps<'select'> & { label: string }

export function SelectField({ label, className, id, children, ...props }: SelectProps) {
  const generated = useId()
  const inputId = id ?? generated
  return (
    <div className={cn('relative', className)}>
      <select id={inputId} className={cn(fieldBase, 'h-14 appearance-none pr-10')} {...props}>
        {children}
      </select>
      <label htmlFor={inputId} className="pointer-events-none absolute left-4 top-3.5 text-xs text-muted-foreground">
        {label}
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 12 12"
        className="pointer-events-none absolute right-4 top-1/2 size-3 -translate-y-1/2 text-muted-foreground"
      >
        <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    </div>
  )
}

export function FormError({ message }: { message: string | null }) {
  if (!message) return null
  return (
    <p role="alert" className="rounded-xl bg-destructive/[0.06] px-4 py-3 text-sm text-destructive">
      {message}
    </p>
  )
}
