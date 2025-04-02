import { Geist } from "next/font/google"
import { ThemeProvider } from "next-themes"
import "../globals.css"

const geistSans = Geist({
  display: "swap",
  subsets: ["latin"],
})

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={geistSans.className}>
      <body className="bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <main className="min-h-screen flex items-center justify-center px-4">
            <div className="w-full max-w-md">{children}</div>
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
