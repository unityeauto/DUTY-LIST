import { createClient } from '@/lib/supabase/server'
import { getAssignmentsForDate } from '@/lib/actions/assignments'
import DutyAllocationClient from './duty-allocation-client'

export const dynamic = 'force-dynamic'

export default async function DutyAllocationPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today

  const supabase = await createClient()

  const [schedulesResult, driversResult, busesResult, assignments] = await Promise.all([
    supabase
      .from('duty_schedules')
      .select(`
        id,
        schedule_number,
        return_code,
        total_km,
        schedule_trips (
          id,
          trip_sequence,
          start_time,
          route_name
        )
      `)
      .eq('is_active', true)
      .order('schedule_number', { ascending: true }),
    supabase
      .from('drivers')
      .select('id, batch_number, name')
      .eq('is_active', true)
      .order('batch_number', { ascending: true }),
    supabase
      .from('buses')
      .select('id, bus_number')
      .eq('is_active', true)
      .order('bus_number', { ascending: true }),
    getAssignmentsForDate(date),
  ])

  const schedules = (schedulesResult.data || []).map((s) => ({
    ...s,
    schedule_trips: [...(s.schedule_trips || [])].sort(
      (a, b) => a.trip_sequence - b.trip_sequence
    ),
  }))

  // Schedules seeded from Excel sort naturally as numbers when possible
  schedules.sort((a, b) => {
    const na = Number(a.schedule_number)
    const nb = Number(b.schedule_number)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.schedule_number.localeCompare(b.schedule_number)
  })

  return (
    <DutyAllocationClient
      date={date}
      schedules={schedules}
      drivers={driversResult.data || []}
      buses={busesResult.data || []}
      assignments={assignments.map((a) => ({
        id: a.id,
        schedule_id: a.schedule_id,
        bus_id: a.bus_id,
        driver_id: a.driver_id,
      }))}
    />
  )
}
