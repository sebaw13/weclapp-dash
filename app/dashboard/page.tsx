"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { InfoIcon } from "lucide-react";
import SalesChart from "@/components/sales-chart";
import { useEffect, useState } from "react";

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
      console.log("📊 Chart Data Preview", data);

      setChartData(data);
    };

    fetchData();
  }, []);

  return (
    <div className="flex-1 w-full flex flex-col gap-8 px-4 items-start">
      {/* Hinweis und Info-Bereich */}
      <div className="w-full max-w-6xl">
        <div className="bg-muted text-sm p-4 rounded-md text-muted-foreground flex gap-3 items-center">
          <InfoIcon size={16} />
          <span>Rösteiumsätze pro Tag</span>
        </div>
      </div>

      {/* SalesChart unterhalb der Navbar und links ausgerichtet */}
      <div className="w-full max-w-5xl mt-4">
        <SalesChart chartData={chartData} />
      </div>
    </div>
  );
}
