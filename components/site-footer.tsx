import Link from "next/link"
import { Facebook, Instagram, Youtube, Linkedin, X } from "lucide-react"

export function SiteFooter() {
  return (
    <footer className="bg-[#2B2D31] text-white font-sans py-16">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 py-10 px-6 md:px-12">
        {/* Social Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Connect our socials</h3>
          <p className="text-sm text-gray-300 mb-4">
            Fostering creativity through art and design services.
          </p>
          <div className="flex gap-4">
            <Link href="https://www.facebook.com/profile.php?id=61575928265606" target="_blank" aria-label="Facebook">
              <Facebook className="h-6 w-6 hover:text-pink-400" />
            </Link>
            <Link href="https://www.instagram.com/artistrynu.official/" target="_blank" aria-label="Instagram">
              <Instagram className="h-6 w-6 hover:text-pink-400" />
            </Link>
            <Link href="https://x.com/artistrynu" target="_blank" aria-label="X">
              <X className="h-6 w-6 hover:text-pink-400" />
            </Link>
            <Link href="https://www.youtube.com/@ArtistrynuPvtLtd" target="_blank" aria-label="YouTube">
              <Youtube className="h-6 w-6 hover:text-pink-400" />
            </Link>
            <Link
              href="https://www.linkedin.com/company/artistrynu-pvt-ltd/about/?viewAsMember=true"
              target="_blank"
              aria-label="LinkedIn"
            >
              <Linkedin className="h-6 w-6 hover:text-pink-400" />
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Contact us</h3>
          <ul className="text-sm text-gray-300 space-y-1">
            <li>Phone - +91-8527339721</li>
            <li>Whatsapp - +91-8527339721</li>
            <li>support@artistrynu.com</li>
            <li>support@artistrynu.in</li>
            <li>artistrynu@gmail.com</li>
          </ul>
        </div>

        {/* Subscribe Section */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Subscribe</h3>
          <p className="text-sm text-gray-300 mb-2">Enter your email address</p>
          <form className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Your email for updates"
              className="px-4 py-2 rounded-md text-black w-full sm:w-auto flex-grow"
              required
            />
            <button
              type="submit"
              className="bg-pink-600 hover:bg-pink-700 text-white font-semibold px-6 py-2 rounded-md"
            >
              Submit now
            </button>
          </form>
        </div>
      </div>

      {/* Copyright */}
      <div className="container mx-auto px-4 mt-10 border-t border-gray-700 pt-4 text-sm text-gray-400">
        <p>
          Copyright © 2025, ArtistryNU Pvt Ltd. All rights reserved.
          <br />
          No part of this website may be reproduced, distributed, or transmitted in any form without prior written
          permission.
        </p>
      </div>
    </footer>
  )
}
