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
  ChevronsRight,
  type LucideIcon,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  className?: string
}

export function DashboardNav({ items, className }: DashboardNavProps) {
  const pathname = usePathname()
  const [isClient, setIsClient] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  const getIcon = (icon: string): LucideIcon | null => {
    const iconMap: Record<string, LucideIcon> = {
      "layout-dashboard": LayoutDashboard,
      "trophy": Trophy,
      "image": ImageIcon,
      "credit-card": CreditCard,
      "award": Award,
    }
    return iconMap[icon] || null
  }

  const navLinks = (
    <nav className="grid gap-1">
      {items.map((item, index) => {
        const Icon = getIcon(item.icon)
        const isActive = pathname === item.href
        
        return (
          <motion.div
            key={item.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
          >
            <Link href={item.href} onClick={() => setOpen(false)}>
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={cn(
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive 
                    ? "bg-[#A9446B]/10 text-[#A9446B] font-semibold"
                    : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                )}
              >
                {Icon && (
                  <Icon className={cn(
                    "mr-3 h-4 w-4 transition-colors",
                    isActive ? "text-[#A9446B]" : "text-muted-foreground group-hover:text-foreground"
                  )} />
                )}
                <span>{item.title}</span>
              </motion.span>
            </Link>
          </motion.div>
        )
      })}
    </nav>
  )

  return (
    <>
      {/* Mobile Navigation */}
      {isClient && (
        <div className={cn("md:hidden fixed z-50 left-2 top-1/2 -translate-y-1/2", className)}>
          <Sheet open={open} onOpenChange={setOpen}>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <SheetTrigger asChild>
                <Button 
                  variant="outline" 
                  size="icon" 
                  className="rounded-full shadow-lg bg-[#A9446B] hover:bg-[#8a3a5a] transition-colors"
                >
                  <ChevronsRight className="h-5 w-5 text-white" />
                </Button>
              </SheetTrigger>
            </motion.div>

            <SheetContent 
              side="left" 
              className="w-64 pt-10 bg-background/95 backdrop-blur-sm"
              onInteractOutside={(e) => e.preventDefault()}
            >
              <AnimatePresence>
                {open && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      <SheetHeader>
                        <SheetTitle className="text-lg font-bold text-[#A9446B]">
                          Dashboard Menu
                        </SheetTitle>
                      </SheetHeader>
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="mt-6"
                    >
                      {navLinks}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </SheetContent>
          </Sheet>
        </div>
      )}

      {/* Desktop Navigation */}
      <div className={cn("hidden md:block h-full border-r pr-4", className)}>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="h-full"
        >
          {navLinks}
        </motion.div>
      </div>
    </>
  )
}