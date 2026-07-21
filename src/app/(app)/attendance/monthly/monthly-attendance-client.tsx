'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { MonthlyAttendanceRow } from '@/lib/queries/attendance'

type Props = {
  month: string // YYYY-MM
  rows: MonthlyAttendanceRow[]
  daysInMonth: number
}

export default function MonthlyAttendanceClient({ month, rows, daysInMonth }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState('')

  const days = useMemo(
    () => Array.from({ length: daysInMonth }, (_, i) => i + 1),
    [daysInMonth]
  )

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase()
    if (!q) return rows
    return rows.filter(
      (r) => r.batch_number.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
    )
  }, [rows, filter])

  function handleMonthChange(newMonth: string) {
    if (!newMonth) return
    router.push(`/attendance/monthly?month=${newMonth}`)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
            Monthly Attendance
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            {format(parseISO(`${month}-01`), 'MMMM yyyy')} — days with an assigned duty
            count as Present
          </p>
        </div>
        <div className="flex items-end gap-3">
          <Link
            href="/attendance/daily"
            className="text-sm text-blue-600 hover:text-blue-700 font-medium pb-2"
          >
            ← Daily view
          </Link>
          <div className="grid gap-1.5">
            <Label htmlFor="attendance-month">Month</Label>
            <Input
              id="attendance-month"
              type="month"
              value={month}
              onChange={(e) => handleMonthChange(e.target.value)}
              className="w-44"
            />
          </div>
        </div>
      </div>

      <Input
        placeholder="Search by batch number or name..."
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="sm:max-w-xs"
      />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="sticky left-0 bg-white z-10 min-w-32">
                  Driver
                </TableHead>
                {days.map((d) => (
                  <TableHead key={d} className="text-center px-1 min-w-7 text-xs">
                    {d}
                  </TableHead>
                ))}
                <TableHead className="text-center min-w-16">Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={daysInMonth + 2}
                    className="text-center py-8 text-slate-500"
                  >
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => {
                  const presentSet = new Set(
                    row.presentDates.map((d) => Number(d.slice(8, 10)))
                  )
                  return (
                    <TableRow key={row.driver_id}>
                      <TableCell className="sticky left-0 bg-white z-10">
                        <div className="font-medium text-sm">{row.batch_number}</div>
                        <div className="text-xs text-slate-500 truncate max-w-32">
                          {row.name}
                        </div>
                      </TableCell>
                      {days.map((d) => (
                        <TableCell key={d} className="text-center px-1 py-2">
                          {presentSet.has(d) ? (
                            <span
                              className="inline-block h-2.5 w-2.5 rounded-full bg-green-500"
                              title={`Present on ${month}-${String(d).padStart(2, '0')}`}
                            />
                          ) : (
                            <span className="inline-block h-2.5 w-2.5 rounded-full bg-slate-200" />
                          )}
                        </TableCell>
                      ))}
                      <TableCell className="text-center font-semibold">
                        {row.presentDays}
                        <span className="text-xs text-slate-400 font-normal">
                          /{daysInMonth}
                        </span>
                      </TableCell>
                    </TableRow>
                  )
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
