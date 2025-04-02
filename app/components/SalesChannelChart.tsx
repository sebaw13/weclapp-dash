"use client"

import { useEffect, useState } from "react"
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts"

// Farbpalette für Sales Channels (7 Farben für 7 Channels)
const channelColors = [
  "#8884d8", // GROSS1
  "#82ca9d", // ONLINE
  "#ff7300", // POS
  "#d0ed57", // GROSS2
  "#ff5c8d", // WEB
  "#ffc658", // DISTRIBUTION
  "#8dd1e1", // INTERNATIONAL
]

export function SalesChannelChart() {
  const [data, setData] = useState<any[]>([])

  useEffect(() => {
    async function fetchData() {
      const res = await fetch("/api/weclapp/salesInvoice/channels")
      const json = await res.json()
      setData(json)
    }
    fetchData()
  }, [])

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-2">Umsatz pro Sales-Channel</h2>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
        >
          <defs>
            {data.length > 0 &&
              Object.keys(data[0])
                .filter((key) => key !== "month")
                .map((channel, index) => (
                  <linearGradient
                    key={channel}
                    id={`color${channel}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor={channelColors[index]} stopOpacity={0.8} />
                    <stop offset="95%" stopColor={channelColors[index]} stopOpacity={0} />
                  </linearGradient>
                ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#ddd" />
          <XAxis dataKey="month" />
          <YAxis domain={['auto', 'auto']} />
          <Tooltip
            formatter={(value: number) => value.toFixed(2)} // Rundet die Werte im Tooltip
            labelFormatter={(label) => label} // Monat bleibt im Tooltip
          />
          {data.length > 0 &&
            Object.keys(data[0])
              .filter((key) => key !== "month")
              .map((channel, index) => (
                <Area
                  key={channel}
                  type="monotone"
                  dataKey={channel}
                  stackId="a" // Stacked Chart
                  stroke={channelColors[index]} // Farbe für den Kanal
                  fillOpacity={0.5} // Transparenz für die Flächen
                  fill={`url(#color${channel})`} // Füllen mit Gradient
                  strokeWidth={2} // Weniger dicke Linien
                />
              ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
