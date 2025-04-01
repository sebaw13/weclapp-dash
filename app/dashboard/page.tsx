"use client";

import { useEffect, useState } from "react";
import SalesChart from "@/components/sales-chart";
import { InfoIcon } from "lucide-react";

export default function DashboardPage() {
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/api/weclapp/sales-by-category");
      const { orders } = await res.json();

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
    };

    fetchData();
  }, []);

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Erste Zeile: 2 Spalten */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Chart 1 */}
        <div className="bg-card p-4 rounded-2xl shadow-md">
          <div className="flex items-center gap-2 mb-4 text-muted-foreground text-sm">
            <InfoIcon size={16} />
            <span>Rösteiumsätze pro Tag</span>
          </div>
          <SalesChart chartData={chartData} />
        </div>

        {/* Chart 2 */}
        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground">
          <p className="text-sm">☕️ Weitere Analyse</p>
        </div>
      </div>

      {/* Zweite Zeile: 3 Spalten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground">
          <p className="text-sm">📦 Platzhalter 1</p>
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
