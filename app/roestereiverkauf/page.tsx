"use client";

import { useEffect, useState } from "react";
import SalesChart from "@/app/components/sales-chart";
import WeekendSalesChart from "@/app/components/WeekendSalesChart";
import MonthlySalesComparisonChart from "@/app/components/MonthlySalesComparisonChart";
import { InfoIcon } from "lucide-react";

export default function RoestereiVerkaufPage() {
  const [chartData, setChartData] = useState<any[]>([]);
  const [weekendData, setWeekendData] = useState<any[]>([]);

  useEffect(() => {
    // Tagesbasierte Daten
    fetch("/api/weclapp/sales-by-category")
      .then((res) => res.json())
      .then(({ orders }) => {
        const chartDataMap: Record<string, Record<string, number>> = {};
        for (const order of orders) {
          const date = order.date;
          for (const item of order.items) {
            const category = item.category;
            const net = parseFloat(item.netAmount);
            if (!chartDataMap[date]) chartDataMap[date] = {};
            if (!chartDataMap[date][category]) chartDataMap[date][category] = 0;
            chartDataMap[date][category] += net;
          }
        }
        const data = Object.entries(chartDataMap).map(([date, categories]) => ({
          date,
          ...categories,
        }));
        setChartData(data);
      });

    // Wochenbasierte Daten (nur Fr & Sa)
    fetch("/api/weclapp/sales-by-weekend")
      .then((res) => res.json())
      .then(({ data }) => setWeekendData(data));
  }, []);

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Erste Zeile: 2 Spalten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1 – Tagesumsätze */}
        <div className="bg-card p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
            <InfoIcon size={16} />
            <span>Rösteiumsätze pro Tag</span>
          </div>
          <SalesChart chartData={chartData} />
        </div>

        {/* Chart 2 – Wochenumsatz (Fr & Sa) */}
        <div className="bg-card p-4 rounded-2xl shadow-md">
          <div className="text-muted-foreground text-sm mb-4">
            📆 Wochenumsatz (Fr & Sa)
          </div>
          <WeekendSalesChart data={weekendData} />
        </div>
      </div>

      {/* Zweite Zeile: 3 Spalten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chart 3 – Monatsvergleich */}
        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground col-span-1 xl:col-span-1">
          <div className="text-sm mb-4 font-medium">📅 Monatsvergleich (aktuell vs. Vorjahr)</div>
          <MonthlySalesComparisonChart />
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground">
          <p className="text-sm">📈 Platzhalter 2</p>
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground">
          <p className="text-sm">📊 Platzhalter 3</p>
        </div>
      </div>
    </div>
  );
}