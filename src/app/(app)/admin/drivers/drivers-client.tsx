'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import { columns, Driver } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import DriverFormDialog from './driver-form-dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { deleteDriver, toggleDriverStatus } from '@/lib/actions/drivers'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type DriversClientProps = {
  initialDrivers: Driver[]
}

export default function DriversClient({ initialDrivers }: DriversClientProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null)
  const [loading, setLoading] = useState(false)

  function handleEdit(driver: Driver) {
    setSelectedDriver(driver)
    setFormOpen(true)
  }

  function handleAdd() {
    setSelectedDriver(null)
    setFormOpen(true)
  }

  async function handleToggleStatus(driver: Driver) {
    setLoading(true)
    const result = await toggleDriverStatus(driver.id, !driver.is_active)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Driver ${driver.is_active ? 'deactivated' : 'activated'} successfully`)
      router.refresh()
    }
    setLoading(false)
  }

  function handleDeleteClick(driver: Driver) {
    setDriverToDelete(driver)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!driverToDelete) return

    setLoading(true)
    const result = await deleteDriver(driverToDelete.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Driver deleted successfully')
      router.refresh()
    }

    setLoading(false)
    setDeleteDialogOpen(false)
    setDriverToDelete(null)
  }

  function handleFormSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Drivers</h1>
          <p className="text-sm text-slate-600 mt-1">Manage bus drivers</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Driver
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialDrivers}
        filters={[
          { columnId: 'name', placeholder: 'Filter by name...' },
          { columnId: 'batch_number', placeholder: 'Filter by batch number...' },
        ]}
        meta={{
          onEdit: handleEdit,
          onToggleStatus: handleToggleStatus,
          onDelete: handleDeleteClick,
        }}
      />

      <DriverFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        driver={selectedDriver}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete driver{' '}
              <span className="font-semibold">{driverToDelete?.batch_number}</span> (
              {driverToDelete?.name}).
              <br />
              <br />
              Drivers with existing duty assignments cannot be deleted. Deactivate them instead.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={loading}
              className="bg-red-600 hover:bg-red-700"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
