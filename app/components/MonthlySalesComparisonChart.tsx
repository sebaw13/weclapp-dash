// === Frontend Component ===
"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function MonthlySalesComparisonChart() {
  const { resolvedTheme } = useTheme();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/weclapp/sales-by-month")
      .then((res) => res.json())
      .then(({ data }) => setData(data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center">
        📊 Monatsvergleich wird geladen ...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="text-muted-foreground text-sm py-12 text-center">
        ⚠️ Keine Daten verfügbar
      </div>
    );
  }

  return (
    <div className="w-full">
      <div style={{ width: "100%", height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 16, right: 24, bottom: 32, left: 64 }}
            barGap={8}
            barCategoryGap={60}
          >
            <XAxis
              dataKey="month"
              stroke={resolvedTheme === "dark" ? "#d1d5db" : "#374151"}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              stroke={resolvedTheme === "dark" ? "#d1d5db" : "#374151"}
              tickFormatter={(v) => `${v.toFixed(0)} €`}
            />
            <Tooltip
              formatter={(value, name, { payload }) => {
                let suffix = "";
                if (name === "2025") {
                  suffix = ` (${payload.changeTo2024?.toFixed(1) ?? "-"}% vs. 2024, ${payload.changeTo2023?.toFixed(1) ?? "-"}% vs. 2023)`;
                } else if (name === "2024") {
                  suffix = ` (${payload.change2024to2023?.toFixed(1) ?? "-"}% vs. 2023)`;
                }
              
                const formattedValue =
                  typeof value === "number" ? `${value.toFixed(2)} €` : `${value} €`;
              
                return [`${formattedValue}${suffix}`, `Umsatz ${name}`];
              }}              
              labelFormatter={(label) => `Monat: ${label}`}
              contentStyle={{
                backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#fff",
                color: resolvedTheme === "dark" ? "#f9fafb" : "#111827",
                borderRadius: 8,
              }}
            />
            <Legend />
            <Bar dataKey="2023" fill="#d1d5db" name="Umsatz 2023" barSize={18} />
            <Bar dataKey="2024" fill="#a1a1aa" name="Umsatz 2024" barSize={18} />
            <Bar dataKey="2025" fill="#4f46e5" name="Umsatz 2025" barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}