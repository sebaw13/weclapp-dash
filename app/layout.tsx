import "./globals.css"
import { Geist } from "next/font/google"
import Head from "next/head"
import { Pacifico } from "next/font/google"
import { ThemeProvider } from "next-themes"
import { ThemeSwitcher } from "@/app/components/theme-switcher"
import { AppSidebar } from "@/app/components/AppSidebar"
import { SidebarProvider, SidebarInset } from "@/app/components/ui/sidebar"
import HeaderAuth from "@/app/components/header-auth"
import { hasEnvVars } from "@/utils/supabase/check-env-vars"
import { EnvVarWarning } from "@/app/components/env-var-warning"
import { createClient } from "@/utils/supabase/server"

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
})

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-pacifico",
})

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
  
      <Head>
        
      </Head>

      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <html lang="en" className={`${geistSans.className} ${pacifico.variable}`} suppressHydrationWarning>
          <body className="bg-background text-foreground" suppressHydrationWarning>
            <SidebarProvider>
              <div className="flex min-h-screen w-full">
                {user && <AppSidebar />}

                <SidebarInset>
                  <div className="flex flex-col min-h-screen w-full">
                  <nav className="w-full border-b border-b-foreground/10 h-16 flex items-center justify-end px-6">
  {!hasEnvVars ? <EnvVarWarning /> : <HeaderAuth />}
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
