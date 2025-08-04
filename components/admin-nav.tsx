"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import {
  LayoutDashboard,
  Trophy,
  FileText,
  Award,
  CreditCard,
  Settings,
  Users,
  ChevronsRight,
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

const adminNavItems = [
  { title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { title: "Competition", href: "/admin/dashboard/tournaments", icon: Trophy },
  { title: "Submissions", href: "/admin/dashboard/submissions", icon: FileText },
  { title: "Certificates", href: "/admin/dashboard/certificates", icon: Award },
  { title: "Payments", href: "/admin/dashboard/payments", icon: CreditCard },
  { title: "Users", href: "/admin/dashboard/users", icon: Users },
  { title: "Settings", href: "/admin/dashboard/settings", icon: Settings },
]

export function AdminNav() {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const navLinks = (
    <nav className="grid gap-2 py-2">
      {adminNavItems.map((item) => (
        <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
          <span
            className={cn(
              "group flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground",
              pathname === item.href ? "bg-accent text-accent-foreground" : ""
            )}
          >
            <item.icon className="mr-2 h-4 w-4" />
            <span>{item.title}</span>
          </span>
        </Link>
      ))}
    </nav>
  )

  return (
    <>
      {/* Slide toggle button for mobile */}
      {isClient && (
        <div className="md:hidden fixed z-50 left-2 top-1/2 transform -translate-y-1/2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-full shadow-md">
                <ChevronsRight className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-64 pt-10">
              <SheetHeader>
                <SheetTitle className="text-lg">Admin Menu</SheetTitle>
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
