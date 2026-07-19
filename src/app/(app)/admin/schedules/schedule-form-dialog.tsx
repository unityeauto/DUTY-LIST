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

type Schedule = {
  id: string
  schedule_number: string
  return_code: string | null
  total_km: number
  is_active: boolean
}

type ScheduleFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule?: Schedule | null
  onSuccess: () => void
}

export default function ScheduleFormDialog({
  open,
  onOpenChange,
  schedule,
  onSuccess,
}: ScheduleFormDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = schedule
        ? await updateSchedule(schedule.id, formData)
        : await createSchedule(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(schedule ? 'Schedule updated successfully' : 'Schedule created successfully')
        onOpenChange(false)
        onSuccess()
      }
    } catch (error) {
      toast.error('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{schedule ? 'Edit Schedule' : 'Add New Schedule'}</DialogTitle>
          <DialogDescription>
            {schedule
              ? 'Update schedule information below. Use "View Trips" to manage trips.'
              : 'Enter schedule details. You can add trips after creating the schedule.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="schedule_number">Schedule Number *</Label>
              <Input
                id="schedule_number"
                name="schedule_number"
                defaultValue={schedule?.schedule_number}
                placeholder="e.g., 1, 2A, 3B"
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
                placeholder="Optional return code"
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="total_km">Total Kilometers *</Label>
              <Input
                id="total_km"
                name="total_km"
                type="number"
                step="0.01"
                defaultValue={schedule?.total_km}
                placeholder="e.g., 45.5"
                required
                disabled={loading}
              />
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
