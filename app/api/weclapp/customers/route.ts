// app/api/weclapp/customers/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server"; // Supabase-Client importieren

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // 🔒 Nur eingeloggte Nutzer dürfen fortfahren
  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 });
  }

  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const res = await fetch(`${domain}/webapp/api/v1/customer`, {
    headers: {
      AuthenticationToken: apiKey as string, // Typsicherheit
    },
  });

  if (!res.ok) {
    const error = await res.json();
    return NextResponse.json(error, { status: res.status });
  }

  const data = await res.json();
  return NextResponse.json(data);
}
