'use server'

import { createClient } from '@/lib/supabase/server'
import { dutyAssignmentSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'
import { getUserProfile } from './auth'

export async function getAssignmentsForDate(date: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('duty_assignments')
    .select(`
      id,
      duty_date,
      schedule_id,
      bus_id,
      driver_id,
      duty_schedules!inner(schedule_number),
      drivers!inner(batch_number, name),
      buses!inner(bus_number)
    `)
    .eq('duty_date', date)

  if (error) throw error

  return data || []
}

/**
 * Create or update the assignment for a schedule on a date.
 * Conflict rule: one schedule per driver per day, one schedule per bus per day.
 * Pre-checked here for friendly messages; unique constraints are the backstop.
 */
export async function saveAssignment(input: {
  duty_date: string
  schedule_id: string
  bus_id: string
  driver_id: string
  assignment_id?: string
}) {
  const profile = await getUserProfile()

  if (!profile) {
    return { error: 'Unauthorized: Please log in' }
  }

  const validated = dutyAssignmentSchema.safeParse({
    duty_date: input.duty_date,
    schedule_id: input.schedule_id,
    bus_id: input.bus_id,
    driver_id: input.driver_id,
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()
  const { duty_date, schedule_id, bus_id, driver_id } = validated.data

  // Fetch entities for active checks and friendly error messages
  const [driverResult, busResult, scheduleResult] = await Promise.all([
    supabase.from('drivers').select('batch_number, name, is_active').eq('id', driver_id).single(),
    supabase.from('buses').select('bus_number, is_active').eq('id', bus_id).single(),
    supabase.from('duty_schedules').select('schedule_number, is_active').eq('id', schedule_id).single(),
  ])

  if (driverResult.error || !driverResult.data) return { error: 'Driver not found' }
  if (busResult.error || !busResult.data) return { error: 'Bus not found' }
  if (scheduleResult.error || !scheduleResult.data) return { error: 'Schedule not found' }

  const driver = driverResult.data
  const bus = busResult.data
  const schedule = scheduleResult.data

  // Inactive entities cannot receive new assignments
  if (!driver.is_active) {
    return { error: `Driver ${driver.batch_number} is inactive and cannot receive new assignments.` }
  }
  if (!bus.is_active) {
    return { error: `Bus ${bus.bus_number} is inactive and cannot receive new assignments.` }
  }
  if (!schedule.is_active) {
    return { error: `Schedule ${schedule.schedule_number} is inactive and cannot receive new assignments.` }
  }

  // Conflict pre-check: driver or bus already assigned on this date (excluding this assignment)
  let conflictQuery = supabase
    .from('duty_assignments')
    .select('id, driver_id, bus_id, schedule_id')
    .eq('duty_date', duty_date)
    .or(`driver_id.eq.${driver_id},bus_id.eq.${bus_id},schedule_id.eq.${schedule_id}`)

  if (input.assignment_id) {
    conflictQuery = conflictQuery.neq('id', input.assignment_id)
  }

  const { data: conflicts, error: conflictError } = await conflictQuery

  if (conflictError) {
    return { error: conflictError.message }
  }

  for (const conflict of conflicts || []) {
    if (conflict.driver_id === driver_id) {
      return { error: `Driver ${driver.batch_number} is already assigned to a duty on this date.` }
    }
    if (conflict.bus_id === bus_id) {
      return { error: `Bus ${bus.bus_number} is already assigned to a duty on this date.` }
    }
    if (conflict.schedule_id === schedule_id) {
      return { error: `Schedule ${schedule.schedule_number} already has an assignment on this date.` }
    }
  }

  // Insert or update
  const { error } = input.assignment_id
    ? await supabase
        .from('duty_assignments')
        .update({ bus_id, driver_id })
        .eq('id', input.assignment_id)
    : await supabase
        .from('duty_assignments')
        .insert({ duty_date, schedule_id, bus_id, driver_id, assigned_by: profile.id })

  if (error) {
    // Unique constraint backstop — race between pre-check and write
    if (error.code === '23505') {
      if (error.message.includes('driver_id')) {
        return { error: `Driver ${driver.batch_number} is already assigned to a duty on this date.` }
      }
      if (error.message.includes('bus_id')) {
        return { error: `Bus ${bus.bus_number} is already assigned to a duty on this date.` }
      }
      return { error: `Schedule ${schedule.schedule_number} already has an assignment on this date.` }
    }
    return { error: error.message }
  }

  revalidatePath('/duty-allocation')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function deleteAssignment(id: string) {
  const profile = await getUserProfile()

  if (!profile) {
    return { error: 'Unauthorized: Please log in' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('duty_assignments')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/duty-allocation')
  revalidatePath('/dashboard')
  return { success: true }
}
