import Link from "next/link"
import { Metadata } from "next"

export const metadata: Metadata = {
  icons: [
    { rel: "icon", url: "/favicon.ico" },
    { rel: "apple-touch-icon", url: "/favicon.ico" },
  ],
}

// Custom filled SVG icons
const SocialIcons = {
  Facebook: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 12.0726C24 5.44354 18.629 0.0725708 12 0.0725708C5.37097 0.0725708 0 5.44354 0 12.0726C0 18.0619 4.38823 23.0264 10.125 23.9274V15.5414H7.07661V12.0726H10.125V9.4287C10.125 6.42144 11.9153 4.76031 14.6574 4.76031C15.9706 4.76031 17.3439 4.99451 17.3439 4.99451V7.94612H15.8303C14.34 7.94612 13.875 8.87128 13.875 9.82015V12.0726H17.2031L16.6708 15.5414H13.875V23.9274C19.6118 23.0264 24 18.0619 24 12.0726Z"/>
    </svg>
  ),
  Instagram: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.0027 5.84808C8.59743 5.84808 5.85075 8.59477 5.85075 12C5.85075 15.4053 8.59743 18.1519 12.0027 18.1519C15.4079 18.1519 18.1546 15.4053 18.1546 12C18.1546 8.59477 15.4079 5.84808 12.0027 5.84808ZM12.0027 15.9996C9.80212 15.9996 8.00312 14.2059 8.00312 12C8.00312 9.7941 9.79677 8.00046 12.0027 8.00046C14.2086 8.00046 16.0022 9.7941 16.0022 12C16.0022 14.2059 14.2032 15.9996 12.0027 15.9996ZM19.8412 5.59644C19.8412 6.39421 19.1987 7.03135 18.4062 7.03135C17.6085 7.03135 16.9713 6.38885 16.9713 5.59644C16.9713 4.80402 17.6138 4.16153 18.4062 4.16153C19.1987 4.16153 19.8412 4.80402 19.8412 5.59644ZM23.9157 7.05277C23.8247 5.13063 23.3856 3.42801 21.9775 2.02522C20.5747 0.622429 18.8721 0.183388 16.9499 0.0870135C14.9689 -0.0254238 9.03112 -0.0254238 7.05008 0.0870135C5.1333 0.178034 3.43068 0.617075 2.02253 2.01986C0.614389 3.42265 0.180703 5.12527 0.0843279 7.04742C-0.0281093 9.02845 -0.0281093 14.9662 0.0843279 16.9472C0.175349 18.8694 0.614389 20.572 2.02253 21.9748C3.43068 23.3776 5.12794 23.8166 7.05008 23.913C9.03112 24.0254 14.9689 24.0254 16.9499 23.913C18.8721 23.822 20.5747 23.3829 21.9775 21.9748C23.3803 20.572 23.8193 18.8694 23.9157 16.9472C24.0281 14.9662 24.0281 9.03381 23.9157 7.05277ZM21.3564 19.0728C20.9388 20.1223 20.1303 20.9307 19.0755 21.3537C17.496 21.9802 13.7481 21.8356 12.0027 21.8356C10.2572 21.8356 6.50396 21.9748 4.92984 21.3537C3.88042 20.9361 3.07195 20.1276 2.64897 19.0728C2.02253 17.4934 2.16709 13.7455 2.16709 12C2.16709 10.2546 2.02789 6.50129 2.64897 4.92717C3.06659 3.87776 3.87507 3.06928 4.92984 2.6463C6.50931 2.01986 10.2572 2.16443 12.0027 2.16443C13.7481 2.16443 17.5014 2.02522 19.0755 2.6463C20.1249 3.06392 20.9334 3.8724 21.3564 4.92717C21.9828 6.50665 21.8383 10.2546 21.8383 12C21.8383 13.7455 21.9828 17.4987 21.3564 19.0728Z"/>
    </svg>
  ),
  X: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.244 2.25H21.552L14.325 10.51L22.827 21.75H16.17L10.956 14.933L4.99003 21.75H1.68003L9.41003 12.915L1.25403 2.25H8.08003L12.793 8.481L18.244 2.25ZM17.083 19.77H18.916L7.08403 4.126H5.11703L17.083 19.77Z"/>
    </svg>
  ),
  Youtube: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.4985 6.20286C23.2225 5.16356 22.4092 4.34503 21.3766 4.06726C19.505 3.5625 12 3.5625 12 3.5625C12 3.5625 4.49503 3.5625 2.62336 4.06726C1.59077 4.34508 0.777523 5.16356 0.501503 6.20286C0 8.08666 0 12.017 0 12.017C0 12.017 0 15.9474 0.501503 17.8312C0.777523 18.8705 1.59077 19.6549 2.62336 19.9327C4.49503 20.4375 12 20.4375 12 20.4375C12 20.4375 19.505 20.4375 21.3766 19.9327C22.4092 19.6549 23.2225 18.8705 23.4985 17.8312C24 15.9474 24 12.017 24 12.017C24 12.017 24 8.08666 23.4985 6.20286ZM9.54544 15.5855V8.44855L15.8181 12.0171L9.54544 15.5855Z"/>
    </svg>
  ),
  Linkedin: () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M6.20156 21H1.84688V6.97969H6.20156V21ZM4.02187 5.06719C2.62969 5.06719 1.5 3.91406 1.5 2.52187C1.5 1.85303 1.7657 1.21158 2.23864 0.73864C2.71158 0.265697 3.35303 0 4.02187 0C4.69072 0 5.33217 0.265697 5.80511 0.73864C6.27805 1.21158 6.54375 1.85303 6.54375 2.52187C6.54375 3.91406 5.41406 5.06719 4.02187 5.06719ZM22.4953 21H18.15V14.175C18.15 12.5484 18.1172 10.4625 15.8859 10.4625C13.6219 10.4625 13.275 12.2297 13.275 14.0578V21H8.925V6.97969H13.1016V8.89219H13.1625C13.7438 7.79062 15.1641 6.62812 17.2828 6.62812C21.6891 6.62812 22.5 9.52969 22.5 13.2984V21H22.4953Z"/>
    </svg>
  )
}

export function SiteFooter() {
  return (
    <footer className="bg-[#2C2F33] text-[#F5F5F5] font-sans text-base">
      <div className="container mx-auto pt-20 pb-10 px-20 grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Social Section */}
        <div className="md:col-span-4">
          <h3 className="text-xl lg:text-2xl font-semibold mb-4">Connect our socials</h3>
          <p className="text-[15px] lg:text-base text-[#F5F5F5]/80 mb-6 leading-relaxed">
            Fostering creativity through art and design services.
          </p>
          <div className="flex gap-6">
            <Link 
              href="https://www.facebook.com/profile.php?id=61575928265606" 
              target="_blank" 
              aria-label="Facebook"
              className="text-[#F5F5F5] hover:text-pink-400 transition-colors"
            >
              <SocialIcons.Facebook />
            </Link>
            <Link 
              href="https://www.instagram.com/artistrynu.official/" 
              target="_blank" 
              aria-label="Instagram"
              className="text-[#F5F5F5] hover:text-pink-400 transition-colors"
            >
              <SocialIcons.Instagram />
            </Link>
            <Link 
              href="https://x.com/artistrynu" 
              target="_blank" 
              aria-label="X"
              className="text-[#F5F5F5] hover:text-pink-400 transition-colors"
            >
              <SocialIcons.X />
            </Link>
            <Link 
              href="https://www.youtube.com/@ArtistrynuPvtLtd" 
              target="_blank" 
              aria-label="YouTube"
              className="text-[#F5F5F5] hover:text-pink-400 transition-colors"
            >
              <SocialIcons.Youtube />
            </Link>
            <Link
              href="https://www.linkedin.com/company/artistrynu-pvt-ltd/about/?viewAsMember=true"
              target="_blank"
              aria-label="LinkedIn"
              className="text-[#F5F5F5] hover:text-pink-400 transition-colors"
            >
              <SocialIcons.Linkedin />
            </Link>
          </div>
        </div>

        {/* Contact Section */}
        <div className="md:col-span-4">
          <h3 className="text-xl lg:text-2xl font-semibold mb-4">Contact us</h3>
          <ul className="text-[15px] lg:text-base text-[#F5F5F5]/90 space-y-2">
            <li>Phone - +91-8527339721</li>
            <li>Whatsapp - +91-8527339721</li>
            <li>support@artistrynu.com</li>
            <li>artistrynu@gmail.com</li>
          </ul>
        </div>

        {/* Subscribe Section */}
        <div className="md:col-span-4">
          <h3 className="text-xl lg:text-2xl font-semibold mb-4">Subscribe</h3>
          <form className="flex flex-col gap-4">
            <div className="form-group">
              <label htmlFor="email" className="block text-[15px] lg:text-base text-[#F5F5F5]/90 mb-2">
                Enter your email address
              </label>
              <input
                id="email"
                type="email"
                placeholder="Your email for updates"
                className="w-full px-4 py-2 rounded-lg border border-gray-400 focus:border-gray-600 focus:outline-none text-black text-[15px] lg:text-base"
                required
              />
            </div>
            <button
              type="submit"
              className="bg-[#A9446B] hover:bg-[#8a3759] text-[#F5F5F5] font-semibold px-6 py-2 rounded-full w-fit transition-colors text-[15px] lg:text-base"
            >
              Submit now
            </button>
          </form>
        </div>

        {/* Copyright */}
        <div className="md:col-span-4 pt-8">
          <p className="text-[14px] lg:text-[15px] text-[#F5F5F5]/70 leading-relaxed">
            Copyright © 2025, ArtistryNU Pvt Ltd. All rights reserved. No part of this website may be reproduced, distributed, or transmitted in any form without prior written permission.
          </p>
        </div>
      </div>
    </footer>
  )
}