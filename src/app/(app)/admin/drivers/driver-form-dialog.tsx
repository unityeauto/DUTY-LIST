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
import { createDriver, updateDriver } from '@/lib/actions/drivers'
import { toast } from 'sonner'

type Driver = {
  id: string
  batch_number: string
  name: string
  mobile: string | null
  is_active: boolean
}

type DriverFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  driver?: Driver | null
  onSuccess: () => void
}

export default function DriverFormDialog({
  open,
  onOpenChange,
  driver,
  onSuccess,
}: DriverFormDialogProps) {
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      const result = driver
        ? await updateDriver(driver.id, formData)
        : await createDriver(formData)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(driver ? 'Driver updated successfully' : 'Driver created successfully')
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
          <DialogTitle>{driver ? 'Edit Driver' : 'Add New Driver'}</DialogTitle>
          <DialogDescription>
            {driver
              ? 'Update driver information below.'
              : 'Enter the details of the new driver.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="batch_number">Batch Number *</Label>
              <Input
                id="batch_number"
                name="batch_number"
                defaultValue={driver?.batch_number}
                placeholder="e.g., DT-313"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={driver?.name}
                placeholder="Driver's full name"
                required
                disabled={loading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="mobile">Mobile</Label>
              <Input
                id="mobile"
                name="mobile"
                defaultValue={driver?.mobile || ''}
                placeholder="10-digit mobile number"
                type="tel"
                disabled={loading}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="is_active"
                name="is_active"
                value="true"
                defaultChecked={driver?.is_active ?? true}
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
              {loading ? 'Saving...' : driver ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
