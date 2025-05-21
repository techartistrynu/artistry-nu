"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Trophy, FileText, Award, CreditCard, Settings, Users } from "lucide-react"

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Tournaments",
    href: "/admin/dashboard/tournaments",
    icon: Trophy,
  },
  {
    title: "Submissions",
    href: "/admin/dashboard/submissions",
    icon: FileText,
  },
  {
    title: "Certificates",
    href: "/admin/dashboard/certificates",
    icon: Award,
  },
  {
    title: "Payments",
    href: "/admin/dashboard/payments",
    icon: CreditCard,
  },
  {
    title: "Users",
    href: "/admin/dashboard/users",
    icon: Users,
  },
  {
    title: "Settings",
    href: "/admin/dashboard/settings",
    icon: Settings,
  },
]

export function AdminNav() {
  const pathname = usePathname()

  return (
    <nav className="grid items-start gap-2">
      {adminNavItems.map((item) => (
        <Link key={item.href} href={item.href}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : "transparent",
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )
}
