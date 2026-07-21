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
import { addScheduleTrip, updateScheduleTrip } from '@/lib/actions/schedules'
import { toast } from 'sonner'

type ScheduleTrip = {
  id: string
  trip_sequence: number
  start_time: string
  route_name: string
}

type TripFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  scheduleId: string
  trip?: ScheduleTrip | null
  onSuccess: () => void
}

export default function TripFormDialog({
  open,
  onOpenChange,
  scheduleId,
  trip,
  onSuccess,
}: TripFormDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    const tripData = {
      trip_sequence: Number(formData.get('trip_sequence')),
      start_time: formData.get('start_time') as string,
      route_name: formData.get('route_name') as string,
    }

    try {
      const result = trip
        ? await updateScheduleTrip(trip.id, tripData)
        : await addScheduleTrip(scheduleId, tripData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(trip ? 'Trip updated successfully' : 'Trip added successfully')
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
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{trip ? 'Edit Trip' : 'Add New Trip'}</DialogTitle>
          <DialogDescription>
            {trip ? 'Update trip details below.' : 'Enter details for the new trip.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="trip_sequence">Trip Sequence *</Label>
              <Input
                id="trip_sequence"
                name="trip_sequence"
                type="number"
                min="1"
                defaultValue={trip?.trip_sequence}
                placeholder="e.g., 1, 2, 3"
                required
                disabled={loading}
              />
              <p className="text-xs text-slate-500">Order in which trips occur</p>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="start_time">Start Time *</Label>
              <Input
                id="start_time"
                name="start_time"
                type="time"
                defaultValue={trip?.start_time}
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="route_name">Route Name *</Label>
              <Input
                id="route_name"
                name="route_name"
                defaultValue={trip?.route_name}
                placeholder="e.g., Vatva to Vastral"
                required
                disabled={loading}
              />
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
              {loading ? 'Saving...' : trip ? 'Update' : 'Add'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
