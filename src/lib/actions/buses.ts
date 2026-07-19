'use server'

import { createClient } from '@/lib/supabase/server'
import { busSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'
import { getUserProfile } from './auth'

export async function getBuses() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('buses')
    .select('*')
    .order('bus_number', { ascending: true })

  if (error) throw error

  return data || []
}

export async function createBus(formData: FormData) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = busSchema.safeParse({
    bus_number: formData.get('bus_number'),
    is_active: formData.get('is_active') === 'true',
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('buses')
    .insert(validated.data)

  if (error) {
    if (error.code === '23505') {
      return { error: `Bus with number ${validated.data.bus_number} already exists` }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/buses')
  return { success: true }
}

export async function updateBus(id: string, formData: FormData) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = busSchema.safeParse({
    bus_number: formData.get('bus_number'),
    is_active: formData.get('is_active') === 'true',
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('buses')
    .update(validated.data)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: `Bus with number ${validated.data.bus_number} already exists` }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/buses')
  return { success: true }
}

export async function deleteBus(id: string) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  // Check if bus has any assignments
  const { data: assignments } = await supabase
    .from('duty_assignments')
    .select('id')
    .eq('bus_id', id)
    .limit(1)

  if (assignments && assignments.length > 0) {
    return { error: 'Cannot delete bus with existing duty assignments. Deactivate instead.' }
  }

  const { error } = await supabase
    .from('buses')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/buses')
  return { success: true }
}

export async function toggleBusStatus(id: string, isActive: boolean) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('buses')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/buses')
  return { success: true }
}
