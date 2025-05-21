import type React from "react"
import type { Metadata } from "next"
import { DashboardNav } from "@/components/dashboard-nav"
import { ProtectedRoute } from "@/components/protected-route"

export const metadata: Metadata = {
  title: "Dashboard - ArtistryNu",
  description: "Student application portal dashboard",
}

const navItems = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "layout-dashboard",
  },
  {
    title: "Tournaments",
    href: "/dashboard/tournaments",
    icon: "trophy",
  },
  {
    title: "My Submissions",
    href: "/dashboard/submissions",
    icon: "image",
  },
  {
    title: "Payments",
    href: "/dashboard/payments",
    icon: "credit-card",
  },
  {
    title: "Certificates",
    href: "/dashboard/certificates",
    icon: "award",
  },
  {
    title: "Settings",
    href: "/dashboard/settings",
    icon: "settings",
  },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      <div className="container grid flex-1 gap-12 md:grid-cols-[200px_1fr] px-4 sm:px-6 md:px-8 py-6">
        <aside className="hidden w-[200px] flex-col md:flex">
          <DashboardNav items={navItems} />
        </aside>
        <main className="flex w-full flex-1 flex-col overflow-hidden">{children}</main>
      </div>
    </ProtectedRoute>
  )
}
