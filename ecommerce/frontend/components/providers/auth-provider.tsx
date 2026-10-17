'use client'

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from 'react'
import useSWR, { useSWRConfig } from 'swr'
import { authService, type RegisterPayload } from '@/lib/services'
import { tokenStore } from '@/lib/token-store'
import type { User } from '@/lib/types'

type AuthStatus = 'loading' | 'authenticated' | 'guest'

type AuthContextValue = {
  user: User | null
  status: AuthStatus
  login: (identifier: string, password: string) => Promise<void>
  register: (payload: RegisterPayload) => Promise<void>
  logout: () => Promise<void>
  refreshProfile: () => Promise<unknown>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export const PROFILE_KEY = '/api/auth/profile/'

const PRIVATE_KEYS = new Set([PROFILE_KEY, '/api/cart/', '/api/orders/', '/api/auth/users/'])

function isPrivateKey(key: unknown) {
  if (typeof key === 'string') return PRIVATE_KEYS.has(key)
  return Array.isArray(key) && key[0] === 'order'
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const { mutate: globalMutate } = useSWRConfig()
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  )
  const token = useSyncExternalStore(tokenStore.subscribe, tokenStore.getAccess, () => null)

  const { data: user, isLoading, mutate } = useSWR(token ? PROFILE_KEY : null, () => authService.profile(), {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  })

  const status: AuthStatus = !hydrated || (token && isLoading) ? 'loading' : token && user ? 'authenticated' : 'guest'

  const login = useCallback(
    async (identifier: string, password: string) => {
      const loggedUser = await authService.login(identifier, password)
      if (loggedUser) await mutate(loggedUser, { revalidate: true })
      else await mutate()
      await globalMutate('/api/cart/')
    },
    [mutate, globalMutate],
  )

  const register = useCallback(
    async (payload: RegisterPayload) => {
      const authenticated = await authService.register(payload)
      if (!authenticated) await authService.login(payload.username || payload.email, payload.password)
      await mutate()
    },
    [mutate],
  )

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      await globalMutate(isPrivateKey, undefined, { revalidate: false })
    }
  }, [globalMutate])

  const value = useMemo<AuthContextValue>(
    () => ({ user: user ?? null, status, login, register, logout, refreshProfile: () => mutate() }),
    [user, status, login, register, logout, mutate],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>')
  return ctx
}
