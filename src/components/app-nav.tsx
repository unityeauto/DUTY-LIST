'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { logoutAction } from '@/lib/actions/auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Bus,
  Calendar,
  FileText,
  BarChart3,
  Download,
  LogOut,
  Menu,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type Profile = {
  id: string
  full_name: string | null
  role: 'admin' | 'supervisor'
}

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'supervisor'] },
  { href: '/duty-allocation', label: 'Duty Allocation', icon: ClipboardList, roles: ['admin', 'supervisor'] },
  { href: '/attendance/daily', label: 'Attendance', icon: Calendar, roles: ['admin', 'supervisor'] },
  { href: '/reports/duty', label: 'Reports', icon: FileText, roles: ['admin', 'supervisor'] },
  { href: '/report-export', label: 'Export Report', icon: Download, roles: ['admin', 'supervisor'] },
  { href: '/admin/drivers', label: 'Drivers', icon: Users, roles: ['admin'] },
  { href: '/admin/buses', label: 'Buses', icon: Bus, roles: ['admin'] },
  { href: '/admin/schedules', label: 'Schedules', icon: BarChart3, roles: ['admin'] },
]

export default function AppNav({ profile }: { profile: Profile }) {
  const pathname = usePathname()

  const filteredNavItems = navItems.filter((item) => item.roles.includes(profile.role))

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow border-r border-slate-200 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 h-16 border-b border-slate-200">
            <h1 className="text-lg font-semibold text-slate-900">Volvo Duty Manager</h1>
          </div>
          <nav className="flex-1 px-3 py-4 space-y-1">
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  )}
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="flex-shrink-0 border-t border-slate-200 p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">{profile.full_name || 'User'}</p>
                <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
              </div>
              <form action={logoutAction}>
                <Button variant="ghost" size="sm" type="submit">
                  <LogOut className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 z-10 flex items-center justify-between h-16 px-4 border-b border-slate-200 bg-white">
        <h1 className="text-lg font-semibold text-slate-900">Volvo Duty</h1>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="sm" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">{profile.full_name || 'User'}</p>
                  <p className="text-xs text-slate-500 capitalize">{profile.role}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            {filteredNavItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <DropdownMenuItem
                  key={item.href}
                  className={cn(isActive && 'bg-slate-100')}
                  render={<Link href={item.href} />}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </DropdownMenuItem>
              )
            })}
            <DropdownMenuSeparator />
            <form action={logoutAction}>
              <DropdownMenuItem
                nativeButton
                render={<button type="submit" className="w-full" />}
              >
                <LogOut className="h-4 w-4" />
                Logout
              </DropdownMenuItem>
            </form>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-10">
        <div className="grid grid-cols-5 h-16">
          {filteredNavItems.slice(0, 5).map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex flex-col items-center justify-center gap-1 text-xs',
                  isActive ? 'text-blue-700' : 'text-slate-600'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="truncate max-w-full px-1">{item.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
