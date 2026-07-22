'use client'

import * as React from 'react'
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  TableMeta,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export type DataTableFilter = {
  /** Column id to filter on — must match a column with `accessorKey`/`id` */
  columnId: string
  placeholder: string
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  meta?: TableMeta<TData>
  /** Text filter inputs to render above the table */
  filters?: DataTableFilter[]
}

export function DataTable<TData, TValue>({
  columns,
  data,
  meta,
  filters = [],
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
    meta,
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4 flex-wrap">
        {table.getColumn('name') && (
          <Input
            placeholder="Filter by name..."
            value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('name')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        {table.getColumn('batch_number') && (
          <Input
            placeholder="Filter by batch number..."
            value={(table.getColumn('batch_number')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('batch_number')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        {table.getColumn('bus_number') && (
          <Input
            placeholder="Filter by bus number..."
            value={(table.getColumn('bus_number')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('bus_number')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
        {table.getColumn('schedule_number') && (
          <Input
            placeholder="Filter by schedule number..."
            value={(table.getColumn('schedule_number')?.getFilterValue() as string) ?? ''}
            onChange={(event) =>
              table.getColumn('schedule_number')?.setFilterValue(event.target.value)
            }
            className="max-w-sm"
          />
        )}
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
