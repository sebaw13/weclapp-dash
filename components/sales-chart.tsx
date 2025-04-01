"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

// Funktion zum Hinzufügen eines Tages zum Datum und Formatierung als DD.MM.YYYY
const addOneDay = (date: string): string => {
  const newDate = new Date(date);
  newDate.setDate(newDate.getDate() + 1); // Einen Tag hinzufügen

  const day = String(newDate.getDate()).padStart(2, "0"); // Tag mit führender Null
  const month = String(newDate.getMonth() + 1).padStart(2, "0"); // Monat mit führender Null
  const year = newDate.getFullYear();

  return `${day}.${month}.${year}`; // Datum im Format DD.MM.YYYY zurückgeben
};

// Funktion zur Formatierung der Werte
const formatCurrency = (value: number): string => {
  return `${value.toFixed(2)} €`; // Auf zwei Dezimalstellen runden und Euro-Zeichen hinzufügen
};

type Props = {
  chartData: {
    date: string;
    [category: string]: number | string;
  }[];
};

const shadcnPalette = [
  "#4f46e5", // indigo-600
  "#16a34a", // green-600
  "#f59e0b", // amber-500
  "#ec4899", // pink-500
  "#0ea5e9", // sky-500
  "#8b5cf6", // violet-500
  "#f43f5e", // rose-500
];

export default function SalesChart({ chartData }: Props) {
  // Alle Kategorien zuverlässig über alle Daten hinweg extrahieren
  const categories = Array.from(
    new Set(
      chartData.flatMap((entry) =>
        Object.keys(entry).filter((key) => key !== "date")
      )
    )
  );

  // Datum um einen Tag erhöhen und im gewünschten Format formatieren, bevor die Daten an das Diagramm übergeben werden
  const modifiedData = chartData.map((entry) => ({
    ...entry,
    date: addOneDay(entry.date), // Hier wird das Datum geändert und formatiert
  }));

  const { resolvedTheme } = useTheme();

  return (
    <ResponsiveContainer width="100%" height={500}>
      <BarChart data={modifiedData} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
        <XAxis
          dataKey="date"
          stroke={resolvedTheme === "dark" ? "#d1d5db" : "#374151"}
          tickFormatter={(value) => value} // Wert wird jetzt im gewünschten Format angezeigt
        />
        <YAxis 
          stroke={resolvedTheme === "dark" ? "#d1d5db" : "#374151"} 
          tickFormatter={formatCurrency} // Formatierung der Y-Achsen-Werte
        />
        <Tooltip
          contentStyle={{
            backgroundColor: resolvedTheme === "dark" ? "#1f2937" : "#fff",
            borderColor: resolvedTheme === "dark" ? "#4b5563" : "#e5e7eb",
            borderRadius: 8,
          }}
          labelStyle={{ fontWeight: "bold" }}
          formatter={(value) => formatCurrency(value as number)} // Formatierung der Tooltip-Werte
        />
        <Legend />
        {categories.map((cat, i) => (
          <Bar
            key={cat}
            dataKey={cat}
            stackId="a"
            fill={shadcnPalette[i % shadcnPalette.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
