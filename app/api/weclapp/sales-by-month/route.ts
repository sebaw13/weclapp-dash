// === API Route (/api/weclapp/sales-by-month) ===
import { NextResponse } from "next/server";
import pLimit from "p-limit";

interface SalesOrderItem {
  netAmount: string | number | null;
}

interface SalesOrder {
  orderDate: string;
  orderItems: SalesOrderItem[];
}

export async function GET() {
  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;
  const createdSince = new Date("2023-01-01").getTime();

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const fetchAllSalesOrders = async (): Promise<SalesOrder[]> => {
    let page = 1;
    const allOrders: SalesOrder[] = [];
    let keepFetching = true;

    while (keepFetching) {
      const res = await fetch(
        `${domain}/webapp/api/v1/salesOrder?salesChannel-eq=GROSS2&pageSize=1000&page=${page}&createdDate-gt=${createdSince}`,
        {
          headers: {
            AuthenticationToken: apiKey,
          },
        }
      );

      if (!res.ok) break;

      const json = await res.json();
      const orders: SalesOrder[] = json.result || [];

      allOrders.push(...orders);
      keepFetching = orders.length === 1000;
      page++;
    }

    return allOrders;
  };

  const orders = await fetchAllSalesOrders();

  const monthlySales: Record<string, number> = {};

  for (const order of orders) {
    const date = new Date(order.orderDate);
    const yearMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    let total = 0;
    for (const item of order.orderItems || []) {
      const net = parseFloat(String(item.netAmount)) || 0;
      total += net;
    }

    monthlySales[yearMonth] = (monthlySales[yearMonth] ?? 0) + total;
  }

  const months = ["Jan", "Feb", "Mär", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
  const result = [];

  for (let m = 0; m < 12; m++) {
    const monthLabel = months[m];
    const key2023 = `2023-${String(m + 1).padStart(2, "0")}`;
    const key2024 = `2024-${String(m + 1).padStart(2, "0")}`;
    const key2025 = `2025-${String(m + 1).padStart(2, "0")}`;

    const y2023 = monthlySales[key2023] ?? 0;
    const y2024 = monthlySales[key2024] ?? 0;
    const y2025 = monthlySales[key2025] ?? 0;

    const change2025to2024 = y2024 > 0 ? ((y2025 - y2024) / y2024) * 100 : 0;
    const change2025to2023 = y2023 > 0 ? ((y2025 - y2023) / y2023) * 100 : 0;
    const change2024to2023 = y2023 > 0 ? ((y2024 - y2023) / y2023) * 100 : 0;

    result.push({
      month: monthLabel,
      "2023": parseFloat(y2023.toFixed(2)),
      "2024": parseFloat(y2024.toFixed(2)),
      "2025": parseFloat(y2025.toFixed(2)),
      changeTo2024: parseFloat(change2025to2024.toFixed(2)),
      changeTo2023: parseFloat(change2025to2023.toFixed(2)),
      change2024to2023: parseFloat(change2024to2023.toFixed(2)),
    });
  }

  return NextResponse.json({ data: result });
}