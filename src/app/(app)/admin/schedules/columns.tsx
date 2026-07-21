'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Power, Trash2, Eye } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type ScheduleTrip = {
  id: string
  trip_sequence: number
  start_time: string
  route_name: string
}

export type Schedule = {
  id: string
  schedule_number: string
  return_code: string | null
  total_km: number
  is_active: boolean
  created_at: string
  updated_at: string
  schedule_trips: ScheduleTrip[]
}

export const columns: ColumnDef<Schedule>[] = [
  {
    accessorKey: 'schedule_number',
    header: 'Schedule Number',
    cell: ({ row }) => (
      <span className="font-medium font-mono">{row.getValue('schedule_number')}</span>
    ),
  },
  {
    accessorKey: 'return_code',
    header: 'Return Code',
    cell: ({ row }) => {
      const returnCode = row.getValue('return_code') as string | null
      return returnCode ? (
        <span className="font-mono text-sm">{returnCode}</span>
      ) : (
        <span className="text-slate-400 text-sm">—</span>
      )
    },
  },
  {
    accessorKey: 'total_km',
    header: 'Total KM',
    cell: ({ row }) => (
      <span className="font-mono text-sm">{row.getValue('total_km')} km</span>
    ),
  },
  {
    accessorKey: 'schedule_trips',
    header: 'Trips',
    cell: ({ row }) => {
      const trips = row.getValue('schedule_trips') as ScheduleTrip[]
      return (
        <span className="text-sm text-slate-600">{trips.length} trip(s)</span>
      )
    },
  },
  {
    accessorKey: 'is_active',
    header: 'Status',
    cell: ({ row }) => {
      const isActive = row.getValue('is_active') as boolean
      return (
        <Badge variant={isActive ? 'default' : 'secondary'}>
          {isActive ? 'Active' : 'Inactive'}
        </Badge>
      )
    },
  },
  {
    id: 'actions',
    cell: ({ row, table }) => {
      const schedule = row.original
      const meta = table.options.meta as {
        onView: (schedule: Schedule) => void
        onEdit: (schedule: Schedule) => void
        onToggleStatus: (schedule: Schedule) => void
        onDelete: (schedule: Schedule) => void
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.onView(schedule)}>
              <Eye className="mr-2 h-4 w-4" />
              View Trips
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onEdit(schedule)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onToggleStatus(schedule)}>
              <Power className="mr-2 h-4 w-4" />
              {schedule.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta.onDelete(schedule)}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
