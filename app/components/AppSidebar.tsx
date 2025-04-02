"use client"

import {
  BarChartIcon,
  ClipboardListIcon,
  PackageIcon,
  CoffeeIcon,
  HelpCircleIcon,
  SearchIcon,
  SettingsIcon,
  UserCircleIcon,
} from "lucide-react"

import Link from "next/link"
import { useIsMobile } from "@/hooks/use-mobile"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/app/components/ui/sidebar"

const navMain = [
  {
    title: "Röstereiverkauf",
    href: "/roestereiverkauf",
    icon: CoffeeIcon,
  },
  {
    title: "Vertriebsanalyse",
    href: "/salesanalyse",
    icon: BarChartIcon,
  },
  {
    title: "Produktionsplanung",
    href: "/produktion",
    icon: ClipboardListIcon,
  },
  {
    title: "Rohkaffeeplanung",
    href: "/rohkaffee",
    icon: PackageIcon,
  },
]

const navSecondary = [
  {
    title: "Einstellungen",
    href: "/settings",
    icon: SettingsIcon,
  },
  {
    title: "Hilfe",
    href: "/help",
    icon: HelpCircleIcon,
  },
  {
    title: "Suche",
    href: "/search",
    icon: SearchIcon,
  },
]

export function AppSidebar() {
  const isMobile = useIsMobile()

  return (
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href="/" className="flex items-center gap-2">
                <img src="/logo.svg" alt="Majas Coffee Logo" className="h-5 w-5" />
                <span className="text-base font-semibold font-pafico">Majas Coffee</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarMenu>
          {navMain.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link href={item.href} className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarMenu className="mt-4">
          {navSecondary.map((item) => (
            <SidebarMenuItem key={item.href}>
              <SidebarMenuButton asChild>
                <Link
                  href={item.href}
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild>
              <Link href="/profile" className="flex items-center gap-2">
                <UserCircleIcon className="h-4 w-4" />
                <span>Mein Profil</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
} 
