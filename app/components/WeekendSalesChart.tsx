"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Line,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";
import { useMemo, useEffect } from "react";

type Props = {
  data: {
    week: string;
    total: number;
  }[];
};

// 📈 Gleitender Durchschnitt berechnen (6 Wochen)
function addMovingAverage(
  data: { week: string; total: number }[],
  windowSize: number = 6
) {
  return data.map((item, index) => {
    const window = data.slice(Math.max(0, index - windowSize + 1), index + 1);
    const sum = window.reduce((acc, val) => acc + val.total, 0);
    const avg = sum / window.length;
    return { ...item, trend: Number(avg.toFixed(2)) };
  });
}

// 🔢 Korrekte Sortierung "YYYY-KWXX"
const sortByWeekString = (data: { week: string; total: number }[]) => {
  return [...data].sort((a, b) => {
    // Überprüfe, ob 'week' gültig ist, bevor 'split' aufgerufen wird
    const weekA = a.week || "0000-KW00"; // Setze Standardwert für ungültige 'week'-Daten
    const weekB = b.week || "0000-KW00"; // Setze Standardwert für ungültige 'week'-Daten

    const [yearA, weekAValue] = weekA.split("-KW").map(Number);
    const [yearB, weekBValue] = weekB.split("-KW").map(Number);

    // Vergleiche zuerst das Jahr und dann die Woche
    return yearA !== yearB ? yearA - yearB : weekAValue - weekBValue;
  });
};

export default function WeekendSalesChart({ data }: Props) {
  const { resolvedTheme } = useTheme();

  const enrichedData = useMemo(() => {
    const sorted = sortByWeekString(data);
    const withTrend = addMovingAverage(sorted, 6);
    return withTrend;
  }, [data]);

  useEffect(() => {
    console.log("✅ Enriched Chart Data Preview", enrichedData.slice(0, 5));
  }, [enrichedData]);

  const chartWidth = Math.max(enrichedData.length * 20, 1000);

  return (
    <div className="w-full overflow-x-auto">
      <div style={{ minWidth: `${chartWidth}px`, height: "400px" }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={enrichedData}
            margin={{ top: 16, right: 24, bottom: 24, left: 64 }}
            barSize={14}
            barGap={2}
            barCategoryGap="10%"
          >
            <XAxis
              dataKey="week"
              stroke={resolvedTheme === "dark" ? "#d1d5db" : "#374151"}
              tick={{ fontSize: 10 }} // Entferne den `angle`
              interval={0}
              height={60}
              tickFormatter={(value) => value} // Optional, falls du das Format der `week`-Werte anpassen möchtest
              tickLine={false} // Optional, wenn du die Linie der Ticks verstecken möchtest
              style={{ transform: "rotate(-45deg)", transformOrigin: "bottom left" }} // Anwendung der Rotation
            />
            <YAxis
              stroke={resolvedTheme === "dark" ? "#d1d5db" : "#374151"}
              tickFormatter={(v) => `${v.toFixed(0)} €`}
            />
            <Tooltip
              labelStyle={{ fontWeight: "bold" }}
              formatter={(v: any, name: any) =>
                name === "trend"
                  ? [`${v.toFixed(2)} €`, "Trend (⌀6 Wochen)"]
                  : [`${v.toFixed(2)} €`, "Umsatz"]
              }
              contentStyle={{
                backgroundColor:
                  resolvedTheme === "dark" ? "#1f2937" : "#fff",
                borderRadius: 8,
                borderColor: "#888",
              }}
            />
            <Bar dataKey="total" fill="#4f46e5" name="Umsatz" />
            <Line
              type="monotone"
              dataKey="trend"
              stroke="#f59e0b"
              dot={false}
              strokeWidth={2}
              name="Trend (⌀)"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
