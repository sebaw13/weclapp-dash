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

  const cacheKey = 'weclapp:salesInvoice:summary'
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
  const currentYear = now.getFullYear()
  const lastYear = currentYear - 1

  const startThisYear = new Date(currentYear, 0, 1).getTime()
  const endThisYear = now.getTime()

  const startLastYear = new Date(lastYear, 0, 1).getTime()
  const endLastYear = new Date(
    lastYear,
    now.getMonth(),
    now.getDate(),
    now.getHours(),
    now.getMinutes(),
    now.getSeconds()
  ).getTime()

  const positiveTypes = ['FINAL_INVOICE', 'STANDARD_INVOICE', 'RETAIL_INVOICE']
  const creditType = 'CREDIT_NOTE'
  const requiredStatus = 'OPEN_ITEM_CREATED'

  const sumInvoices = (invoices: any[], from: number, to: number) => {
    return invoices.reduce((sum, inv) => {
      const date = inv.invoiceDate
      const type = inv.salesInvoiceType
      const status = inv.status
      const value = parseFloat(inv.netAmountInCompanyCurrency || '0')

      const inRange = typeof date === 'number' && date >= from && date <= to
      const isCompleted = status === requiredStatus

      if (!inRange || !isCompleted) return sum

      if (positiveTypes.includes(type)) return sum + value
      if (type === creditType) return sum - value

      return sum
    }, 0)
  }

  const totalThisYear = sumInvoices(allInvoices, startThisYear, endThisYear)
  const totalLastYear = sumInvoices(allInvoices, startLastYear, endLastYear)

  const growth =
    totalLastYear > 0 ? ((totalThisYear - totalLastYear) / totalLastYear) * 100 : 0

  const result = {
    currentNet: parseFloat(totalThisYear.toFixed(2)),
    growth: parseFloat(growth.toFixed(2)),
    cached: false,
  }

  cache.set(cacheKey, result)

  return NextResponse.json(result)
}
