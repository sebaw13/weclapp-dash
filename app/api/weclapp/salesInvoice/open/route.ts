import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'
import NodeCache from 'node-cache'

const cache = new NodeCache({ stdTTL: 60 * 60 }) // 1h Cache

export async function GET() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Nicht authentifiziert' }, { status: 401 })
  }

  const cacheKey = 'weclapp:salesInvoice:open'
  const cached = cache.get(cacheKey)

  if (cached) {
    return NextResponse.json({ ...cached, cached: true })
  }

  const apiKey = process.env.WECLAPP_API_KEY
  const domain = process.env.WECLAPP_DOMAIN

  if (!apiKey || !domain) {
    return NextResponse.json({ error: 'Fehlende Umgebungsvariablen' }, { status: 500 })
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
        const errorText = await res.text()
        console.error("❌ Fehler beim Abrufen:", errorText)
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

  const now = new Date()
  const eightWeeksAgo = new Date(now.getTime() - 8 * 7 * 24 * 60 * 60 * 1000).getTime()

  const validTypes = ['FINAL_INVOICE', 'STANDARD_INVOICE', 'RETAIL_INVOICE']
  const requiredStatus = 'OPEN_ITEM_CREATED'

  const openInvoices = allInvoices.filter((inv) => {
    const date = inv.invoiceDate
    const status = inv.status
    const type = inv.salesInvoiceType
    const paid = inv.paid

    return (
      typeof date === 'number' &&
      date >= eightWeeksAgo &&
      status === requiredStatus &&
      validTypes.includes(type) &&
      paid === false
    )
  })

  const totalOpen = openInvoices.reduce((sum, inv) => {
    return sum + parseFloat(inv.netAmountInCompanyCurrency || '0')
  }, 0)

  const result = {
    totalOpen: parseFloat(totalOpen.toFixed(2)),
    countOpen: openInvoices.length,
    cached: false,
  }

  cache.set(cacheKey, result)

  return NextResponse.json(result)
}
