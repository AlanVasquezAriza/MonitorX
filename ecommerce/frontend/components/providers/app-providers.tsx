'use client'

import type { ReactNode } from 'react'
import { Toaster } from 'sonner'
import { SWRConfig } from 'swr'
import { AuthProvider } from './auth-provider'

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <SWRConfig value={{ revalidateOnFocus: false, errorRetryCount: 1 }}>
      <AuthProvider>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            className: '!rounded-2xl !border-border/60 !bg-white/90 !backdrop-blur-xl !shadow-lg !text-foreground !font-sans',
          }}
        />
      </AuthProvider>
    </SWRConfig>
  )
}
