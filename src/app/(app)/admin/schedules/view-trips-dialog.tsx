'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Schedule, ScheduleTrip } from './columns'
import { Plus, Pencil, Trash2, Clock, MapPin } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import TripFormDialog from './trip-form-dialog'
import { deleteScheduleTrip } from '@/lib/actions/schedules'
import { toast } from 'sonner'
import { useRouter } from 'next/navigation'
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

type ViewTripsDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  schedule: Schedule | null
}

export default function ViewTripsDialog({
  open,
  onOpenChange,
  schedule,
}: ViewTripsDialogProps) {
  const router = useRouter()
  const [tripFormOpen, setTripFormOpen] = useState(false)
  const [selectedTrip, setSelectedTrip] = useState<ScheduleTrip | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [tripToDelete, setTripToDelete] = useState<ScheduleTrip | null>(null)
  const [loading, setLoading] = useState(false)

  const sortedTrips = schedule?.schedule_trips
    ? [...schedule.schedule_trips].sort((a, b) => a.trip_sequence - b.trip_sequence)
    : []

  function handleAddTrip() {
    setSelectedTrip(null)
    setTripFormOpen(true)
  }

  function handleEditTrip(trip: ScheduleTrip) {
    setSelectedTrip(trip)
    setTripFormOpen(true)
  }

  function handleDeleteClick(trip: ScheduleTrip) {
    setTripToDelete(trip)
    setDeleteDialogOpen(true)
  }

  async function handleConfirmDelete() {
    if (!tripToDelete) return

    setLoading(true)
    const result = await deleteScheduleTrip(tripToDelete.id)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Trip deleted successfully')
      router.refresh()
    }

    setLoading(false)
    setDeleteDialogOpen(false)
    setTripToDelete(null)
  }

  function handleTripFormSuccess() {
    router.refresh()
  }

  if (!schedule) return null

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Trips for Schedule {schedule.schedule_number}</DialogTitle>
            <DialogDescription>
              Manage trips for this schedule. Each trip has a sequence, start time, and route.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-slate-600">
                {sortedTrips.length} trip(s) · Total: {schedule.total_km} km
                {schedule.return_code && ` · Return: ${schedule.return_code}`}
              </div>
              <Button size="sm" onClick={handleAddTrip}>
                <Plus className="h-4 w-4 mr-2" />
                Add Trip
              </Button>
            </div>

            {sortedTrips.length === 0 ? (
              <div className="text-center py-12 text-slate-500 border rounded-lg">
                <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="font-medium mb-1">No trips yet</p>
                <p className="text-sm">Add the first trip to get started</p>
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-20">Seq</TableHead>
                      <TableHead className="w-28">Start Time</TableHead>
                      <TableHead>Route</TableHead>
                      <TableHead className="w-20"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sortedTrips.map((trip) => (
                      <TableRow key={trip.id}>
                        <TableCell className="font-mono font-medium">
                          {trip.trip_sequence}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-slate-400" />
                            <span className="font-mono text-sm">{trip.start_time}</span>
                          </div>
                        </TableCell>
                        <TableCell>{trip.route_name}</TableCell>
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleEditTrip(trip)}
                            >
                              <Pencil className="h-3.5 w-3.5" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteClick(trip)}
                            >
                              <Trash2 className="h-3.5 w-3.5 text-red-600" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <TripFormDialog
        open={tripFormOpen}
        onOpenChange={setTripFormOpen}
        scheduleId={schedule.id}
        trip={selectedTrip}
        onSuccess={handleTripFormSuccess}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Trip?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete trip #{tripToDelete?.trip_sequence} (
              {tripToDelete?.route_name}).
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
