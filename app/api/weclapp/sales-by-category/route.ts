import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;
  const customerNumber = "10052";
  const currentYear = new Date().getFullYear();
  const createdSince = new Date(`${currentYear}-01-01`).getTime();

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const salesRes = await fetch(
    `${domain}/webapp/api/v1/salesOrder?salesChannel-eq=GROSS2&pageSize=1000&createdDate-gt=${createdSince}`,
    {
      headers: {
        AuthenticationToken: apiKey,
      },
    }
  );

  if (!salesRes.ok) {
    const error = await salesRes.json();
    return NextResponse.json(error, { status: salesRes.status });
  }

  const { result: orders = [] } = await salesRes.json();

  // Artikel-IDs extrahieren
  const articleIds = new Set<string>();
  for (const order of orders) {
    for (const item of order.orderItems || []) {
      if (item.articleId) articleIds.add(item.articleId);
    }
  }

  // Artikel-Infos abrufen
  const articleToCategoryId = new Map<string, string>();
  const categoryIdToName = new Map<string, string>();

  for (const articleId of Array.from(articleIds)) {
    const articleRes = await fetch(`${domain}/webapp/api/v1/article/id/${articleId}`, {
      headers: { AuthenticationToken: apiKey },
    });

    if (!articleRes.ok) continue;
    const article = await articleRes.json();
    const categoryId = article.articleCategoryId;

    if (categoryId) {
      articleToCategoryId.set(articleId, categoryId);

      if (!categoryIdToName.has(categoryId)) {
        const catRes = await fetch(
          `${domain}/webapp/api/v1/articleCategory/id/${categoryId}`,
          { headers: { AuthenticationToken: apiKey } }
        );

        if (catRes.ok) {
          const category = await catRes.json();
          categoryIdToName.set(categoryId, category.name ?? "Unbekannt");
        } else {
          categoryIdToName.set(categoryId, "Unbekannt");
        }
      }
    } else {
      articleToCategoryId.set(articleId, "unknown");
      categoryIdToName.set("unknown", "Unbekannt");
    }
  }

  // Orders mit Kategorie anreichern
  const enriched = orders.map((order: any) => ({
    orderNumber: order.orderNumber,
    date: new Date(order.orderDate).toISOString().split("T")[0],
    items: order.orderItems?.map((item: any) => {
      const catId = articleToCategoryId.get(item.articleId);
      const catName = categoryIdToName.get(catId ?? "unknown") ?? "Unbekannt";

      return {
        articleId: item.articleId,
        title: item.title,
        netAmount: item.netAmount,
        category: catName,
      };
    }),
  }));

  return NextResponse.json({ orders: enriched });
}
