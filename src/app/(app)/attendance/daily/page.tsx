import { getDailyAttendance } from '@/lib/queries/attendance'
import DailyAttendanceClient from './daily-attendance-client'

export const dynamic = 'force-dynamic'

export default async function DailyAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today

  const rows = await getDailyAttendance(date)

  return <DailyAttendanceClient date={date} rows={rows} />
}
