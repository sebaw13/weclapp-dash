"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { getMonth, getYear, addMonths } from "date-fns";

interface Movement {
  articleId: string;
  quantity: string;
  postingDate: number;
  articleNumber: string;
  name: string;
}

interface StockItem {
  articleId: string;
  articleNumber: string;
  name: string;
  stock: number;
}

interface ForecastItem {
  articleId: string;
  articleNumber: string;
  name: string;
  forecast: number;
  stock: number;
  need: number;
}

const getMonthKey = (timestamp: number) => {
  const date = new Date(timestamp);
  return `${getYear(date)}-${String(getMonth(date) + 1).padStart(2, "0")}`;
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

const holtWintersForecast = (data: number[], alpha = 0.2, beta = 0.1, gamma = 0.1, seasonLength = 12, forecastPeriods = 1) => {
  const level: number[] = [];
  const trend: number[] = [];
  const seasonals: number[] = [];
  const forecast: number[] = [];

  if (data.length < seasonLength + 1) return [0];

  const seasonAvg = data.slice(0, seasonLength);
  const seasonMean = seasonAvg.reduce((a, b) => a + b, 0) / seasonLength;
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

const WipRoestkaffeeBedarfsliste: React.FC = () => {
  const [items, setItems] = useState<ForecastItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/weclapp/verbrauch/wip-roestkaffee").then((res) => res.json()),
      fetch("/api/weclapp/lagerbestaende").then((res) => res.json()),
    ])
      .then(([verbrauchRes, bestandRes]) => {
        const verbrauch: Movement[] = verbrauchRes.data;
        const bestand: StockItem[] = bestandRes.data;

        if (!verbrauch?.length || !bestand?.length) {
          console.warn("Keine Verbrauchs- oder Lagerdaten vorhanden.");
          setItems([]);
          setLoading(false);
          return;
        }

        const forecastMonths = getNextThreeMonths();
        const grouped: Record<string, { articleId: string; articleNumber: string; name: string; monthly: Record<string, number> }> = {};

        for (const movement of verbrauch) {
          const quantity = parseFloat(movement.quantity) * -1;
          const monthKey = getMonthKey(movement.postingDate);

          if (!grouped[movement.articleId]) {
            grouped[movement.articleId] = {
              articleId: movement.articleId,
              articleNumber: movement.articleNumber,
              name: movement.name,
              monthly: {}
            };
          }

          grouped[movement.articleId].monthly[monthKey] =
            (grouped[movement.articleId].monthly[monthKey] || 0) + quantity;
        }

        const forecastList: ForecastItem[] = Object.values(grouped).map((item) => {
          const orderedKeys = Object.keys(item.monthly).sort();
          const pastValues = orderedKeys.map((key) => item.monthly[key]);
          const forecast = holtWintersForecast(pastValues)[0];

          return {
            articleId: item.articleId,
            articleNumber: item.articleNumber,
            name: item.name,
            forecast: parseFloat(forecast.toFixed(2)),
            stock: bestand.find(b => b.articleId === item.articleId)?.stock || 0,
            need: 0,
          };
        });

        const finalList = forecastList.map((item) => ({
          ...item,
          need: Math.max(0, item.forecast - item.stock),
        })).filter((i) => i.need > 5);

        setItems(finalList);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Fehler beim Laden der Daten:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-4">Lade Produktionsbedarf...</div>;

  return (
    <Card className="m-4 shadow-xl">
      <CardContent>
        <h2 className="text-xl font-bold mb-4">Produktionsbedarf WIP Röstkaffee (nächste 4 Wochen)</h2>
        <ul className="space-y-2">
          {items.map((item) => (
            <li key={item.articleId} className="border rounded p-3">
              <div className="font-semibold">{item.articleNumber} – {item.name}</div>
              <div className="text-sm text-muted-foreground">
                Prognose: {item.forecast.toFixed(2)} kg / Lager: {item.stock.toFixed(2)} kg → <span className="font-medium text-red-600">Produzieren: {item.need.toFixed(2)} kg</span>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default WipRoestkaffeeBedarfsliste;