import { getSchedules } from '@/lib/actions/schedules'
import SchedulesClient from './schedules-client'

export default async function SchedulesPage() {
  const schedules = await getSchedules()

  return (
    <div className="p-4 md:p-8">
      <SchedulesClient initialSchedules={schedules} />
    </div>
  )
}
