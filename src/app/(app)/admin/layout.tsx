import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return <>{children}</>
}
