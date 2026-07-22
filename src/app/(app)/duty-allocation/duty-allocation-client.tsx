'use client'

import { useMemo, useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
import { saveAssignment, deleteAssignment } from '@/lib/actions/assignments'
import { CheckCircle2, Circle, Clock, Trash2 } from 'lucide-react'

type Trip = {
  id: string
  trip_sequence: number
  start_time: string
  route_name: string
}

type Schedule = {
  id: string
  schedule_number: string
  return_code: string | null
  total_km: number
  schedule_trips: Trip[]
}

type Driver = { id: string; batch_number: string; name: string }
type Bus = { id: string; bus_number: string }

type Assignment = {
  id: string
  schedule_id: string
  bus_id: string
  driver_id: string
}

type Props = {
  date: string
  schedules: Schedule[]
  drivers: Driver[]
  buses: Bus[]
  assignments: Assignment[]
}

type Selection = { bus_id: string | null; driver_id: string | null }

function formatTime(time: string) {
  // DB returns HH:MM:SS — show HH:MM
  return time.slice(0, 5)
}

export default function DutyAllocationClient({
  date,
  schedules,
  drivers,
  buses,
  assignments,
}: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [savingScheduleId, setSavingScheduleId] = useState<string | null>(null)
  const [assignmentToDelete, setAssignmentToDelete] = useState<{
    assignment: Assignment
    scheduleNumber: string
  } | null>(null)

  const assignmentBySchedule = useMemo(() => {
    const map = new Map<string, Assignment>()
    for (const a of assignments) map.set(a.schedule_id, a)
    return map
  }, [assignments])

  // Local unsaved selections, keyed by schedule id
  const [selections, setSelections] = useState<Record<string, Selection>>({})

  function getSelection(scheduleId: string): Selection {
    const local = selections[scheduleId]
    if (local) return local
    const saved = assignmentBySchedule.get(scheduleId)
    return { bus_id: saved?.bus_id ?? null, driver_id: saved?.driver_id ?? null }
  }

  function setSelection(scheduleId: string, patch: Partial<Selection>) {
    setSelections((prev) => ({
      ...prev,
      [scheduleId]: { ...getSelection(scheduleId), ...patch },
    }))
  }

  // Drivers/buses used by saved assignments on other schedules — mark in dropdowns
  const usedDrivers = useMemo(() => {
    const map = new Map<string, string>() // driver_id -> schedule_id
    for (const a of assignments) map.set(a.driver_id, a.schedule_id)
    return map
  }, [assignments])

  const usedBuses = useMemo(() => {
    const map = new Map<string, string>() // bus_id -> schedule_id
    for (const a of assignments) map.set(a.bus_id, a.schedule_id)
    return map
  }, [assignments])

  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers])
  const busById = useMemo(() => new Map(buses.map((b) => [b.id, b])), [buses])

  function handleDateChange(newDate: string) {
    if (!newDate) return
    setSelections({})
    router.push(`/duty-allocation?date=${newDate}`)
  }

  function handleSave(schedule: Schedule) {
    const selection = getSelection(schedule.id)
    if (!selection.bus_id || !selection.driver_id) {
      toast.error('Select both a bus and a driver before saving.')
      return
    }

    const existing = assignmentBySchedule.get(schedule.id)
    setSavingScheduleId(schedule.id)

    startTransition(async () => {
      const result = await saveAssignment({
        duty_date: date,
        schedule_id: schedule.id,
        bus_id: selection.bus_id!,
        driver_id: selection.driver_id!,
        assignment_id: existing?.id,
      })

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Schedule ${schedule.schedule_number} assigned successfully.`)
        setSelections((prev) => {
          const next = { ...prev }
          delete next[schedule.id]
          return next
        })
        router.refresh()
      }
      setSavingScheduleId(null)
    })
  }

  function handleConfirmDelete() {
    if (!assignmentToDelete) return
    const { assignment, scheduleNumber } = assignmentToDelete

    startTransition(async () => {
      const result = await deleteAssignment(assignment.id)

      if (result.error) {
        toast.error(result.error)
      } else {
        toast.success(`Assignment for schedule ${scheduleNumber} removed.`)
        setSelections((prev) => {
          const next = { ...prev }
          delete next[assignment.schedule_id]
          return next
        })
        router.refresh()
      }
      setAssignmentToDelete(null)
    })
  }

  const assignedCount = assignments.length

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Duty Allocation</h1>
          <p className="text-sm text-slate-600 mt-1">
            {format(parseISO(date), 'EEEE, MMMM d, yyyy')} — pick a bus and driver for each
            schedule
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="duty-date">Date</Label>
            <Input
              id="duty-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-44"
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Badge variant="secondary" className="bg-blue-50 text-blue-700">
          {assignedCount} / {schedules.length} schedules assigned
        </Badge>
      </div>

      {schedules.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No active schedules found. Ask an admin to add schedules first.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {schedules.map((schedule) => {
            const saved = assignmentBySchedule.get(schedule.id)
            const selection = getSelection(schedule.id)
            const isDirty =
              selection.bus_id !== (saved?.bus_id ?? null) ||
              selection.driver_id !== (saved?.driver_id ?? null)
            const isSaving = savingScheduleId === schedule.id && isPending

            return (
              <Card
                key={schedule.id}
                className={
                  saved ? 'border-green-200 bg-green-50/40' : 'border-slate-200'
                }
              >
                <CardContent className="p-4 space-y-3">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {saved ? (
                        <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                      ) : (
                        <Circle className="h-5 w-5 text-slate-300 shrink-0" />
                      )}
                      <div>
                        <span className="font-semibold text-slate-900">
                          Schedule {schedule.schedule_number}
                        </span>
                        {schedule.return_code && (
                          <span className="ml-2 text-xs px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {schedule.return_code}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500 whitespace-nowrap">
                      {schedule.total_km} km
                    </span>
                  </div>

                  {/* Trips — all shown with time + route/stations */}
                  {schedule.schedule_trips.length > 0 && (
                    <div className="space-y-1">
                      {schedule.schedule_trips.map((trip) => (
                        <div
                          key={trip.id}
                          className="flex items-center gap-1.5 text-xs text-slate-600"
                        >
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          <span className="font-mono font-medium text-slate-700">
                            {formatTime(trip.start_time)}
                          </span>
                          <span>·</span>
                          <span>{trip.route_name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Bus + Driver selects */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="grid gap-1.5">
                      <Label className="text-xs text-slate-600">Bus</Label>
                      <Select
                        value={selection.bus_id}
                        onValueChange={(value) =>
                          setSelection(schedule.id, { bus_id: value as string | null })
                        }
                      >
                        <SelectTrigger className="w-full" disabled={isSaving}>
                          <SelectValue>
                            {() => {
                              const bus = selection.bus_id
                                ? busById.get(selection.bus_id)
                                : null
                              return bus ? (
                                <span className="font-mono">{bus.bus_number}</span>
                              ) : (
                                <span className="text-muted-foreground">Select bus</span>
                              )
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {buses.map((bus) => {
                            const usedBy = usedBuses.get(bus.id)
                            const usedElsewhere = usedBy && usedBy !== schedule.id
                            return (
                              <SelectItem key={bus.id} value={bus.id}>
                                <span className="font-mono">{bus.bus_number}</span>
                                {usedElsewhere && (
                                  <span className="text-xs text-amber-600">assigned</span>
                                )}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-1.5">
                      <Label className="text-xs text-slate-600">Driver</Label>
                      <Select
                        value={selection.driver_id}
                        onValueChange={(value) =>
                          setSelection(schedule.id, { driver_id: value as string | null })
                        }
                      >
                        <SelectTrigger className="w-full" disabled={isSaving}>
                          <SelectValue>
                            {() => {
                              const driver = selection.driver_id
                                ? driverById.get(selection.driver_id)
                                : null
                              return driver ? (
                                <span>
                                  {driver.batch_number} · {driver.name}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">Select driver</span>
                              )
                            }}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {drivers.map((driver) => {
                            const usedBy = usedDrivers.get(driver.id)
                            const usedElsewhere = usedBy && usedBy !== schedule.id
                            return (
                              <SelectItem key={driver.id} value={driver.id}>
                                <span>
                                  {driver.batch_number} · {driver.name}
                                </span>
                                {usedElsewhere && (
                                  <span className="text-xs text-amber-600">assigned</span>
                                )}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2">
                    {saved && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={isPending}
                        onClick={() =>
                          setAssignmentToDelete({
                            assignment: saved,
                            scheduleNumber: schedule.schedule_number,
                          })
                        }
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                    <Button
                      size="sm"
                      onClick={() => handleSave(schedule)}
                      disabled={
                        isSaving || !isDirty || !selection.bus_id || !selection.driver_id
                      }
                    >
                      {isSaving ? 'Saving...' : saved ? 'Update' : 'Save'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      <AlertDialog
        open={!!assignmentToDelete}
        onOpenChange={(open) => !open && setAssignmentToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove assignment?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove the bus and driver assignment for schedule{' '}
              <span className="font-semibold">
                {assignmentToDelete?.scheduleNumber}
              </span>{' '}
              on {format(parseISO(date), 'MMM d, yyyy')}. The driver will be marked absent
              unless they have another duty on this date.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {isPending ? 'Removing...' : 'Remove'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
