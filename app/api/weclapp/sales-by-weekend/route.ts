// app/api/weclapp/verbrauch/wip-roestkaffee/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server'; // deinen Supabase Server-Client importieren

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔐 Authentifizierung prüfen
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;
  const createdSince = new Date("2014-01-01").getTime();

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const fetchAllProductionOrders = async () => {
    let page = 1;
    const allOrders: any[] = [];
    let keepFetching = true;

    while (keepFetching) {
      const res = await fetch(
        `${domain}/webapp/api/v1/productionOrder?pageSize=1000&page=${page}&createdDate-gt=${createdSince}`,
        {
          headers: {
            AuthenticationToken: apiKey as string, // 👈 Typ-Assertion, damit TS nicht meckert
          },
        }
      );

      if (!res.ok) break;

      const json = await res.json();
      const orders = json.result || [];

      allOrders.push(...orders);
      keepFetching = orders.length === 1000;
      page++;
    }

    return allOrders;
  };

  const orders = await fetchAllProductionOrders();

  return NextResponse.json({ data: orders });
}
