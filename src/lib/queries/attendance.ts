'use server'

import { createClient } from '@/lib/supabase/server'

export type DailyAttendanceRow = {
  driver_id: string
  batch_number: string
  name: string
  mobile: string | null
  is_active: boolean
  present: boolean
  schedule_number: string | null
  bus_number: string | null
}

/**
 * Attendance is derived: a driver with ≥1 assignment on the date is Present.
 * Inactive drivers are only listed if they have an assignment that day
 * (historical data stays visible).
 */
export async function getDailyAttendance(date: string): Promise<DailyAttendanceRow[]> {
  const supabase = await createClient()

  const [driversResult, assignmentsResult] = await Promise.all([
    supabase
      .from('drivers')
      .select('id, batch_number, name, mobile, is_active')
      .order('batch_number', { ascending: true }),
    supabase
      .from('duty_assignments')
      .select(`
        driver_id,
        duty_schedules!inner(schedule_number),
        buses!inner(bus_number)
      `)
      .eq('duty_date', date),
  ])

  if (driversResult.error) throw driversResult.error
  if (assignmentsResult.error) throw assignmentsResult.error

  const assignmentByDriver = new Map<string, { schedule_number: string; bus_number: string }>()
  for (const a of assignmentsResult.data || []) {
    assignmentByDriver.set(a.driver_id, {
      schedule_number: (a.duty_schedules as unknown as { schedule_number: string }).schedule_number,
      bus_number: (a.buses as unknown as { bus_number: string }).bus_number,
    })
  }

  return (driversResult.data || [])
    .filter((d) => d.is_active || assignmentByDriver.has(d.id))
    .map((d) => {
      const assignment = assignmentByDriver.get(d.id)
      return {
        driver_id: d.id,
        batch_number: d.batch_number,
        name: d.name,
        mobile: d.mobile,
        is_active: d.is_active,
        present: !!assignment,
        schedule_number: assignment?.schedule_number ?? null,
        bus_number: assignment?.bus_number ?? null,
      }
    })
}

export type MonthlyAttendanceRow = {
  driver_id: string
  batch_number: string
  name: string
  presentDays: number
  presentDates: string[] // YYYY-MM-DD, days with ≥1 assignment
}

/**
 * Monthly attendance for a given month (YYYY-MM).
 */
export async function getMonthlyAttendance(month: string): Promise<{
  rows: MonthlyAttendanceRow[]
  daysInMonth: number
}> {
  const supabase = await createClient()

  const [year, monthNum] = month.split('-').map(Number)
  const daysInMonth = new Date(year, monthNum, 0).getDate()
  const startDate = `${month}-01`
  const endDate = `${month}-${String(daysInMonth).padStart(2, '0')}`

  const [driversResult, assignmentsResult] = await Promise.all([
    supabase
      .from('drivers')
      .select('id, batch_number, name, is_active')
      .order('batch_number', { ascending: true }),
    supabase
      .from('duty_assignments')
      .select('driver_id, duty_date')
      .gte('duty_date', startDate)
      .lte('duty_date', endDate),
  ])

  if (driversResult.error) throw driversResult.error
  if (assignmentsResult.error) throw assignmentsResult.error

  const datesByDriver = new Map<string, Set<string>>()
  for (const a of assignmentsResult.data || []) {
    if (!datesByDriver.has(a.driver_id)) datesByDriver.set(a.driver_id, new Set())
    datesByDriver.get(a.driver_id)!.add(a.duty_date)
  }

  const rows = (driversResult.data || [])
    .filter((d) => d.is_active || datesByDriver.has(d.id))
    .map((d) => {
      const dates = [...(datesByDriver.get(d.id) || [])].sort()
      return {
        driver_id: d.id,
        batch_number: d.batch_number,
        name: d.name,
        presentDays: dates.length,
        presentDates: dates,
      }
    })

  return { rows, daysInMonth }
}
