import { getDailyReportData } from '@/lib/queries/reports'
import ReportExportClient from './report-export-client'

export const dynamic = 'force-dynamic'

export default async function ReportExportPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>
}) {
  const params = await searchParams
  const today = new Date().toISOString().split('T')[0]
  const date = params.date && /^\d{4}-\d{2}-\d{2}$/.test(params.date) ? params.date : today

  const report = await getDailyReportData(date)

  return <ReportExportClient report={report} />
}
