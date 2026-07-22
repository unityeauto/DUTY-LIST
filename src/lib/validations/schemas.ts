import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const driverSchema = z.object({
  batch_number: z.string().min(1, 'Batch number is required'),
  name: z.string().min(1, 'Name is required'),
  mobile: z.string().optional(),
  is_active: z.boolean().default(true),
})

export const busSchema = z.object({
  bus_number: z.string().min(1, 'Bus number is required'),
  is_active: z.boolean().default(true),
})

export const dutyScheduleSchema = z.object({
  schedule_number: z.string().min(1, 'Schedule number is required'),
  return_code: z.string().optional(),
  total_km: z.number().positive('Total kilometers must be positive'),
  is_active: z.boolean().default(true),
})

export const scheduleTripSchema = z.object({
  trip_sequence: z.number().int().positive(),
  start_time: z.string().regex(/^\d{2}:\d{2}$/, 'Time must be in HH:MM format'),
  route_name: z.string().min(1, 'Route name is required'),
})

export const scheduleWithTripsSchema = dutyScheduleSchema.extend({
  trips: z
    .array(
      z.object({
        start_time: z
          .string()
          .regex(/^\d{2}:\d{2}$/, 'Each trip needs a start time (HH:MM)'),
        route_name: z.string().min(1, 'Each trip needs a route / station name'),
      })
    )
    .min(1, 'Add at least one trip (start time + route)'),
})

export const dutyAssignmentSchema = z.object({
  duty_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format'),
  schedule_id: z.string().uuid(),
  bus_id: z.string().uuid(),
  driver_id: z.string().uuid(),
})

export type LoginInput = z.infer<typeof loginSchema>
export type DriverInput = z.infer<typeof driverSchema>
export type BusInput = z.infer<typeof busSchema>
export type DutyScheduleInput = z.infer<typeof dutyScheduleSchema>
export type ScheduleTripInput = z.infer<typeof scheduleTripSchema>
export type ScheduleWithTripsInput = z.infer<typeof scheduleWithTripsSchema>
export type DutyAssignmentInput = z.infer<typeof dutyAssignmentSchema>
