import type { Metadata } from 'next'
import { RegisterForm } from '@/components/auth/register-form'

export const metadata: Metadata = { title: 'Crear cuenta' }

export default async function RegisterPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams
  const safeNext = next && next.startsWith('/') && !next.startsWith('//') ? next : '/'
  return <RegisterForm next={safeNext} />
}
