import { getMonthlyAttendance } from '@/lib/queries/attendance'
import MonthlyAttendanceClient from './monthly-attendance-client'

export const dynamic = 'force-dynamic'

export default async function MonthlyAttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const params = await searchParams
  const currentMonth = new Date().toISOString().slice(0, 7)
  const month =
    params.month && /^\d{4}-\d{2}$/.test(params.month) ? params.month : currentMonth

  const { rows, daysInMonth } = await getMonthlyAttendance(month)

  return <MonthlyAttendanceClient month={month} rows={rows} daysInMonth={daysInMonth} />
}
