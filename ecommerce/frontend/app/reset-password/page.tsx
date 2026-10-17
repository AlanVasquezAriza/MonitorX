import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'

export const metadata: Metadata = { title: 'Nueva contraseña' }

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string; uidb64?: string; token?: string }>
}) {
  const { uid, uidb64, token } = await searchParams
  return <ResetPasswordForm uid={uid ?? uidb64 ?? ''} token={token ?? ''} />
}
