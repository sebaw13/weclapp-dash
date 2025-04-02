// app/api/weclapp/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

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

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  try {
    const articleRes = await fetch(`${domain}/webapp/api/v1/article?articleCategoryId-eq=4271`, {
      headers: {
        AuthenticationToken: apiKey as string,
      },
    });

    if (!articleRes.ok) throw new Error("Fehler beim Abrufen der Artikel");

    const articles = (await articleRes.json()).result;

    const results: {
      articleId: string;
      articleNumber: string;
      name: string;
      stock: number;
    }[] = [];

    for (const article of articles) {
      const res = await fetch(`${domain}/webapp/api/v1/warehouseStock?articleId-eq=${article.id}`, {
        headers: {
          AuthenticationToken: apiKey as string,
        },
      });

      if (!res.ok) continue;

      const data = await res.json();

      const stockSum = data.result.reduce((sum: number, s: any) => {
        const qty = parseFloat(s.quantity || "0");
        return sum + (isNaN(qty) ? 0 : qty);
      }, 0);

      results.push({
        articleId: article.id,
        articleNumber: article.articleNumber,
        name: article.name,
        stock: stockSum,
      });
    }

    return NextResponse.json({ data: results });
  } catch (err: unknown) {
    console.error("Fehler beim Lagerbestand:", err);
    if (err instanceof Error) {
      return NextResponse.json({ error: err.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Unbekannter Fehler" }, { status: 500 });
  }
}
