'use client'

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { format } from 'date-fns'

type AttendanceData = {
  date: string
  present: number
}

export default function AttendanceChart({ data }: { data: AttendanceData[] }) {
  const chartData = data.map((item) => ({
    ...item,
    dateLabel: format(new Date(item.date), 'MMM dd'),
  }))

  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="dateLabel"
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <YAxis
          stroke="#64748b"
          style={{ fontSize: '12px' }}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#fff',
            border: '1px solid #e2e8f0',
            borderRadius: '6px',
            fontSize: '14px',
          }}
          labelStyle={{ fontWeight: 600, marginBottom: '4px' }}
        />
        <Line
          type="monotone"
          dataKey="present"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6 }}
          name="Present Drivers"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
