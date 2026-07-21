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
import { createBus, updateBus } from '@/lib/actions/buses'
import { toast } from 'sonner'

type Bus = {
  id: string
  bus_number: string
  is_active: boolean
}

type BusFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  bus?: Bus | null
  onSuccess: () => void
}

export default function BusFormDialog({
  open,
  onOpenChange,
  bus,
  onSuccess,
}: BusFormDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = bus
        ? await updateBus(bus.id, formData)
        : await createBus(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(bus ? 'Bus updated successfully' : 'Bus created successfully')
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
          <DialogTitle>{bus ? 'Edit Bus' : 'Add New Bus'}</DialogTitle>
          <DialogDescription>
            {bus
              ? 'Update bus information below.'
              : 'Enter the bus registration number.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="bus_number">Bus Number *</Label>
              <Input
                id="bus_number"
                name="bus_number"
                defaultValue={bus?.bus_number}
                placeholder="e.g., GJ-16-AY-3755"
                required
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                name="is_active"
                value="true"
                defaultChecked={bus?.is_active ?? true}
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
              {loading ? 'Saving...' : bus ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
