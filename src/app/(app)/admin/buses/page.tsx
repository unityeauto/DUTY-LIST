import { getBuses } from '@/lib/actions/buses'
import BusesClient from './buses-client'

export default async function BusesPage() {
  const buses = await getBuses()

  return (
    <div className="p-4 md:p-8">
      <BusesClient initialBuses={buses} />
    </div>
  )
}
