import { NextResponse } from 'next/server';

export async function GET() {
  const apiKey = process.env.WECLAPP_API_KEY;
  const domain = process.env.WECLAPP_DOMAIN; // Weclapp API URL
  
  // Logge die Umgebungsvariablen für Debugging
  console.log("WECLAPP_API_URL:", domain);
  console.log("WECLAPP_API_KEY:", process.env.WECLAPP_API_KEY);

  // Überprüfe, ob die Umgebungsvariablen gesetzt sind
  if (!apiKey || !domain) {
    console.error("Fehlende Umgebungsvariablen: API_KEY oder API_URL");
    return NextResponse.json({ error: "Missing env vars" }, { status: 500 });
  }

  const url = `${domain}/webapp/api/v1/articleCategory`; // Artikelkategorien-Endpunkt
  
  try {
    // Fetch-Anfrage mit fetch API
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'AuthenticationToken': apiKey, // Hinzufügen des API-Keys
      },
    });

    // Überprüfen, ob die Antwort erfolgreich war
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    // Antwort in JSON umwandeln
    const data = await response.json();

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Fehler beim Abrufen der Artikelkategorien:", error);
    return NextResponse.json({ error: "Fehler beim Abrufen der Artikelkategorien" }, { status: 500 });
  }
}
