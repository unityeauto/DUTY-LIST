import { getUserProfile } from '@/lib/actions/auth'
import { redirect } from 'next/navigation'
import { ReactNode } from 'react'
import AppNav from '@/components/app-nav'

export default async function AppLayout({ children }: { children: ReactNode }) {
  const profile = await getUserProfile()

  if (!profile) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppNav profile={profile} />
      <main className="md:pl-64 pb-16 md:pb-0">{children}</main>
    </div>
  )
}
