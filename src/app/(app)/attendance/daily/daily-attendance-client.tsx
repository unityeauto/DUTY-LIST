'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { CheckCircle2, XCircle, Users } from 'lucide-react'
import type { DailyAttendanceRow } from '@/lib/queries/attendance'

type Props = {
  date: string
  rows: DailyAttendanceRow[]
}

export default function DailyAttendanceClient({ date, rows }: Props) {
  const router = useRouter()
  const [filter, setFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'present' | 'absent'>('all')

  const presentCount = rows.filter((r) => r.present).length
  const absentCount = rows.length - presentCount

  const filteredRows = useMemo(() => {
    const q = filter.trim().toLowerCase()
    return rows.filter((r) => {
      if (statusFilter === 'present' && !r.present) return false
      if (statusFilter === 'absent' && r.present) return false
      if (!q) return true
      return (
        r.batch_number.toLowerCase().includes(q) || r.name.toLowerCase().includes(q)
      )
    })
  }, [rows, filter, statusFilter])

  function handleDateChange(newDate: string) {
    if (!newDate) return
    router.push(`/attendance/daily?date=${newDate}`)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Attendance</h1>
          <p className="text-sm text-slate-600 mt-1">
            {format(parseISO(date), 'EEEE, MMMM d, yyyy')} — derived from duty assignments
          </p>
        </div>
        <div className="flex items-end gap-3">
          <Link
            href={`/attendance/monthly?month=${date.slice(0, 7)}`}
            className="text-sm text-blue-600 hover:text-blue-700 font-medium pb-2"
          >
            Monthly view →
          </Link>
          <div className="grid gap-1.5">
            <Label htmlFor="attendance-date">Date</Label>
            <Input
              id="attendance-date"
              type="date"
              value={date}
              onChange={(e) => handleDateChange(e.target.value)}
              className="w-44"
            />
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-50">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{rows.length}</p>
              <p className="text-xs text-slate-500">Drivers</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-50">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{presentCount}</p>
              <p className="text-xs text-slate-500">Present</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 rounded-lg bg-red-50">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900">{absentCount}</p>
              <p className="text-xs text-slate-500">Absent</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Input
          placeholder="Search by batch number or name..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="sm:max-w-xs"
        />
        <Tabs
          value={statusFilter}
          onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="present">Present</TabsTrigger>
            <TabsTrigger value="absent">Absent</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Batch No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="hidden sm:table-cell">Schedule</TableHead>
                <TableHead className="hidden sm:table-cell">Bus</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                    No drivers found.
                  </TableCell>
                </TableRow>
              ) : (
                filteredRows.map((row) => (
                  <TableRow key={row.driver_id}>
                    <TableCell className="font-medium">{row.batch_number}</TableCell>
                    <TableCell>
                      {row.name}
                      {!row.is_active && (
                        <Badge variant="secondary" className="ml-2 text-xs">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {row.present ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-100">
                          Present
                        </Badge>
                      ) : (
                        <Badge className="bg-red-100 text-red-700 hover:bg-red-100">
                          Absent
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {row.schedule_number ?? '—'}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell font-mono text-sm">
                      {row.bus_number ?? '—'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
