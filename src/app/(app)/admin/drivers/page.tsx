import { getDrivers } from '@/lib/actions/drivers'
import DriversClient from './drivers-client'

export default async function DriversPage() {
  const drivers = await getDrivers()

  return (
    <div className="p-4 md:p-8">
      <DriversClient initialDrivers={drivers} />
    </div>
  )
}
