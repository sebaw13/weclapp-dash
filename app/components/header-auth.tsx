import { signOutAction } from "@/app/actions";
import { hasEnvVars } from "@/utils/supabase/check-env-vars";
import Link from "next/link";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { createClient } from "@/utils/supabase/server";
import { MenuIcon, BarChartIcon, ClipboardListIcon, PackageIcon, CoffeeIcon, HelpCircleIcon, SearchIcon, SettingsIcon, UserCircleIcon } from "lucide-react";
import Image from "next/image";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from "@/components/ui/sheet";

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
];

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
];

export default async function AuthButton() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!hasEnvVars) {
    return (
      <div className="flex gap-4 items-center">
        <Badge
          variant="default"
          className="font-normal pointer-events-none"
        >
          Please update .env.local file with anon key and url
        </Badge>
        <div className="flex gap-2">
          <Button
            asChild
            size="sm"
            variant="outline"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
          <Button
            asChild
            size="sm"
            variant="default"
            disabled
            className="opacity-75 cursor-none pointer-events-none"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Mobile Header */}
      <div className="w-full flex items-center justify-center md:hidden px-4 py-2 border-b relative">
        <div className="absolute left-4">
          <Sheet>
            <SheetTrigger asChild>
              <Button size="icon" variant="ghost">
                <MenuIcon className="w-5 h-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left">
              <SheetHeader>
                <div className="text-lg font-semibold">Menü</div>
              </SheetHeader>
              <div className="mt-4 space-y-2">
                {navMain.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-2"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  </Button>
                ))}
                <hr className="my-2" />
                {navSecondary.map((item) => (
                  <Button
                    key={item.href}
                    asChild
                    variant="ghost"
                    className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
                  >
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      {item.title}
                    </Link>
                  </Button>
                ))}
                <hr className="my-2" />
                <Button asChild variant="ghost" className="w-full justify-start gap-2">
                  <Link href="/profile">
                    <UserCircleIcon className="w-4 h-4" />
                    Mein Profil
                  </Link>
                </Button>
                {user && (
                  <form action={signOutAction}>
                    <Button type="submit" variant="outline" className="w-full">
                      Abmelden
                    </Button>
                  </form>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
        <div className="flex items-center gap-2 mx-auto">
          <Image src="/logo.svg" alt="Logo" width={24} height={24} className="h-6 w-6" />
          <span className="text-lg font-pafico">Majas Coffee</span>
        </div>
      </div>

      {/* Normal Login/Logout Buttons (Desktop & Mobile) */}
      <div className="hidden md:flex gap-2">
        {user ? (
          <form action={signOutAction}>
            <Button type="submit" variant="outline" size="sm">
              Sign out
            </Button>
          </form>
        ) : (
          <>
            <Button asChild size="sm" variant="outline">
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild size="sm" variant="default">
              <Link href="/sign-up">Sign up</Link>
            </Button>
          </>
        )}
      </div>
    </>
  );
} 
