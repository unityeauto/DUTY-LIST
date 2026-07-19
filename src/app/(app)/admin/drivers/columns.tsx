'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { MoreHorizontal, Pencil, Power, Trash2 } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export type Driver = {
  id: string
  batch_number: string
  name: string
  mobile: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export const columns: ColumnDef<Driver>[] = [
  {
    accessorKey: 'batch_number',
    header: 'Batch Number',
    cell: ({ row }) => (
      <span className="font-medium font-mono">{row.getValue('batch_number')}</span>
    ),
  },
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <span className="font-medium">{row.getValue('name')}</span>
    ),
  },
  {
    accessorKey: 'mobile',
    header: 'Mobile',
    cell: ({ row }) => {
      const mobile = row.getValue('mobile') as string | null
      return mobile ? <span className="font-mono text-sm">{mobile}</span> : (
        <span className="text-slate-400 text-sm">—</span>
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
      const driver = row.original
      const meta = table.options.meta as {
        onEdit: (driver: Driver) => void
        onToggleStatus: (driver: Driver) => void
        onDelete: (driver: Driver) => void
      }

      return (
        <DropdownMenu>
          <DropdownMenuTrigger>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => meta.onEdit(driver)}>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => meta.onToggleStatus(driver)}>
              <Power className="mr-2 h-4 w-4" />
              {driver.is_active ? 'Deactivate' : 'Activate'}
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => meta.onDelete(driver)}
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
