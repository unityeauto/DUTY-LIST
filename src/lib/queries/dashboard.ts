'use server'

import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats(date: string = new Date().toISOString().split('T')[0]) {
  const supabase = await createClient()

  // Get total counts
  const [driversResult, busesResult, schedulesResult, assignmentsResult] = await Promise.all([
    supabase.from('drivers').select('id', { count: 'exact', head: true }),
    supabase.from('buses').select('id', { count: 'exact', head: true }),
    supabase.from('duty_schedules').select('id', { count: 'exact', head: true }),
    supabase.from('duty_assignments').select('id', { count: 'exact', head: true }).eq('duty_date', date),
  ])

  // Get active drivers and buses
  const [activeDriversResult, activeBusesResult] = await Promise.all([
    supabase.from('drivers').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('buses').select('id', { count: 'exact', head: true }).eq('is_active', true),
  ])

  // Get today's assignments with driver info for attendance
  const { data: todayAssignments } = await supabase
    .from('duty_assignments')
    .select('driver_id')
    .eq('duty_date', date)

  const presentDrivers = new Set(todayAssignments?.map(a => a.driver_id) || []).size

  return {
    totalDrivers: driversResult.count || 0,
    activeDrivers: activeDriversResult.count || 0,
    totalBuses: busesResult.count || 0,
    activeBuses: activeBusesResult.count || 0,
    totalSchedules: schedulesResult.count || 0,
    todayAssignments: assignmentsResult.count || 0,
    presentDrivers,
    absentDrivers: (activeDriversResult.count || 0) - presentDrivers,
  }
}

export async function getRecentAssignments(limit: number = 10) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('duty_assignments')
    .select(`
      id,
      duty_date,
      duty_schedules!inner(schedule_number),
      drivers!inner(batch_number, name),
      buses!inner(bus_number)
    `)
    .order('duty_date', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limit)

  if (error) throw error

  return (data || []).map(item => ({
    id: item.id,
    duty_date: item.duty_date,
    schedule: { schedule_number: (item.duty_schedules as any).schedule_number },
    driver: {
      batch_number: (item.drivers as any).batch_number,
      name: (item.drivers as any).name
    },
    bus: { bus_number: (item.buses as any).bus_number }
  }))
}

export async function getAttendanceTrend(days: number = 7) {
  const supabase = await createClient()

  const today = new Date()
  const dates = []

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    dates.push(date.toISOString().split('T')[0])
  }

  const results = await Promise.all(
    dates.map(async (date) => {
      const { data } = await supabase
        .from('duty_assignments')
        .select('driver_id')
        .eq('duty_date', date)

      const present = new Set(data?.map(a => a.driver_id) || []).size

      return {
        date,
        present,
      }
    })
  )

  return results
}
