'use server'

import { createClient } from '@/lib/supabase/server'
import { driverSchema } from '@/lib/validations/schemas'
import { revalidatePath } from 'next/cache'
import { getUserProfile } from './auth'

export async function getDrivers() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('drivers')
    .select('*')
    .order('batch_number', { ascending: true })

  if (error) throw error

  return data || []
}

export async function createDriver(formData: FormData) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = driverSchema.safeParse({
    batch_number: formData.get('batch_number'),
    name: formData.get('name'),
    mobile: formData.get('mobile') || undefined,
    is_active: formData.get('is_active') === 'true',
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('drivers')
    .insert(validated.data)

  if (error) {
    if (error.code === '23505') {
      return { error: `Driver with batch number ${validated.data.batch_number} already exists` }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/drivers')
  return { success: true }
}

export async function updateDriver(id: string, formData: FormData) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const validated = driverSchema.safeParse({
    batch_number: formData.get('batch_number'),
    name: formData.get('name'),
    mobile: formData.get('mobile') || undefined,
    is_active: formData.get('is_active') === 'true',
  })

  if (!validated.success) {
    return { error: validated.error.issues[0].message }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('drivers')
    .update(validated.data)
    .eq('id', id)

  if (error) {
    if (error.code === '23505') {
      return { error: `Driver with batch number ${validated.data.batch_number} already exists` }
    }
    return { error: error.message }
  }

  revalidatePath('/admin/drivers')
  return { success: true }
}

export async function deleteDriver(id: string) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  // Check if driver has any assignments
  const { data: assignments } = await supabase
    .from('duty_assignments')
    .select('id')
    .eq('driver_id', id)
    .limit(1)

  if (assignments && assignments.length > 0) {
    return { error: 'Cannot delete driver with existing duty assignments. Deactivate instead.' }
  }

  const { error } = await supabase
    .from('drivers')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/drivers')
  return { success: true }
}

export async function toggleDriverStatus(id: string, isActive: boolean) {
  const profile = await getUserProfile()

  if (!profile || profile.role !== 'admin') {
    return { error: 'Unauthorized: Admin access required' }
  }

  const supabase = await createClient()

  const { error } = await supabase
    .from('drivers')
    .update({ is_active: isActive })
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/admin/drivers')
  return { success: true }
}
