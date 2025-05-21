"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { LayoutDashboard, Trophy, ImageIcon, CreditCard, Award, Settings, type LucideIcon } from "lucide-react"

interface NavItem {
  title: string
  href: string
  icon: string
}

interface DashboardNavProps {
  items: NavItem[]
}

export function DashboardNav({ items }: DashboardNavProps) {
  const path = usePathname()

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

  return (
    <nav className="grid items-start gap-2">
      {items.map((item) => {
        const Icon = getIcon(item.icon)
        return (
          <Link key={item.href} href={item.href}>
            <span
              className={cn(
                buttonVariants({ variant: "ghost" }),
                path === item.href ? "bg-muted hover:bg-muted" : "hover:bg-transparent hover:underline",
                "justify-start",
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
}
