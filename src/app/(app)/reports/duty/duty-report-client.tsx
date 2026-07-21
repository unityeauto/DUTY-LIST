'use client'

import { useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Download, FileText } from 'lucide-react'
import type { DutyReportRow } from '@/lib/queries/reports'

type Props = {
  from: string
  to: string
  driverId: string | null
  scheduleId: string | null
  rows: DutyReportRow[]
  drivers: { id: string; batch_number: string; name: string }[]
  schedules: { id: string; schedule_number: string }[]
}

export default function DutyReportClient({
  from,
  to,
  driverId,
  scheduleId,
  rows,
  drivers,
  schedules,
}: Props) {
  const router = useRouter()

  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers])
  const scheduleById = useMemo(() => new Map(schedules.map((s) => [s.id, s])), [schedules])

  const totalKm = useMemo(
    () => rows.reduce((sum, r) => sum + Number(r.total_km), 0),
    [rows]
  )

  function navigate(next: {
    from?: string
    to?: string
    driver?: string | null
    schedule?: string | null
  }) {
    const params = new URLSearchParams()
    params.set('from', next.from ?? from)
    params.set('to', next.to ?? to)
    const d = next.driver === undefined ? driverId : next.driver
    const s = next.schedule === undefined ? scheduleId : next.schedule
    if (d) params.set('driver', d)
    if (s) params.set('schedule', s)
    router.push(`/reports/duty?${params.toString()}`)
  }

  function exportCsv() {
    const header = [
      'Date',
      'Schedule',
      'Return Code',
      'Bus',
      'Driver Batch',
      'Driver Name',
      'KM',
    ]
    const lines = rows.map((r) =>
      [
        r.duty_date,
        r.schedule_number,
        r.return_code ?? '',
        r.bus_number,
        r.driver_batch,
        r.driver_name,
        r.total_km,
      ]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`)
        .join(',')
    )
    const csv = [header.join(','), ...lines].join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `duty-report-${from}-to-${to}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Duty Reports</h1>
          <p className="text-sm text-slate-600 mt-1">
            Filter duty assignments by date range, driver, or schedule
          </p>
        </div>
        <Button onClick={exportCsv} disabled={rows.length === 0}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="grid gap-1.5">
              <Label htmlFor="report-from">From</Label>
              <Input
                id="report-from"
                type="date"
                value={from}
                onChange={(e) => e.target.value && navigate({ from: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="report-to">To</Label>
              <Input
                id="report-to"
                type="date"
                value={to}
                onChange={(e) => e.target.value && navigate({ to: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Driver</Label>
              <Select
                value={driverId}
                onValueChange={(value) => navigate({ driver: value as string | null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() => {
                      const d = driverId ? driverById.get(driverId) : null
                      return d ? (
                        <span>
                          {d.batch_number} · {d.name}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">All drivers</span>
                      )
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All drivers</SelectItem>
                  {drivers.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.batch_number} · {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1.5">
              <Label>Schedule</Label>
              <Select
                value={scheduleId}
                onValueChange={(value) => navigate({ schedule: value as string | null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue>
                    {() => {
                      const s = scheduleId ? scheduleById.get(scheduleId) : null
                      return s ? (
                        <span>Schedule {s.schedule_number}</span>
                      ) : (
                        <span className="text-muted-foreground">All schedules</span>
                      )
                    }}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={null}>All schedules</SelectItem>
                  {schedules.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      Schedule {s.schedule_number}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <div className="flex flex-wrap gap-4 text-sm text-slate-600">
        <span>
          <span className="font-semibold text-slate-900">{rows.length}</span> assignments
        </span>
        <span>
          <span className="font-semibold text-slate-900">{totalKm.toFixed(1)}</span> total
          km
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="hidden sm:table-cell">Return Code</TableHead>
                <TableHead>Bus</TableHead>
                <TableHead>Driver</TableHead>
                <TableHead className="text-right hidden sm:table-cell">KM</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    <FileText className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    No assignments found for the selected filters.
                  </TableCell>
                </TableRow>
              ) : (
                rows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell className="whitespace-nowrap">
                      {format(parseISO(row.duty_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell className="font-medium">{row.schedule_number}</TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {row.return_code ?? '—'}
                    </TableCell>
                    <TableCell className="font-mono text-sm">{row.bus_number}</TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">{row.driver_batch}</div>
                      <div className="text-xs text-slate-500">{row.driver_name}</div>
                    </TableCell>
                    <TableCell className="text-right hidden sm:table-cell">
                      {row.total_km}
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
