"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Palette, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useSession, signOut } from "next-auth/react"
import { UserNav } from "@/components/user-nav"
import { ThemeToggle } from "@/components/theme-toggle"

export function SiteHeader() {
  const pathname = usePathname()
  const { data: session, status } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  const isLoading = status === "loading"
  const user = session?.user
  const isAdmin = user?.role === "admin"

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 md:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Palette className="h-6 w-6 text-primary" />
            <span className="text-xl font-bold">ArtistryNu</span>
          </Link>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Link href="/" className="text-sm font-medium">
            Home
          </Link>
          <Link href="/tournaments" className="text-sm font-medium">
            Tournaments
          </Link>
          <Link href="/about" className="text-sm font-medium">
            About
          </Link>
          <Link href="/contact" className="text-sm font-medium">
            Contact
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />

          {!isLoading && (
            <>
              {user ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin/dashboard" className="hidden md:block">
                      <Button variant="outline">Admin Dashboard</Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="hidden md:block">
                      <Button variant="outline">Dashboard</Button>
                    </Link>
                  )}
                  <UserNav user={user} />
                </>
              ) : (
                <>
                  <div className="hidden md:flex items-center gap-4">
                    <Link href="/login">
                      <Button variant="outline">Log in</Button>
                    </Link>
                    {/* <Link href="/register">
                      <Button>Register</Button>
                    </Link> */}
                  </div>
                </>
              )}
            </>
          )}

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 py-4">
                <div className="flex justify-end">
                  <ThemeToggle />
                </div>
                <Link href="/" onClick={() => setIsOpen(false)} className="text-sm font-medium">
                  Home
                </Link>
                <Link href="/tournaments" onClick={() => setIsOpen(false)} className="text-sm font-medium">
                  Tournaments
                </Link>
                <Link href="/about" onClick={() => setIsOpen(false)} className="text-sm font-medium">
                  About
                </Link>
                <Link href="/contact" onClick={() => setIsOpen(false)} className="text-sm font-medium">
                  Contact
                </Link>

                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        {isAdmin ? (
                          <Link href="/admin/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-medium">
                            Admin Dashboard
                          </Link>
                        ) : (
                          <Link href="/dashboard" onClick={() => setIsOpen(false)} className="text-sm font-medium">
                            Dashboard
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            signOut()
                            setIsOpen(false)
                          }}
                        >
                          Log out
                        </Button>
                      </>
                    ) : (
                      <>
                        <Link href="/login" onClick={() => setIsOpen(false)}>
                          <Button variant="outline" className="w-full">
                            Log in
                          </Button>
                        </Link>
                        {/* <Link href="/register" onClick={() => setIsOpen(false)}>
                          <Button className="w-full">Register</Button>
                        </Link> */}
                      </>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}