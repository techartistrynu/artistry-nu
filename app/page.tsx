"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Upload, CreditCard, Award, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";


export default function Home() {
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  return (
    <div className="flex flex-col font-sans text-gray-900">
      <main className="flex-1">
        {/* Hero Section */}
        <motion.section
          className="py-20 bg-gradient-to-b from-pink-50 to-white text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="container mx-auto px-4">
            <motion.h1
              className="text-5xl md:text-6xl font-extrabold tracking-tight mb-6"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              Empowering Artists Through Innovation and Creativity
            </motion.h1>
            <motion.p
              className="max-w-2xl mx-auto text-lg md:text-xl text-muted-foreground mb-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Join our design tournaments, exhibit your work, and grow your
              artistic career.
            </motion.p>
            <motion.div
              className="flex justify-center gap-4 flex-wrap"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <Link href="/login">
                <Button size="lg" className="text-lg font-medium">
                  Get Started
                </Button>
              </Link>
              <Link href="/tournaments">
                <Button
                  variant="outline"
                  size="lg"
                  className="text-lg font-medium"
                >
                  View Competition Enrollment
                </Button>
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Services Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 sm:px-6 md:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-semibold mb-8">
              Our Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
              {[
                {
                  icon: <Trophy />,
                  title: "Competition Enrollment",
                  desc: "Participate in expert-curated competitions.",
                },
                {
                  icon: <Upload />,
                  title: "Sell/Purchase Art",
                  desc: "List or buy artwork from fellow artists.",
                },
                {
                  icon: <CreditCard />,
                  title: "Exhibitions",
                  desc: "Showcase your work in exhibitions globally.",
                },
                {
                  icon: <Award />,
                  title: "Lectures & Seminars",
                  desc: "Learn from industry leaders.",
                },
              ].map((item, idx) => (
                <motion.div
                  key={idx}
                  className="space-y-4"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                >
                  <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-primary/10">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-bold">{item.title}</h3>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Policies Section */}
        <section className="py-16 bg-white">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Our Policies</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                ArtistryNu Pvt Ltd is committed to fostering artistic excellence while ensuring transparency, professionalism, and ethical business practices. Below are the key policies that define our operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {/* Terms & Conditions */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Terms & Conditions</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Users must engage ethically when participating in competitions, purchases, or exhibitions.</li>
                  <li>• All artworks sold are subject to ownership rights and copyright protection.</li>
                  <li>• ArtistryNu Pvt. Ltd. reserves the right to update terms without prior notice.</li>
                </ul>
              </div>

              {/* Privacy Policy */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Privacy Policy</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• User data is securely stored and used only for purchase processing and event registration.</li>
                  <li>• ArtistryNu Pvt. Ltd. does not share user information with third parties without consent.</li>
                  <li>• Secure payment gateways ensure data protection.</li>
                </ul>
              </div>

              {/* Shipping Policy */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Shipping Policy</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• All artworks are carefully packaged and shipped via trusted couriers.</li>
                  <li>• Domestic delivery within 5-10 business days, international delivery within 10-20 business days.</li>
                  <li>• Tracking details will be shared upon dispatch.</li>
                </ul>
              </div>

              {/* Cancellation & Refund Policy */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Cancellation & Refund Policy</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Art Sales: No refunds once a purchase is finalized, except in cases of damage during transit.</li>
                  <li>• Competition Fees: Non-refundable unless the event is canceled by ArtistryNu Pvt Ltd.</li>
                  <li>• Exhibitions & Seminars: Refunds are processed within 7 days if cancellation is requested 48 hours before the event.</li>
                </ul>
              </div>

              {/* Disclaimer */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Disclaimer</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• All artworks displayed are subject to availability and variations in digital representation.</li>
                  <li>• ArtistryNu Pvt Ltd is not responsible for external opinions or reviews about artists.</li>
                </ul>
              </div>

              {/* Contact Us */}
              <div className="bg-muted p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4 text-center">Contact Us</h3>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  <li>• Direct channels for:</li>
                  <li>• Inquiries</li>
                  <li>• Collaborations</li>
                  <li>• Customer support</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-semibold mb-4">Frequently Asked Questions (FAQ)</h2>
              <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                In this section, we systematically address a selection of commonly posed enquiries with precision.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">What sets us apart?</h3>
                <p className="text-sm text-muted-foreground">
                  We offer bespoke solutions, ensuring that every art lover, art connoisseur and industry professional benefits from unparalleled service precise to address their unique needs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">What support do we offer?</h3>
                <p className="text-sm text-muted-foreground">
                  Our dedicated support team is available from 10:00 to 18:00 pm through a range of communication channels, including WhatsApp chat, email, text messaging, and telephone, to assist you with any inquiries you may have.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Is the website user-friendly?</h3>
                <p className="text-sm text-muted-foreground">
                  Our website has been thoughtfully developed with a focus on user-friendly navigation, allowing you to effortlessly explore various sections and find the information you need in a timely manner, enhancing your overall experience.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">How is your data secured?</h3>
                <p className="text-sm text-muted-foreground">
                  Your personal data is meticulously protected by sophisticated encryption technologies and comprehensive security protocols, ensuring its integrity and confidentiality.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Can you trust with us and our team?</h3>
                <p className="text-sm text-muted-foreground">
                  We collaborate closely with a highly esteemed and exceptionally skilled team of professionals to carefully design and deliver a wide range of premium art and services that consistently exceed your expectations and fulfill your needs.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <h3 className="text-xl font-semibold mb-3">Are links to other websites approved?</h3>
                <p className="text-sm text-muted-foreground">
                  This Website may feature links to external sites; however, we do not, either directly or indirectly, express any endorsement of those sites.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {/* <section className="py-12 bg-gray text-white">
          <div className="container px-4 sm:px-6 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Join Artistry Today
            </h2>
            <p className="mb-6">
              Ready to showcase your talent to the world? Create your profile
              and become part of a vibrant creative community.
            </p>
            <Link href="/login">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg font-medium"
              >
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section> */}
      </main>
    </div>
  );
}
