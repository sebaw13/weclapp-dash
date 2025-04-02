import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const articleUrl = `${domain}/webapp/api/v1/article?articleCategoryId-eq=4271`;

  try {
    // Artikel abrufen
    const articleResponse = await fetch(articleUrl, {
      method: 'GET',
      headers: {
        'AuthenticationToken': apiKey || '', // Sicherstellen, dass apiKey immer ein String ist
      } as HeadersInit, // TypeScript weiß jetzt, dass dies dem erwarteten Header-Typ entspricht
    });

    if (!articleResponse.ok) {
      throw new Error(`Fehler beim Abrufen der Artikel: ${articleResponse.status}`);
    }

    const articleData = await articleResponse.json();
    const articles = articleData.result;

    // Artikel-ID-Mapping für Details
    const articleMap = Object.fromEntries(
      articles.map((a: any) => [a.id, { articleNumber: a.articleNumber, name: a.name }])
    );

    // Bewegungen mit Artikeldetails anreichern
    const allMovements = [];
    for (const article of articles) {
      const movements = await fetchWarehouseMovements(article.id);
      const enriched = movements.map((m: any) => ({
        ...m,
        articleNumber: article.articleNumber,
        name: article.name,
      }));
      allMovements.push(...enriched);
    }

    return NextResponse.json({ data: allMovements });

  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error("Fehler beim Abrufen:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unbekannter Fehler" }, { status: 500 });
  }
}

const fetchWarehouseMovements = async (articleId: string) => {
  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;

  let page = 1;
  const allMovements: any[] = [];
  let keepFetching = true;

  while (keepFetching) {
    const url = `${domain}/webapp/api/v1/warehouseStockMovement?articleId-eq=${articleId}&stockMovementType-eq=OUT_PRODUCTION_ORDER&pageSize=1000&page=${page}&createdDate-gt=${new Date("2014-01-01").getTime()}`;

    const response = await fetch(url, {
      headers: {
        'AuthenticationToken': apiKey || '', // Sicherstellen, dass apiKey immer ein String ist
      } as HeadersInit, // TypeScript weiß jetzt, dass dies dem erwarteten Header-Typ entspricht
    });

    if (!response.ok) break;

    const json = await response.json();
    const movements = json.result || [];

    allMovements.push(...movements);
    keepFetching = movements.length === 1000;
    page++;
  }

  return allMovements;
};
