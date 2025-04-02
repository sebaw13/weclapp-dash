"use client"

import { TrendingDownIcon, TrendingUpIcon } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const [net, setNet] = useState<number | null>(null)
  const [growth, setGrowth] = useState<number | null>(null)

  const [openAmount, setOpenAmount] = useState<number | null>(null)
  const [openCount, setOpenCount] = useState<number | null>(null)

  useEffect(() => {
    async function fetchSales() {
      const res = await fetch("/api/weclapp/salesInvoice")
      const data = await res.json()
      setNet(data.currentNet)
      setGrowth(data.growth)
    }

    async function fetchOpen() {
      const res = await fetch("/api/weclapp/salesInvoice/open")
      const data = await res.json()
      setOpenAmount(data.totalOpen)
      setOpenCount(data.countOpen)
    }

    fetchSales()
    fetchOpen()
  }, [])

  const formattedNet = net?.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  })

  const formattedOpenAmount = openAmount?.toLocaleString("de-DE", {
    style: "currency",
    currency: "EUR",
  })

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 px-4 lg:px-6">
      {/* Card 1 */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Netto-Umsatz</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formattedNet ?? "Lade..."}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              {growth !== null && growth < 0 ? (
                <>
                  <TrendingDownIcon className="size-3" />
                  {growth.toFixed(2)}%
                </>
              ) : (
                <>
                  <TrendingUpIcon className="size-3" />
                  +{growth?.toFixed(2)}%
                </>
              )}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            {growth !== null && growth < 0
              ? "Rückgang im Vergleich zum Vorjahr"
              : "Steigerung im Vergleich zum Vorjahr"}{" "}
            {growth !== null && growth < 0 ? (
              <TrendingDownIcon className="size-4" />
            ) : (
              <TrendingUpIcon className="size-4" />
            )}
          </div>
          <div className="text-muted-foreground">
            Netto-Umsatz Jahresvergleich
          </div>
        </CardFooter>
      </Card>

      {/* Card 2 – Offene Rechnungen */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Offene Rechnungen</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {formattedOpenAmount ?? "Lade..."}
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="rounded-lg text-xs">
              {openCount !== null ? `${openCount} offen` : "Lade..."}
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">
            {openCount !== null
              ? `${openCount} unbezahlte Rechnungen`
              : "Lade Anzahl..."}
          </div>
          <div className="text-muted-foreground">
            Zeitraum: letzte 8 Wochen
          </div>
        </CardFooter>
      </Card>

      {/* Card 3 (dein Platzhalter) */}
      <Card className="@container/card">
        <CardHeader className="relative">
          <CardDescription>Active Accounts</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            45,678
          </CardTitle>
          <div className="absolute right-4 top-4">
            <Badge variant="outline" className="flex gap-1 rounded-lg text-xs">
              <TrendingUpIcon className="size-3" />
              +12.5%
            </Badge>
          </div>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="flex gap-2 font-medium">
            Strong user retention <TrendingUpIcon className="size-4" />
          </div>
          <div className="text-muted-foreground">Engagement exceed targets</div>
        </CardFooter>
      </Card>
    </div>
  )
}
