'use server'

import { createClient } from '@/lib/supabase/server'

export type DutyReportRow = {
  id: string
  duty_date: string
  schedule_number: string
  return_code: string | null
  total_km: number
  driver_batch: string
  driver_name: string
  bus_number: string
}

export type DutyReportFilters = {
  from: string // YYYY-MM-DD
  to: string // YYYY-MM-DD
  driver_id?: string
  schedule_id?: string
}

export async function getDutyReport(filters: DutyReportFilters): Promise<DutyReportRow[]> {
  const supabase = await createClient()

  let query = supabase
    .from('duty_assignments')
    .select(`
      id,
      duty_date,
      duty_schedules!inner(schedule_number, return_code, total_km),
      drivers!inner(batch_number, name),
      buses!inner(bus_number)
    `)
    .gte('duty_date', filters.from)
    .lte('duty_date', filters.to)
    .order('duty_date', { ascending: false })

  if (filters.driver_id) query = query.eq('driver_id', filters.driver_id)
  if (filters.schedule_id) query = query.eq('schedule_id', filters.schedule_id)

  const { data, error } = await query

  if (error) throw error

  type Joined = {
    id: string
    duty_date: string
    duty_schedules: { schedule_number: string; return_code: string | null; total_km: number }
    drivers: { batch_number: string; name: string }
    buses: { bus_number: string }
  }

  return ((data || []) as unknown as Joined[]).map((item) => ({
    id: item.id,
    duty_date: item.duty_date,
    schedule_number: item.duty_schedules.schedule_number,
    return_code: item.duty_schedules.return_code,
    total_km: item.duty_schedules.total_km,
    driver_batch: item.drivers.batch_number,
    driver_name: item.drivers.name,
    bus_number: item.buses.bus_number,
  }))
}

export type DailyReportData = {
  date: string
  rows: {
    schedule_number: string
    return_code: string | null
    total_km: number
    bus_number: string
    driver_batch: string
    driver_name: string
    driver_mobile: string | null
    trips: { trip_sequence: number; start_time: string; route_name: string }[]
  }[]
}

/**
 * Full daily report for the shareable image export — one row per assigned
 * schedule, ordered by schedule number, with trip details.
 */
export async function getDailyReportData(date: string): Promise<DailyReportData> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('duty_assignments')
    .select(`
      id,
      duty_schedules!inner(
        schedule_number,
        return_code,
        total_km,
        schedule_trips(trip_sequence, start_time, route_name)
      ),
      drivers!inner(batch_number, name, mobile),
      buses!inner(bus_number)
    `)
    .eq('duty_date', date)

  if (error) throw error

  type Joined = {
    id: string
    duty_schedules: {
      schedule_number: string
      return_code: string | null
      total_km: number
      schedule_trips: { trip_sequence: number; start_time: string; route_name: string }[]
    }
    drivers: { batch_number: string; name: string; mobile: string | null }
    buses: { bus_number: string }
  }

  const rows = ((data || []) as unknown as Joined[]).map((item) => ({
    schedule_number: item.duty_schedules.schedule_number,
    return_code: item.duty_schedules.return_code,
    total_km: item.duty_schedules.total_km,
    bus_number: item.buses.bus_number,
    driver_batch: item.drivers.batch_number,
    driver_name: item.drivers.name,
    driver_mobile: item.drivers.mobile,
    trips: [...(item.duty_schedules.schedule_trips || [])].sort(
      (a, b) => a.trip_sequence - b.trip_sequence
    ),
  }))

  rows.sort((a, b) => {
    const na = Number(a.schedule_number)
    const nb = Number(b.schedule_number)
    if (!isNaN(na) && !isNaN(nb)) return na - nb
    return a.schedule_number.localeCompare(b.schedule_number)
  })

  return { date, rows }
}
