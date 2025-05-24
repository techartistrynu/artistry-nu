"use client";

import Link from "next/link";
import {
  Facebook,
  Instagram,
  Youtube,
  Linkedin,
  ChevronDown,
  Menu,
  X,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
// import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const isLoading = status === "loading";
  const user = session?.user;
  const isAdmin = user?.role === "admin";

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white py-2">
      <div className="container flex h-20 items-center justify-between px-4 sm:px-6 md:px-8">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Link href="https://www.artistrynu.com/">
            <img
              src="/logo-artistrynu.png"
              alt="ArtistryNU Logo"
              className="h-40 w-auto"
            />
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="https://www.artistrynu.com/"
            className="text-sm font-medium border-b-2 border-black pb-1"
          >
            Home
          </Link>

          <DropdownMenu onOpenChange={setIsServicesOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-sm font-medium p-0 h-auto"
              >
                <div className="flex items-center gap-1">
                  Services
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isServicesOpen ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem asChild>
                <Link href="/tournaments" className="w-full">
                  Competition Enrollment
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.artistrynu.com/artistrynucomservices-artsale-art-painting"
                  className="w-full"
                >
                  Sell/Purchase Art
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.artistrynu.com/artistrynucomsolo-group-art-exhibitions"
                  className="w-full"
                >
                  Solo/Group Exhibitions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.artistrynu.com/artistrynucomart-seminars-lectures-art-education"
                  className="w-full"
                >
                  Seminars/Lectures
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Link
            href="https://www.artistrynu.com/artistrynucomabout-artistrynu-artists-empowerment-and-networking"
            className="text-sm font-medium"
          >
            About
          </Link>
          <Link
            href="https://www.artistrynu.com/artistrynucomcontact-artistrynu-pvt-ltd-enquiries-about-competitions-exhibitions-art-transactions-and-seminars-lectures-educations"
            className="text-sm font-medium"
          >
            Contact
          </Link>

          {/* Social Icons */}
          <div className="flex items-center gap-4 ml-4">
            <Link
              href="https://www.facebook.com/profile.php?id=61575928265606"
              target="_blank"
            >
              <Facebook className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.instagram.com/artistrynu.official/"
              target="_blank"
            >
              <Instagram className="h-5 w-5" />
            </Link>
            <Link href="https://x.com/artistrynu" target="_blank">
              <X className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.youtube.com/@ArtistrynuPvtLtd"
              target="_blank"
            >
              <Youtube className="h-5 w-5" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/artistrynu-pvt-ltd/about/?viewAsMember=true"
              target="_blank"
            >
              <Linkedin className="h-5 w-5" />
            </Link>
          </div>
        </nav>

        {/* Auth + Theme + Mobile Nav */}
        <div className="flex items-center gap-4">
          {/* <ThemeToggle /> */}

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
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="outline">Log in</Button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="outline" size="icon">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-4 py-4">
                {/* <div className="flex justify-end">
                  <ThemeToggle />
                </div> */}

                <Link
                  href="https://www.artistrynu.com/"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium"
                >
                  Home
                </Link>

                <div className="flex flex-col gap-2 pl-4">
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className="flex items-center justify-between text-sm font-medium"
                  >
                    Services
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${
                        isServicesOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isServicesOpen && (
                    <div className="flex flex-col gap-2 pl-4 border-l">
                      <Link
                        href="/tournaments"
                        onClick={() => setIsOpen(false)}
                        className="text-sm"
                      >
                        Competition Enrollment
                      </Link>
                      <Link
                        href="https://www.artistrynu.com/artistrynucomservices-artsale-art-painting"
                        onClick={() => setIsOpen(false)}
                        className="text-sm"
                      >
                        Sell/Purchase Art
                      </Link>
                      <Link
                        href="https://www.artistrynu.com/artistrynucomsolo-group-art-exhibitions"
                        onClick={() => setIsOpen(false)}
                        className="text-sm"
                      >
                        Solo/Group Exhibitions
                      </Link>
                      <Link
                        href="https://www.artistrynu.com/artistrynucomart-seminars-lectures-art-education"
                        onClick={() => setIsOpen(false)}
                        className="text-sm"
                      >
                        Seminars/Lectures
                      </Link>
                    </div>
                  )}
                </div>

                <Link
                  href="https://www.artistrynu.com/artistrynucomabout-artistrynu-artists-empowerment-and-networking"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium"
                >
                  About
                </Link>
                <Link
                  href="https://www.artistrynu.com/artistrynucomcontact-artistrynu-pvt-ltd-enquiries-about-competitions-exhibitions-art-transactions-and-seminars-lectures-educations"
                  onClick={() => setIsOpen(false)}
                  className="text-sm font-medium"
                >
                  Contact
                </Link>

                {!isLoading && (
                  <>
                    {user ? (
                      <>
                        {isAdmin ? (
                          <Link
                            href="/admin/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium"
                          >
                            Admin Dashboard
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="text-sm font-medium"
                          >
                            Dashboard
                          </Link>
                        )}
                        <Button
                          variant="outline"
                          onClick={() => {
                            signOut();
                            setIsOpen(false);
                          }}
                        >
                          Log out
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Log in
                        </Button>
                      </Link>
                    )}
                  </>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
