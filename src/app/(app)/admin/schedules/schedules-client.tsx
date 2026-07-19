'use client'

import { useState } from 'react'
import { DataTable } from '@/components/data-table'
import { columns, Schedule } from './columns'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import ScheduleFormDialog from './schedule-form-dialog'
import ViewTripsDialog from './view-trips-dialog'
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
import { deleteSchedule, toggleScheduleStatus } from '@/lib/actions/schedules'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'

type SchedulesClientProps = {
  initialSchedules: Schedule[]
}

export default function SchedulesClient({ initialSchedules }: SchedulesClientProps) {
  const router = useRouter()
  const [formOpen, setFormOpen] = useState(false)
  const [selectedSchedule, setSelectedSchedule] = useState<Schedule | null>(null)
  const [viewTripsOpen, setViewTripsOpen] = useState(false)
  const [scheduleToView, setScheduleToView] = useState<Schedule | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [scheduleToDelete, setScheduleToDelete] = useState<Schedule | null>(null)
  const [loading, setLoading] = useState(false)

  function handleView(schedule: Schedule) {
    setScheduleToView(schedule)
    setViewTripsOpen(true)
  }

  function handleEdit(schedule: Schedule) {
    setSelectedSchedule(schedule)
    setFormOpen(true)
  }

  function handleAdd() {
    setSelectedSchedule(null)
    setFormOpen(true)
  }

  async function handleToggleStatus(schedule: Schedule) {
    setLoading(true)
    const result = await toggleScheduleStatus(schedule.id, !schedule.is_active)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Schedule ${schedule.is_active ? 'deactivated' : 'activated'} successfully`)
      router.refresh()
    }
    setLoading(false)
  }

  function handleDeleteClick(schedule: Schedule) {
    setScheduleToDelete(schedule)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!scheduleToDelete) return

    setLoading(true)
    const result = await deleteSchedule(scheduleToDelete.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Schedule deleted successfully')
      router.refresh()
    }

    setLoading(false)
    setDeleteDialogOpen(false)
    setScheduleToDelete(null)
  }

  function handleFormSuccess() {
    router.refresh()
  }

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Duty Schedules</h1>
          <p className="text-sm text-slate-600 mt-1">Manage predefined duty schedules and trips</p>
        </div>
        <Button onClick={handleAdd}>
          <Plus className="h-4 w-4 mr-2" />
          Add Schedule
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={initialSchedules}
        meta={{
          onView: handleView,
          onEdit: handleEdit,
          onToggleStatus: handleToggleStatus,
          onDelete: handleDeleteClick,
        }}
      />

      <ScheduleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        schedule={selectedSchedule}
        onSuccess={handleFormSuccess}
      />

      <ViewTripsDialog
        open={viewTripsOpen}
        onOpenChange={setViewTripsOpen}
        schedule={scheduleToView}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete schedule{' '}
              <span className="font-semibold">{scheduleToDelete?.schedule_number}</span> and all its
              trips.
              <br />
              <br />
              Schedules with existing duty assignments cannot be deleted. Deactivate them instead.
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
