"use client"; // Diese Direktive stellt sicher, dass die Komponente als Client-Komponente behandelt wird

import { useRouter } from "next/navigation";  // Verwende 'next/navigation' statt 'next/router'
import { createClient } from "@/utils/supabase/client"; 

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InfoIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { SectionCards } from "../components/section-cards";
import { SalesChannelChart } from "../components/SalesChannelChart";

// Supabase Client erstellen
const supabase = createClient();

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
      const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();  // Hier den Supabase-Client verwenden
        if (!user) {
          // Falls kein User angemeldet ist, Weiterleitung zur Anmeldeseite
          router.push('/sign-in');
        } else {
          setUser(user);
        }
      };
      
      checkUser();
    }, [router]);
  
    if (!user) {
      return <div>Loading...</div>; // Hier könntest du auch einen Spinner anzeigen
    }
  
  const ChartDummy = ({ label }: { label: string }) => (
    <div className="h-64 flex items-center justify-center text-muted-foreground border border-dashed border-gray-300 rounded-xl">
      <span className="text-sm">{label}</span>
    </div>
  );

  return (
    <div className="w-full px-4 py-6 space-y-6">
      {/* Erste Zeile: SectionCards und Wochenumsatz nebeneinander */}
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-6">
        <div className="xl:col-span-4">
          <SectionCards />
        </div>
        <div className="bg-card p-4 rounded-2xl shadow-md xl:col-span-1">
          <SalesChannelChart />
        </div>
      </div>

      {/* Zweite Zeile: 3 Spalten */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Chart 3 – Monatsvergleich */}
        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground col-span-1 xl:col-span-1">
          <div className="text-sm mb-4 font-medium">📅 Monatsvergleich (aktuell vs. Vorjahr)</div>
          <ChartDummy label="Monatsvergleich (Chart-Dummy)" />
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground">
          <p className="text-sm mb-4">📈 Platzhalter 2</p>
          <ChartDummy label="Platzhalter 2 (Chart-Dummy)" />
        </div>

        <div className="bg-card p-4 rounded-2xl shadow-md text-muted-foreground">
          <p className="text-sm mb-4">📊 Platzhalter 3</p>
          <ChartDummy label="Platzhalter 3 (Chart-Dummy)" />
        </div>
      </div>
    </div>
  );
}
