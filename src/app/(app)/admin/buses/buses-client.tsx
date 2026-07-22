'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import { columns, Bus } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import BusFormDialog from './bus-form-dialog'
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
import { deleteBus, toggleBusStatus } from '@/lib/actions/buses'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type BusesClientProps = {
  initialBuses: Bus[]
}

export default function BusesClient({ initialBuses }: BusesClientProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [busToDelete, setBusToDelete] = useState<Bus | null>(null)
  const [loading, setLoading] = useState(false)

  function handleEdit(bus: Bus) {
    setSelectedBus(bus)
    setFormOpen(true)
  }

  function handleAdd() {
    setSelectedBus(null)
    setFormOpen(true)
  }

  async function handleToggleStatus(bus: Bus) {
    setLoading(true)
    const result = await toggleBusStatus(bus.id, !bus.is_active)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Bus ${bus.is_active ? 'deactivated' : 'activated'} successfully`)
      router.refresh()
    }
    setLoading(false)
  }

  function handleDeleteClick(bus: Bus) {
    setBusToDelete(bus)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!busToDelete) return

    setLoading(true)
    const result = await deleteBus(busToDelete.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Bus deleted successfully')
      router.refresh()
    }

    setLoading(false)
    setDeleteDialogOpen(false)
    setBusToDelete(null)
  }

  function handleFormSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Buses</h1>
          <p className="text-sm text-slate-600 mt-1">Manage bus fleet</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Bus
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialBuses}
        filters={[
          { columnId: 'bus_number', placeholder: 'Filter by bus number...' },
        ]}
        meta={{
          onEdit: handleEdit,
          onToggleStatus: handleToggleStatus,
          onDelete: handleDeleteClick,
        }}
      />

      <BusFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        bus={selectedBus}
        onSuccess={handleFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete bus{' '}
              <span className="font-semibold">{busToDelete?.bus_number}</span>.
              <br />
              <br />
              Buses with existing duty assignments cannot be deleted. Deactivate them instead.
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
