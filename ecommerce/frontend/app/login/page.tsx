import type { Metadata } from 'next'
import { LoginForm } from '@/components/auth/login-form'

export const metadata: Metadata = { title: 'Iniciar sesión' }

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return <LoginForm next={safeNext} />
}
