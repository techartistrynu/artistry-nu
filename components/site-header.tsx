"use client";

import Link from "next/link";
import {
  ChevronDown,
  Menu,
} from "lucide-react";
import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserNav } from "@/components/user-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// Custom black filled SVG icons
const SocialIcons = {
  Facebook: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.0726C24 5.44354 18.629 0.0725708 12 0.0725708C5.37097 0.0725708 0 5.44354 0 12.0726C0 18.0619 4.38823 23.0264 10.125 23.9274V15.5414H7.07661V12.0726H10.125V9.4287C10.125 6.42144 11.9153 4.76031 14.6574 4.76031C15.9706 4.76031 17.3439 4.99451 17.3439 4.99451V7.94612H15.8303C14.34 7.94612 13.875 8.87128 13.875 9.82015V12.0726H17.2031L16.6708 15.5414H13.875V23.9274C19.6118 23.0264 24 18.0619 24 12.0726Z"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.0027 5.84808C8.59743 5.84808 5.85075 8.59477 5.85075 12C5.85075 15.4053 8.59743 18.1519 12.0027 18.1519C15.4079 18.1519 18.1546 15.4053 18.1546 12C18.1546 8.59477 15.4079 5.84808 12.0027 5.84808ZM12.0027 15.9996C9.80212 15.9996 8.00312 14.2059 8.00312 12C8.00312 9.7941 9.79677 8.00046 12.0027 8.00046C14.2086 8.00046 16.0022 9.7941 16.0022 12C16.0022 14.2059 14.2032 15.9996 12.0027 15.9996ZM19.8412 5.59644C19.8412 6.39421 19.1987 7.03135 18.4062 7.03135C17.6085 7.03135 16.9713 6.38885 16.9713 5.59644C16.9713 4.80402 17.6138 4.16153 18.4062 4.16153C19.1987 4.16153 19.8412 4.80402 19.8412 5.59644ZM23.9157 7.05277C23.8247 5.13063 23.3856 3.42801 21.9775 2.02522C20.5747 0.622429 18.8721 0.183388 16.9499 0.0870135C14.9689 -0.0254238 9.03112 -0.0254238 7.05008 0.0870135C5.1333 0.178034 3.43068 0.617075 2.02253 2.01986C0.614389 3.42265 0.180703 5.12527 0.0843279 7.04742C-0.0281093 9.02845 -0.0281093 14.9662 0.0843279 16.9472C0.175349 18.8694 0.614389 20.572 2.02253 21.9748C3.43068 23.3776 5.12794 23.8166 7.05008 23.913C9.03112 24.0254 14.9689 24.0254 16.9499 23.913C18.8721 23.822 20.5747 23.3829 21.9775 21.9748C23.3803 20.572 23.8193 18.8694 23.9157 16.9472C24.0281 14.9662 24.0281 9.03381 23.9157 7.05277ZM21.3564 19.0728C20.9388 20.1223 20.1303 20.9307 19.0755 21.3537C17.496 21.9802 13.7481 21.8356 12.0027 21.8356C10.2572 21.8356 6.50396 21.9748 4.92984 21.3537C3.88042 20.9361 3.07195 20.1276 2.64897 19.0728C2.02253 17.4934 2.16709 13.7455 2.16709 12C2.16709 10.2546 2.02789 6.50129 2.64897 4.92717C3.06659 3.87776 3.87507 3.06928 4.92984 2.6463C6.50931 2.01986 10.2572 2.16443 12.0027 2.16443C13.7481 2.16443 17.5014 2.02522 19.0755 2.6463C20.1249 3.06392 20.9334 3.8724 21.3564 4.92717C21.9828 6.50665 21.8383 10.2546 21.8383 12C21.8383 13.7455 21.9828 17.4987 21.3564 19.0728Z"/>
    </svg>
  ),
  X: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99003 21.75H1.68003L9.41003 12.915L1.25403 2.25H8.08003L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.08403 4.126H5.11703L17.083 19.77Z"/>
    </svg>
  ),
  Youtube: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.4985 6.20286C23.2225 5.16356 22.4092 4.34503 21.3766 4.06726C19.505 3.5625 12 3.5625 12 3.5625C12 3.5625 4.49503 3.5625 2.62336 4.06726C1.59077 4.34508 0.777523 5.16356 0.501503 6.20286C0 8.08666 0 12.017 0 12.017C0 12.017 0 15.9474 0.501503 17.8312C0.777523 18.8705 1.59077 19.6549 2.62336 19.9327C4.49503 20.4375 12 20.4375 12 20.4375C12 20.4375 19.505 20.4375 21.3766 19.9327C22.4092 19.6549 23.2225 18.8705 23.4985 17.8312C24 15.9474 24 12.017 24 12.017C24 12.017 24 8.08666 23.4985 6.20286ZM9.54544 15.5855V8.44855L15.8181 12.0171L9.54544 15.5855Z"/>
    </svg>
  ),
  Linkedin: () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="black" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.20156 21H1.84688V6.97969H6.20156V21ZM4.02187 5.06719C2.62969 5.06719 1.5 3.91406 1.5 2.52187C1.5 1.85303 1.7657 1.21158 2.23864 0.73864C2.71158 0.265697 3.35303 0 4.02187 0C4.69072 0 5.33217 0.265697 5.80511 0.73864C6.27805 1.21158 6.54375 1.85303 6.54375 2.52187C6.54375 3.91406 5.41406 5.06719 4.02187 5.06719ZM22.4953 21H18.15V14.175C18.15 12.5484 18.1172 10.4625 15.8859 10.4625C13.6219 10.4625 13.275 12.2297 13.275 14.0578V21H8.925V6.97969H13.1016V8.89219H13.1625C13.7438 7.79062 15.1641 6.62812 17.2828 6.62812C21.6891 6.62812 22.5 9.52969 22.5 13.2984V21H22.4953Z"/>
    </svg>
  )
}

export function SiteHeader() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);

  const isLoading = status === "loading";
  const user = session?.user;
  const isAdmin = user?.role === "admin" ||  user?.role === "super-admin";

  return (
    <header className="sticky top-0 z-40 w-full bg-white pt-4 pb-2 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.1),0_2px_4px_-1px_rgba(0,0,0,0.06)]">
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
            className="text-[15px] font-semibold border-b-2 border-black pb-1"
          >
            Home
          </Link>

          <DropdownMenu onOpenChange={setIsServicesOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-[15px] font-semibold p-0 h-auto"
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
                <Link href="/tournaments" className="w-full text-[15px]">
                  Competition Enrollment
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.artistrynu.com/artistrynucomservices-artsale-art-painting"
                  className="w-full text-[15px]"
                >
                  Sell/Purchase Art
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.artistrynu.com/artistrynucomsolo-group-art-exhibitions"
                  className="w-full text-[15px]"
                >
                  Solo/Group Exhibitions
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="https://www.artistrynu.com/artistrynucomart-seminars-lectures-art-education"
                  className="w-full text-[15px]"
                >
                  Seminars/Lectures
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Link
            href="https://www.artistrynu.com/artistrynucomabout-artistrynu-artists-empowerment-and-networking"
            className="text-[15px] font-semibold"
          >
            Blogs/Videos
          </Link>
          <Link
            href="https://www.artistrynu.com/artistrynucomart-blog-insights-art-blog-and-industry-trends-finearts-paintingguids-creativedesigninsights"
            className="text-[15px] font-semibold"
          >
            About
          </Link>
          <Link
            href="https://www.artistrynu.com/artistrynucomcontact-artistrynu-pvt-ltd-enquiries-about-competitions-exhibitions-art-transactions-and-seminars-lectures-educations"
            className="text-[15px] font-semibold"
          >
            Contact
          </Link>

          {/* Social Icons */}
          <div className="flex items-center gap-4 ml-4">
            <Link
              href="https://www.facebook.com/profile.php?id=61575928265606"
              target="_blank"
              className="text-black hover:text-[#A9446B] transition-colors"
            >
              <SocialIcons.Facebook />
            </Link>
            <Link
              href="https://www.instagram.com/artistrynu.official/"
              target="_blank"
              className="text-black hover:text-[#A9446B] transition-colors"
            >
              <SocialIcons.Instagram />
            </Link>
            <Link 
              href="https://x.com/artistrynu" 
              target="_blank"
              className="text-black hover:text-[#A9446B] transition-colors"
            >
              <SocialIcons.X />
            </Link>
            <Link
              href="https://www.youtube.com/@ArtistrynuPvtLtd"
              target="_blank"
              className="text-black hover:text-[#A9446B] transition-colors"
            >
              <SocialIcons.Youtube />
            </Link>
            <Link
              href="https://www.linkedin.com/company/artistrynu-pvt-ltd/about/?viewAsMember=true"
              target="_blank"
              className="text-black hover:text-[#A9446B] transition-colors"
            >
              <SocialIcons.Linkedin />
            </Link>
          </div>
        </nav>

        {/* Auth + Theme + Mobile Nav */}
        <div className="flex items-center gap-4">
          {!isLoading && (
            <>
              {user ? (
                <>
                  {isAdmin ? (
                    <Link href="/admin/dashboard" className="hidden md:block">
                      <Button variant="outline" className="text-[15px] font-semibold">Admin Dashboard</Button>
                    </Link>
                  ) : (
                    <Link href="/dashboard" className="hidden md:block">
                      <Button variant="outline" className="text-[15px] font-semibold">Dashboard</Button>
                    </Link>
                  )}
                  <UserNav user={user} />
                </>
              ) : (
                <div className="hidden md:flex items-center gap-4">
                  <Link href="/login">
                    <Button variant="outline" className="text-[15px] font-semibold">Log in</Button>
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
                <Link
                  href="https://www.artistrynu.com/"
                  onClick={() => setIsOpen(false)}
                  className="text-[15px] font-semibold"
                >
                  Home
                </Link>

                <div className="flex flex-col gap-2 pl-4">
                  <button
                    onClick={() => setIsServicesOpen(!isServicesOpen)}
                    className="flex items-center justify-between text-[15px] font-semibold"
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
                        className="text-[15px]"
                      >
                        Competition Enrollment
                      </Link>
                      <Link
                        href="https://www.artistrynu.com/artistrynucomservices-artsale-art-painting"
                        onClick={() => setIsOpen(false)}
                        className="text-[15px]"
                      >
                        Sell/Purchase Art
                      </Link>
                      <Link
                        href="https://www.artistrynu.com/artistrynucomsolo-group-art-exhibitions"
                        onClick={() => setIsOpen(false)}
                        className="text-[15px]"
                      >
                        Solo/Group Exhibitions
                      </Link>
                      <Link
                        href="https://www.artistrynu.com/artistrynucomart-seminars-lectures-art-education"
                        onClick={() => setIsOpen(false)}
                        className="text-[15px]"
                      >
                        Seminars/Lectures
                      </Link>
                    </div>
                  )}
                </div>
                <Link
                  href="https://www.artistrynu.com/artistrynucomabout-artistrynu-artists-empowerment-and-networking"
                  onClick={() => setIsOpen(false)}
                  className="text-[15px] font-semibold"
                >
                  Blogs/Videos
                </Link>
                <Link
                  href="https://www.artistrynu.com/artistrynucomabout-artistrynu-artists-empowerment-and-networking"
                  onClick={() => setIsOpen(false)}
                  className="text-[15px] font-semibold"
                >
                  About
                </Link>
                <Link
                  href="https://www.artistrynu.com/artistrynucomcontact-artistrynu-pvt-ltd-enquiries-about-competitions-exhibitions-art-transactions-and-seminars-lectures-educations"
                  onClick={() => setIsOpen(false)}
                  className="text-[15px] font-semibold"
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
                            className="text-[15px] font-semibold"
                          >
                            Admin Dashboard
                          </Link>
                        ) : (
                          <Link
                            href="/dashboard"
                            onClick={() => setIsOpen(false)}
                            className="text-[15px] font-semibold"
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
                          className="text-[15px] font-semibold"
                        >
                          Log out
                        </Button>
                      </>
                    ) : (
                      <Link href="/login" onClick={() => setIsOpen(false)}>
                        <Button variant="outline" className="w-full text-[15px] font-semibold">
                          Log in
                        </Button>
                      </Link>
                    )}
                  </>
                )}
                {/* Mobile Social Icons - Added horizontal row */}
                <div className="flex items-center justify-left gap-4 pt-4">
                  <Link
                    href="https://www.facebook.com/profile.php?id=61575928265606"
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:text-[#A9446B] transition-colors"
                  >
                    <SocialIcons.Facebook />
                  </Link>
                  <Link
                    href="https://www.instagram.com/artistrynu.official/"
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:text-[#A9446B] transition-colors"
                  >
                    <SocialIcons.Instagram />
                  </Link>
                  <Link 
                    href="https://x.com/artistrynu" 
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:text-[#A9446B] transition-colors"
                  >
                    <SocialIcons.X />
                  </Link>
                  <Link
                    href="https://www.youtube.com/@ArtistrynuPvtLtd"
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:text-[#A9446B] transition-colors"
                  >
                    <SocialIcons.Youtube />
                  </Link>
                  <Link
                    href="https://www.linkedin.com/company/artistrynu-pvt-ltd/about/?viewAsMember=true"
                    target="_blank"
                    onClick={() => setIsOpen(false)}
                    className="text-black hover:text-[#A9446B] transition-colors"
                  >
                    <SocialIcons.Linkedin />
                  </Link>
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}