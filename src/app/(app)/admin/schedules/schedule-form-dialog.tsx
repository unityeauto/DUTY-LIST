'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { createSchedule, updateSchedule } from '@/lib/actions/schedules'
import { toast } from 'sonner'
import { Plus, Trash2, ArrowUp, ArrowDown } from 'lucide-react'
import type { Schedule } from './columns'

type TripRow = {
  key: number
  start_time: string // HH:MM
  route_name: string
}

type ScheduleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: Schedule | null
  onSuccess: () => void
}

let nextKey = 0
function makeRow(start_time = '', route_name = ''): TripRow {
  return { key: nextKey++, start_time, route_name }
}

function initialTrips(schedule?: Schedule | null): TripRow[] {
  if (schedule && schedule.schedule_trips.length > 0) {
    return [...schedule.schedule_trips]
      .sort((a, b) => a.trip_sequence - b.trip_sequence)
      .map((t) => makeRow(t.start_time.slice(0, 5), t.route_name))
  }
  return [makeRow()]
}

export default function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  onSuccess,
}: ScheduleFormDialogProps) {
  const [loading, setLoading] = useState(false)
  const [trips, setTrips] = useState<TripRow[]>([makeRow()])

  // Re-seed trip rows each time the dialog opens (state adjustment during
  // render — https://react.dev/learn/you-might-not-need-an-effect)
  const [wasOpen, setWasOpen] = useState(false)
  if (open !== wasOpen) {
    setWasOpen(open)
    if (open) setTrips(initialTrips(schedule))
  }

  function updateTrip(key: number, patch: Partial<Omit<TripRow, 'key'>>) {
    setTrips((prev) => prev.map((t) => (t.key === key ? { ...t, ...patch } : t)))
  }

  function addTrip() {
    setTrips((prev) => [...prev, makeRow()])
  }

  function removeTrip(key: number) {
    setTrips((prev) => (prev.length > 1 ? prev.filter((t) => t.key !== key) : prev))
  }

  function moveTrip(key: number, direction: -1 | 1) {
    setTrips((prev) => {
      const index = prev.findIndex((t) => t.key === key)
      const target = index + direction
      if (index < 0 || target < 0 || target >= prev.length) return prev
      const next = [...prev]
      ;[next[index], next[target]] = [next[target], next[index]]
      return next
    })
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const input = {
      schedule_number: String(formData.get('schedule_number') ?? ''),
      return_code: String(formData.get('return_code') ?? '') || undefined,
      total_km: Number(formData.get('total_km')),
      is_active: formData.get('is_active') === 'true',
      trips: trips.map((t) => ({
        start_time: t.start_time,
        route_name: t.route_name.trim(),
      })),
    }

    try {
      const result = schedule
        ? await updateSchedule(schedule.id, input)
        : await createSchedule(input)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(schedule ? 'Schedule updated successfully' : 'Schedule created successfully')
        onOpenChange(false)
        onSuccess()
      }
    } catch {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
          <DialogDescription>
            {schedule
              ? 'Update schedule details and its trips below.'
              : 'Enter schedule details with its trips (start time and route/stations).'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="schedule_number">Schedule No. *</Label>
                <Input
                  id="schedule_number"
                  name="schedule_number"
                  defaultValue={schedule?.schedule_number}
                  placeholder="e.g., 1, 2A"
                  required
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="return_code">Return Code</Label>
                <Input
                  id="return_code"
                  name="return_code"
                  defaultValue={schedule?.return_code || ''}
                  placeholder="Optional"
                  disabled={loading}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="total_km">Total KM *</Label>
                <Input
                  id="total_km"
                  name="total_km"
                  type="number"
                  step="0.01"
                  min="0.01"
                  defaultValue={schedule?.total_km}
                  placeholder="e.g., 45.5"
                  required
                  disabled={loading}
                />
              </div>
            </div>

            {/* Trips */}
            <div className="grid gap-2">
              <div className="flex items-center justify-between">
                <Label>Trips (time + route/stations) *</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addTrip}
                  disabled={loading}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Trip
                </Button>
              </div>
              <div className="space-y-2">
                {trips.map((trip, index) => (
                  <div
                    key={trip.key}
                    className="flex items-start gap-2 rounded-md border border-slate-200 p-2"
                  >
                    <span className="mt-2 w-5 text-center text-xs font-medium text-slate-500 shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      type="time"
                      value={trip.start_time}
                      onChange={(e) => updateTrip(trip.key, { start_time: e.target.value })}
                      className="w-28 shrink-0"
                      required
                      disabled={loading}
                      aria-label={`Trip ${index + 1} start time`}
                    />
                    <Input
                      value={trip.route_name}
                      onChange={(e) => updateTrip(trip.key, { route_name: e.target.value })}
                      placeholder="e.g., Adajan to Sarthana"
                      required
                      disabled={loading}
                      aria-label={`Trip ${index + 1} route / stations`}
                    />
                    <div className="flex shrink-0">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => moveTrip(trip.key, -1)}
                        disabled={loading || index === 0}
                        aria-label={`Move trip ${index + 1} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => moveTrip(trip.key, 1)}
                        disabled={loading || index === trips.length - 1}
                        aria-label={`Move trip ${index + 1} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={() => removeTrip(trip.key)}
                        disabled={loading || trips.length === 1}
                        aria-label={`Remove trip ${index + 1}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-slate-500">
                Trips are saved in the order shown; use the arrows to reorder.
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                name="is_active"
                value="true"
                defaultChecked={schedule?.is_active ?? true}
                disabled={loading}
              />
              <Label
                htmlFor="is_active"
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Active
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : schedule ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
