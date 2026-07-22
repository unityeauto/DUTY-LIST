'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { toPng, toJpeg } from 'html-to-image'
import { toast } from 'sonner'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Download, Share2, ImageIcon } from 'lucide-react'
import type { DailyReportData } from '@/lib/queries/reports'

type Props = { report: DailyReportData }

function formatTime(time: string) {
  return time.slice(0, 5)
}

export default function ReportExportClient({ report }: Props) {
  const router = useRouter()
  const reportRef = useRef<HTMLDivElement>(null)
  const [busy, setBusy] = useState(false)

  const displayDate = format(parseISO(report.date), 'EEEE, dd MMMM yyyy')
  const fileBase = `duty-report-${report.date}`

  function handleDateChange(newDate: string) {
    if (!newDate) return
    router.push(`/report-export?date=${newDate}`)
  }

  async function renderImage(type: 'png' | 'jpeg'): Promise<Blob | null> {
    if (!reportRef.current) return null
    const options = {
      pixelRatio: 2,
      backgroundColor: '#ffffff',
      cacheBust: true,
    }
    const dataUrl =
      type === 'png'
        ? await toPng(reportRef.current, options)
        : await toJpeg(reportRef.current, { ...options, quality: 0.92 })
    const res = await fetch(dataUrl)
    return res.blob()
  }

  async function handleDownload(type: 'png' | 'jpeg') {
    setBusy(true)
    try {
      const blob = await renderImage(type)
      if (!blob) return
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${fileBase}.${type === 'png' ? 'png' : 'jpg'}`
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Report image downloaded')
    } catch {
      toast.error('Failed to generate image')
    } finally {
      setBusy(false)
    }
  }

  async function handleShare() {
    setBusy(true)
    try {
      const blob = await renderImage('png')
      if (!blob) return
      const file = new File([blob], `${fileBase}.png`, { type: 'image/png' })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: `Duty Report ${report.date}`,
          text: `Volvo Bus Duty Allocation — ${displayDate}`,
        })
      } else {
        // Fallback: download instead
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `${fileBase}.png`
        a.click()
        URL.revokeObjectURL(url)
        toast.info('Sharing not supported on this device — image downloaded instead.')
      }
    } catch (err) {
      // User cancelling the share sheet is not an error
      if (err instanceof Error && err.name !== 'AbortError') {
        toast.error('Failed to share report')
      }
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-900">Export Report</h1>
          <p className="text-sm text-slate-600 mt-1">
            Generate a shareable image of the daily duty allocation
          </p>
        </div>
        <div className="grid gap-1.5">
          <Label htmlFor="export-date">Date</Label>
          <Input
            id="export-date"
            type="date"
            value={report.date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="w-44"
          />
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleShare} disabled={busy || report.rows.length === 0}>
          <Share2 className="h-4 w-4 mr-2" />
          Share to WhatsApp
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownload('png')}
          disabled={busy || report.rows.length === 0}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PNG
        </Button>
        <Button
          variant="outline"
          onClick={() => handleDownload('jpeg')}
          disabled={busy || report.rows.length === 0}
        >
          <ImageIcon className="h-4 w-4 mr-2" />
          Download JPG
        </Button>
      </div>

      {report.rows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-slate-500">
            No duty assignments for {displayDate}.
            <br />
            Assign duties first, then come back to export the report.
          </CardContent>
        </Card>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-slate-200 shadow-sm">
          {/* The exported report — deep navy header echoing the original Excel sheet */}
          <div ref={reportRef} className="bg-white min-w-175 w-fit mx-auto">
            <div className="bg-[#1e3a5f] text-white px-6 py-4 text-center">
              <h2 className="text-xl font-bold tracking-wide">
                VOLVO BUS DUTY ALLOCATION
              </h2>
              <p className="text-sm text-blue-100 mt-1">{displayDate}</p>
            </div>
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-slate-100 text-slate-700">
                  <th className="border border-slate-300 px-3 py-2 text-left">Sch. No.</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Trips</th>
                  <th className="border border-slate-300 px-3 py-2 text-right">KM</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Driver</th>
                  <th className="border border-slate-300 px-3 py-2 text-left">Bus No.</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Diesel</th>
                  <th className="border border-slate-300 px-3 py-2 text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {report.rows.map((row) => (
                  <tr key={row.schedule_number} className="even:bg-slate-50">
                    <td className="border border-slate-300 px-3 py-2 font-semibold whitespace-nowrap">
                      {row.schedule_number}
                    </td>
                    <td className="border border-slate-300 px-3 py-2">
                      {row.trips.length === 0 ? (
                        <span className="text-slate-400">—</span>
                      ) : (
                        <div className="space-y-0.5">
                          {row.trips.map((trip) => (
                            <div key={trip.trip_sequence} className="whitespace-nowrap">
                              <span className="font-mono text-xs">
                                {formatTime(trip.start_time)}
                              </span>{' '}
                              <span className="text-slate-700">{trip.route_name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 text-right whitespace-nowrap">
                      {row.total_km}
                    </td>
                    <td className="border border-slate-300 px-3 py-2 whitespace-nowrap">
                      <div className="font-medium">{row.driver_batch}</div>
                      <div className="text-xs text-slate-600">{row.driver_name}</div>
                    </td>
                    <td className="border border-slate-300 px-3 py-2 font-mono whitespace-nowrap">
                      {row.bus_number.split('-').pop()}
                    </td>
                    {/* Diesel is recorded by hand after refuelling — left blank on purpose */}
                    <td className="border border-slate-300 px-3 py-2 min-w-16" />
                    {/* Date is filled in by hand after printing — left blank on purpose */}
                    <td className="border border-slate-300 px-3 py-2 min-w-24" />
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-semibold">
                  <td className="border border-slate-300 px-3 py-2" colSpan={2}>
                    Total — {report.rows.length} duties
                  </td>
                  <td className="border border-slate-300 px-3 py-2 text-right">
                    {report.rows
                      .reduce((sum, r) => sum + Number(r.total_km), 0)
                      .toFixed(1)}
                  </td>
                  <td className="border border-slate-300 px-3 py-2" colSpan={4} />
                </tr>
              </tfoot>
            </table>
            <div className="px-6 py-2 text-center text-xs text-slate-400">
              Generated by Volvo Duty Manager
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
