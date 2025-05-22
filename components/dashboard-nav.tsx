"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Trophy,
  ImageIcon,
  CreditCard,
  Award,
  Settings,
  ChevronsRight,
  type LucideIcon,
} from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"

interface NavItem {
  title: string
  href: string
  icon: string
}

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getIcon = (icon: string): LucideIcon | null => {
    switch (icon) {
      case "layout-dashboard":
        return LayoutDashboard
      case "trophy":
        return Trophy
      case "image":
        return ImageIcon
      case "credit-card":
        return CreditCard
      case "award":
        return Award
      case "settings":
        return Settings
      default:
        return null
    }
  }

  const navLinks = (
    <nav className="grid gap-2 py-2">
      {items.map((item) => {
        const Icon = getIcon(item.icon)
        return (
          <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
            <span
              className={cn(
                "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
                pathname === item.href ? "bg-muted" : ""
              )}
            >
              {Icon && <Icon className="mr-2 h-4 w-4" />}
              {item.title}
            </span>
          </Link>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile trigger */}
      {isClient && (
        <div className="md:hidden fixed z-50 left-2 top-1/2 -translate-y-1/2 transform">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shadow-md">
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 pt-10">
              <SheetHeader>
                <SheetTitle className="text-lg">Dashboard Menu</SheetTitle>
              </SheetHeader>
              <div className="mt-4">{navLinks}</div>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden md:block">{navLinks}</div>
    </>
  )
}
