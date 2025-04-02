"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, getMonth, getYear, addMonths } from "date-fns";

interface Movement {
  id: string;
  articleId: string;
  articleNumber: string;
  name: string;
  batchNumber: string;
  createdDate: number;
  movementNumber: string;
  postingDate: number;
  productionOrderId: string;
  quantity: string;
  valuationPrice: string;
}

interface MonthlyData {
  [key: string]: number;
}

interface ForecastData {
  articleId: string;
  articleNumber: string;
  name: string;
  monthly: MonthlyData;
  forecast: MonthlyData;
}

const getMonthKey = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, "0")}`;
};

const getAllMonthKeysSinceJan2024 = () => {
  const keys: string[] = [];
  const start = new Date("2024-01-01");
  const now = new Date();

  let current = new Date(start);
  while (current <= now) {
    keys.push(`${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, "0")}`);
    current.setMonth(current.getMonth() + 1);
  }
  return keys.reverse();
};

const getNextThreeMonths = () => {
  const months: string[] = [];
  const now = new Date();
  for (let i = 0; i < 3; i++) {
    const next = addMonths(now, i);
    months.push(`${next.getFullYear()}-${String(next.getMonth() + 1).padStart(2, "0")}`);
  }
  return months;
};

const holtWintersForecast = (data: number[], alpha = 0.2, beta = 0.1, gamma = 0.1, seasonLength = 12, forecastPeriods = 3) => {
  const level: number[] = [];
  const trend: number[] = [];
  const seasonals: number[] = [];
  const forecast: number[] = [];

  // Initial values
  const seasonAvg = data.slice(0, seasonLength);
  const seasonMean = seasonAvg.reduce((a, b) => a + b, 0) / seasonAvg.length;
  for (let i = 0; i < seasonLength; i++) {
    seasonals.push(data[i] / seasonMean);
  }
  level[seasonLength - 1] = seasonMean;
  trend[seasonLength - 1] = (data[seasonLength] - data[0]) / seasonLength;

  for (let t = seasonLength; t < data.length; t++) {
    const lastLevel = level[t - 1];
    const lastTrend = trend[t - 1];
    const seasonal = seasonals[t % seasonLength];
    const value = data[t];

    const newLevel = alpha * (value / seasonal) + (1 - alpha) * (lastLevel + lastTrend);
    const newTrend = beta * (newLevel - lastLevel) + (1 - beta) * lastTrend;
    const newSeasonal = gamma * (value / newLevel) + (1 - gamma) * seasonal;

    level[t] = newLevel;
    trend[t] = newTrend;
    seasonals[t % seasonLength] = newSeasonal;
  }

  const lastLevel = level[level.length - 1];
  const lastTrend = trend[trend.length - 1];

  for (let i = 1; i <= forecastPeriods; i++) {
    const seasonal = seasonals[(data.length + i - 1) % seasonLength];
    forecast.push((lastLevel + i * lastTrend) * seasonal);
  }

  return forecast;
};

const WipRoestkaffeeForecasts: React.FC = () => {
  const [data, setData] = useState<ForecastData[]>([]);
  const [loading, setLoading] = useState(true);
  const months = getAllMonthKeysSinceJan2024();
  const forecastMonths = getNextThreeMonths();

  useEffect(() => {
    fetch("/api/weclapp/verbrauch/wip-roestkaffee")
      .then((res) => res.json())
      .then((json) => {
        const filtered = json.data.filter((m: Movement) => new Date(m.postingDate).getFullYear() >= 2024);

        const grouped: { [key: string]: ForecastData } = {};

        for (const movement of filtered) {
          const quantity = parseFloat(movement.quantity) * -1;
          const monthKey = getMonthKey(movement.postingDate);

          if (!grouped[movement.articleId]) {
            grouped[movement.articleId] = {
              articleId: movement.articleId,
              articleNumber: movement.articleNumber,
              name: movement.name,
              monthly: {},
              forecast: {}
            };
          }

          grouped[movement.articleId].monthly[monthKey] =
            (grouped[movement.articleId].monthly[monthKey] || 0) + quantity;
        }

        Object.values(grouped).forEach((item) => {
          const orderedKeys = Object.keys(item.monthly).sort();
          const pastValues = orderedKeys.map((key) => item.monthly[key]);

          if (pastValues.length >= 12) {
            const forecast = holtWintersForecast(pastValues);
            forecastMonths.forEach((monthKey, idx) => {
              item.forecast[monthKey] = parseFloat(forecast[idx]?.toFixed(2) || "0");
            });
          }
        });

        setData(Object.values(grouped));
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Daten:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Lade Daten...</div>;

  return (
    <div className="m-4 overflow-x-auto">
      <Card className="w-full max-w-full">
        <CardContent>
          <h2 className="text-xl font-bold mb-4">WIP Röstkaffee Forecasts nach Monat (seit 01/2024)</h2>
          <div className="overflow-x-auto">
            <Table className="min-w-fit">
              <TableHeader>
                <TableRow>
                  <TableHead className="sticky left-0 bg-white z-10">Artikel</TableHead>
                  {forecastMonths.map((month) => (
                    <TableHead key={month} className="whitespace-nowrap text-blue-600">Prognose {month}</TableHead>
                  ))}
                  {months.map((month) => (
                    <TableHead key={month} className="whitespace-nowrap">{month}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item) => (
                  <TableRow key={item.articleId}>
                    <TableCell className="sticky left-0 bg-white z-10 whitespace-nowrap">
                      <div className="font-semibold">{item.articleNumber}</div>
                      <div className="text-sm text-muted-foreground">{item.name}</div>
                    </TableCell>
                    {forecastMonths.map((month) => (
                      <TableCell key={month} className="whitespace-nowrap text-blue-600">
                        {item.forecast[month]?.toFixed(2) || "-"}
                      </TableCell>
                    ))}
                    {months.map((month) => (
                      <TableCell key={month} className="whitespace-nowrap">
                        {item.monthly[month]?.toFixed(2) || "-"}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WipRoestkaffeeForecasts;