'use server'

import { createClient } from '@/lib/supabase/server'
import { dutyScheduleSchema, scheduleTripSchema } from '@/lib/validations/schemas'
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

export async function createSchedule(formData: FormData) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = dutyScheduleSchema.safeParse({
    schedule_number: formData.get('schedule_number'),
    return_code: formData.get('return_code') || undefined,
    total_km: Number(formData.get('total_km')),
    is_active: formData.get('is_active') === 'true',
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('duty_schedules')
    .insert(validated.data)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') {
      return { error: `Schedule ${validated.data.schedule_number} already exists` }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/schedules')
  return { success: true, data }
}

export async function updateSchedule(id: string, formData: FormData) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = dutyScheduleSchema.safeParse({
    schedule_number: formData.get('schedule_number'),
    return_code: formData.get('return_code') || undefined,
    total_km: Number(formData.get('total_km')),
    is_active: formData.get('is_active') === 'true',
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('duty_schedules')
    .update(validated.data)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: `Schedule ${validated.data.schedule_number} already exists` }
    }
    return { error: error.message }
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
