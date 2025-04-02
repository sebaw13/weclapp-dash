import "./globals.css"
import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import Head from "next/head" // Importiere den Head aus 'next/head' statt 'next/document'

import { ThemeSwitcher } from "@/app/components/theme-switcher"
import { AppSidebar } from "@/app/components/AppSidebar"
import { SidebarProvider, SidebarInset } from "@/app/components/ui/sidebar"
import HeaderAuth from "@/app/components/header-auth"
import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import { EnvVarWarning } from "@/app/components/env-var-warning"
import { createClient } from "@/utils/supabase/server" // ✅ Server-Side Supabase

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ Supabase Auth Check (serverseitig)
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      {/* Sicherstellen, dass wichtige Skripte im <head> sind */}
      <Head>
        <script
          async
          src="https://example.com/your-script.js" // Beispiel für Skript im Head
        ></script>
      </Head>

      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <html lang="en" className={geistSans.className} suppressHydrationWarning>
          <body className="bg-background text-foreground" suppressHydrationWarning>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                {/* ✅ Sidebar nur bei eingeloggtem User */}
                {user && <AppSidebar />}

                <SidebarInset>
                  <div className="flex flex-col min-h-screen w-full">
                    <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center px-6">
                      <div className="text-lg font-bold">Majas Coffee Dashboard ☕️</div>
                      <div className="ml-auto">
                        {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
                      </div>
                    </nav>

                    <main className="flex-1 w-full p-6">{children}</main>

                    <footer className="w-full border-t text-xs text-center py-6">
                      <p>
                        Powered by{" "}
                        <a
                          href="https://supabase.com"
                          target="_blank"
                          className="font-bold hover:underline"
                          rel="noreferrer"
                        >
                          Sebastian
                        </a>
                      </p>
                      <ThemeSwitcher />
                    </footer>
                  </div>
                </SidebarInset>
              </div>
            </SidebarProvider>
          </body>
        </html>
      </ThemeProvider>
    </>
  )
}
