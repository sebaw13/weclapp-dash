// app/api/weclapp/customers/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN;

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const res = await fetch(`${domain}/webapp/api/v1/customer`, {
    headers: {
      AuthenticationToken: apiKey,
    },
  });

  const data = await res.json();
  return NextResponse.json(data);
}
