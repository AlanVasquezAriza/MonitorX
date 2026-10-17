import type { Metadata } from 'next'
import { AccountView } from '@/components/account/account-view'
import { RequireAuth } from '@/components/providers/require-auth'

export const metadata: Metadata = { title: 'Mi cuenta' }

export default function AccountPage() {
  return (
    <RequireAuth>
      <AccountView />
    </RequireAuth>
  )
}
