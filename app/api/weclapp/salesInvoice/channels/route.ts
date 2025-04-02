import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 60 * 60 }) // Cache für 1 Stunde

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: "Nicht authentifiziert" }, { status: 401 })
  }

  const cacheKey = 'weclapp:salesInvoice:monthlyChannels'
  const cached = cache.get(cacheKey)

  if (cached) {
    return NextResponse.json(cached)
  }

  const apiKey = process.env.WECLAPP_API_KEY
  const domain = process.env.WECLAPP_DOMAIN

  if (!apiKey || !domain) {
    return NextResponse.json({ error: "Fehlende Umgebungsvariablen" }, { status: 500 })
  }

  const fetchAllInvoices = async () => {
    let page = 1
    const all: any[] = []
    let keepGoing = true

    while (keepGoing) {
      const res = await fetch(`${domain}/webapp/api/v1/salesInvoice?pageSize=1000&page=${page}`, {
        headers: new Headers({
          AuthenticationToken: apiKey!,
        }),
      })

      if (!res.ok) {
        console.error("❌ Fehler beim Abrufen der Rechnungen")
        break
      }

      const json = await res.json()
      const result = json.result || []

      all.push(...result)
      keepGoing = result.length === 1000
      page++
    }

    return all
  }

  const allInvoices = await fetchAllInvoices()

  const validTypes = ['FINAL_INVOICE', 'STANDARD_INVOICE', 'RETAIL_INVOICE']
  const requiredStatus = 'OPEN_ITEM_CREATED'

  const filtered = allInvoices.filter((inv) => {
    const date = inv.invoiceDate
    const type = inv.salesInvoiceType
    const status = inv.status

    return (
      typeof date === 'number' &&
      status === requiredStatus &&
      validTypes.includes(type)
    )
  })

  // Aggregation pro Monat und Sales Channel
  const aggregated = new Map<string, Map<string, number>>()

  for (const inv of filtered) {
    const channel = inv.salesChannel || 'Unbekannt'
    const value = parseFloat(inv.netAmountInCompanyCurrency || '0')
    const date = new Date(inv.invoiceDate)
    const month = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}` // Format: 'YYYY-MM'

    if (!aggregated.has(month)) {
      aggregated.set(month, new Map())
    }

    const monthlyData = aggregated.get(month)!

    if (!monthlyData.has(channel)) {
      monthlyData.set(channel, 0)
    }

    monthlyData.set(channel, monthlyData.get(channel)! + value)
  }

  // Resultat für API-Rückgabe: Array für Chart
 // Resultat für API-Rückgabe: Array für Chart
const result = Array.from(aggregated.entries()).map(([month, channelData]) => {
    const data: any = { month }
    channelData.forEach((value, channel) => {
      data[channel] = parseFloat(value.toFixed(2)) // Rundung auf 2 Dezimalstellen
    })
    return data
  })
  cache.set(cacheKey, result)

  return NextResponse.json(result)
}
