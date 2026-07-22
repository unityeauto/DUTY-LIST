'use server'

import { createClient } from '@/lib/supabase/server'
import {
  scheduleTripSchema,
  scheduleWithTripsSchema,
  type ScheduleWithTripsInput,
} from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'
import { getUserProfile } from './auth'

export async function getSchedules() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('duty_schedules')
    .select(`
      *,
      schedule_trips (
        id,
        trip_sequence,
        start_time,
        route_name
      )
    `)
    .order('schedule_number', { ascending: true })

  if (error) throw error

  return data || []
}

export async function getScheduleWithTrips(id: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('duty_schedules')
    .select(`
      *,
      schedule_trips (
        id,
        trip_sequence,
        start_time,
        route_name
      )
    `)
    .eq('id', id)
    .single()

  if (error) throw error

  return data
}

/**
 * Create a schedule together with its trips (start time + route/station).
 * Trip sequence is derived from row order in the form.
 */
export async function createSchedule(input: ScheduleWithTripsInput) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = scheduleWithTripsSchema.safeParse(input)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { trips, ...scheduleData } = validated.data

  const supabase = await createClient()

  const { data: schedule, error } = await supabase
    .from('duty_schedules')
    .insert(scheduleData)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: `Schedule ${scheduleData.schedule_number} already exists` }
    }
    return { error: error.message }
  }

  const { error: tripsError } = await supabase.from('schedule_trips').insert(
    trips.map((trip, index) => ({
      schedule_id: schedule.id,
      trip_sequence: index + 1,
      start_time: trip.start_time,
      route_name: trip.route_name,
    }))
  )

  if (tripsError) {
    // Roll back the schedule so a failed trip insert doesn't leave a tripless schedule
    await supabase.from('duty_schedules').delete().eq('id', schedule.id)
    return { error: tripsError.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true, data: schedule }
}

/**
 * Update a schedule and replace its trips with the submitted list.
 */
export async function updateSchedule(id: string, input: ScheduleWithTripsInput) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = scheduleWithTripsSchema.safeParse(input)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const { trips, ...scheduleData } = validated.data

  const supabase = await createClient()

  const { error } = await supabase
    .from('duty_schedules')
    .update(scheduleData)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: `Schedule ${scheduleData.schedule_number} already exists` }
    }
    return { error: error.message }
  }

  // Replace trips: delete existing, insert submitted rows in order
  const { error: deleteError } = await supabase
    .from('schedule_trips')
    .delete()
    .eq('schedule_id', id)

  if (deleteError) {
    return { error: deleteError.message }
  }

  const { error: tripsError } = await supabase.from('schedule_trips').insert(
    trips.map((trip, index) => ({
      schedule_id: id,
      trip_sequence: index + 1,
      start_time: trip.start_time,
      route_name: trip.route_name,
    }))
  )

  if (tripsError) {
    return { error: tripsError.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true }
}

export async function deleteSchedule(id: string) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  // Check if schedule has any assignments
  const { data: assignments } = await supabase
    .from('duty_assignments')
    .select('id')
    .eq('schedule_id', id)
    .limit(1)

  if (assignments && assignments.length > 0) {
    return { error: 'Cannot delete schedule with existing duty assignments. Deactivate instead.' }
  }

  const { error } = await supabase
    .from('duty_schedules')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true }
}

export async function toggleScheduleStatus(id: string, isActive: boolean) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('duty_schedules')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true }
}

export async function addScheduleTrip(scheduleId: string, tripData: {
  trip_sequence: number
  start_time: string
  route_name: string
}) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = scheduleTripSchema.safeParse(tripData)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('schedule_trips')
    .insert({
      schedule_id: scheduleId,
      ...validated.data,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true }
}

export async function updateScheduleTrip(tripId: string, tripData: {
  trip_sequence: number
  start_time: string
  route_name: string
}) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = scheduleTripSchema.safeParse(tripData)

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('schedule_trips')
    .update(validated.data)
    .eq('id', tripId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true }
}

export async function deleteScheduleTrip(tripId: string) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('schedule_trips')
    .delete()
    .eq('id', tripId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true }
}
