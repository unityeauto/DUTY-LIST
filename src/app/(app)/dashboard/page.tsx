import { getDashboardStats, getRecentAssignments, getAttendanceTrend } from '@/lib/queries/dashboard'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Bus, ClipboardList, CheckCircle2 } from 'lucide-react'
import { format } from 'date-fns'
import AttendanceChart from './attendance-chart'
import Link from 'next/link'

export default async function DashboardPage() {
  const today = new Date().toISOString().split('T')[0]
  const stats = await getDashboardStats(today)
  const recentAssignments = await getRecentAssignments(5)
  const attendanceTrend = await getAttendanceTrend(7)

  const statCards = [
    {
      title: 'Active Drivers',
      value: stats.activeDrivers,
      subtitle: `${stats.totalDrivers} total`,
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      title: 'Active Buses',
      value: stats.activeBuses,
      subtitle: `${stats.totalBuses} total`,
      icon: Bus,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      title: 'Today\'s Duties',
      value: stats.todayAssignments,
      subtitle: `${stats.totalSchedules} schedules`,
      icon: ClipboardList,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Present Today',
      value: stats.presentDrivers,
      subtitle: `${stats.absentDrivers} absent`,
      icon: CheckCircle2,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
    },
  ]

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-600 mt-1">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-600">{stat.title}</p>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{stat.value}</p>
                    <p className="text-xs text-slate-500 mt-1">{stat.subtitle}</p>
                  </div>
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Attendance Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Attendance Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <AttendanceChart data={attendanceTrend} />
        </CardContent>
      </Card>

      {/* Recent Assignments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Assignments</CardTitle>
          <Link
            href="/duty-allocation"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            View all
          </Link>
        </CardHeader>
        <CardContent>
          {recentAssignments.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              <ClipboardList className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No assignments yet</p>
              <Link
                href="/duty-allocation"
                className="text-sm text-blue-600 hover:text-blue-700 mt-2 inline-block"
              >
                Create your first assignment
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentAssignments.map((assignment) => (
                <div
                  key={assignment.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-slate-900">
                        {format(new Date(assignment.duty_date), 'MMM dd, yyyy')}
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded bg-blue-50 text-blue-700 font-medium">
                        {assignment.schedule?.schedule_number}
                      </span>
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">{assignment.driver?.batch_number}</span>
                      {' · '}
                      {assignment.driver?.name}
                      {' · '}
                      <span className="font-mono">{assignment.bus?.bus_number}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/duty-allocation">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <ClipboardList className="h-8 w-8 text-blue-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Assign Duties</h3>
              <p className="text-sm text-slate-600">Create today&apos;s duty assignments</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/attendance/daily">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <CheckCircle2 className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">View Attendance</h3>
              <p className="text-sm text-slate-600">Check daily driver attendance</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/report-export">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6">
              <Bus className="h-8 w-8 text-purple-600 mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Export Report</h3>
              <p className="text-sm text-slate-600">Generate WhatsApp report</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
