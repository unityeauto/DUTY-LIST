import { createClient } from '@/lib/supabase/server'
import { getDutyReport } from '@/lib/queries/reports'
import { subDays, format } from 'date-fns'
import DutyReportClient from './duty-report-client'

export const dynamic = 'force-dynamic'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function DutyReportPage({
  searchParams,
}: {
  searchParams: Promise<{ from?: string; to?: string; driver?: string; schedule?: string }>
}) {
  const params = await searchParams
  const now = new Date()
  const today = format(now, 'yyyy-MM-dd')
  const defaultFrom = format(subDays(now, 6), 'yyyy-MM-dd')

  const from = params.from && DATE_RE.test(params.from) ? params.from : defaultFrom
  const to = params.to && DATE_RE.test(params.to) ? params.to : today
  const driverId = params.driver && UUID_RE.test(params.driver) ? params.driver : undefined
  const scheduleId =
    params.schedule && UUID_RE.test(params.schedule) ? params.schedule : undefined

  const supabase = await createClient()

  const [rows, driversResult, schedulesResult] = await Promise.all([
    getDutyReport({ from, to, driver_id: driverId, schedule_id: scheduleId }),
    supabase
      .from('drivers')
      .select('id, batch_number, name')
      .order('batch_number', { ascending: true }),
    supabase
      .from('duty_schedules')
      .select('id, schedule_number')
      .order('schedule_number', { ascending: true }),
  ])

  return (
    <DutyReportClient
      from={from}
      to={to}
      driverId={driverId ?? null}
      scheduleId={scheduleId ?? null}
      rows={rows}
      drivers={driversResult.data || []}
      schedules={schedulesResult.data || []}
    />
  )
}
