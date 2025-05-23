"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Trophy, Upload, CreditCard, Award, X } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import Image from "next/image";

const galleryImages = [
  "https://fastly.picsum.photos/id/967/536/354.jpg?hmac=tiSjXla6v9WshyaQYJPoDJ6Ow6b52ZVSZS1Q8r2FDxI",
  "https://fastly.picsum.photos/id/625/536/354.jpg?hmac=jBI5estK5IS3_Ux9B3Io49XVEtNBulVMmlQ4DDXqXb4",
  "https://fastly.picsum.photos/id/134/536/354.jpg?hmac=GqngKpJ4MNwWb4KIR11yok3yVmLUyrVIYAX2E37h4dA",
  "https://fastly.picsum.photos/id/645/536/354.jpg?hmac=96r6IlgzOM-FeJsYA4jlClwhnx4PR7yOxB-P4d5ih3A",
  "https://fastly.picsum.photos/id/824/536/354.jpg?hmac=3b2BSF4o6tG_5gOx0YiMDgEtQ8-2ZLuhKAxmObpqgXg",
  "https://fastly.picsum.photos/id/982/536/354.jpg?hmac=xXo1bhVRPwA6K0ttkJqSEghDCDNd7xWKfKpE5kqXlQo",
];

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
                  View Tournaments
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

        {/* Gallery Section */}
        <section className="py-16 bg-muted">
          <div className="container px-4 sm:px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
              Gallery Showcase
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {galleryImages.map((src, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setPreviewImage(src)}
                  className="cursor-pointer"
                >
                  <Image
                    src={src}
                    alt={`Art ${index + 1}`}
                    width={300}
                    height={200}
                    className="rounded-md object-cover"
                  />
                </motion.div>
              ))}
            </div>
          </div>

          {/* Modal Preview */}
          {previewImage && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50"
              onClick={() => setPreviewImage(null)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              <div className="relative">
                <Image
                  src={previewImage}
                  alt="Preview"
                  width={800}
                  height={600}
                  className="rounded-lg max-h-[80vh] w-auto"
                />
                <Button
                  variant="ghost"
                  className="absolute top-2 right-2 text-white"
                  onClick={() => setPreviewImage(null)}
                >
                  <X />
                </Button>
              </div>
            </motion.div>
          )}
        </section>
        {/* Expert Insights Section */}
        <section className="py-16 bg-muted">
          <div className="container px-4 sm:px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-10">
              Expert Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 bg-white rounded-lg text-center shadow">
                <h3 className="text-lg font-bold mb-2">Dr. Maya Arora</h3>
                <p className="text-sm text-muted-foreground">
                  Renowned Art Historian & Critic
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg text-center shadow">
                <h3 className="text-lg font-bold mb-2">Rahul Mehta</h3>
                <p className="text-sm text-muted-foreground">
                  Gallery Curator & Exhibition Designer
                </p>
              </div>
              <div className="p-6 bg-white rounded-lg text-center shadow">
                <h3 className="text-lg font-bold mb-2">Shruti Verma</h3>
                <p className="text-sm text-muted-foreground">
                  Award-winning Visual Artist
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section
          className="py-16 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('https://fastly.picsum.photos/id/291/536/354.jpg?hmac=bfJIaH0FmtH4w44We3rF30m4Kd8zK4jsOAbLFVh2E20')" }} // Place this image in your public/ folder
        >
          <div className="bg-white bg-opacity-90 p-8 rounded-lg max-w-2xl mx-auto shadow-lg">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">
              Get in Touch
            </h2>
            <form className="space-y-4">
              <input
                type="text"
                placeholder="Name"
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <input
                type="email"
                placeholder="Email"
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <textarea
                placeholder="Your message"
                className="w-full p-3 rounded border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
              ></textarea>
              <Button className="w-full">Submit</Button>
            </form>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 bg-muted">
          <div className="container px-4 sm:px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-semibold text-center mb-8">
              Frequently Asked Questions
            </h2>
            <div className="grid gap-6 max-w-4xl mx-auto">
              <div>
                <h3 className="text-lg font-semibold">
                  What services do you offer?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We help artists compete, sell artwork, exhibit, and gain
                  knowledge through seminars.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Is the website user-friendly?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Yes, we ensure a seamless user experience across devices.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  What support do artists receive?
                </h3>
                <p className="text-sm text-muted-foreground">
                  Support includes listing services, networking events, and
                  promotional features.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  How is your data secured?
                </h3>
                <p className="text-sm text-muted-foreground">
                  We use industry-grade security practices to protect user data.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-12 bg-primary text-white">
          <div className="container px-4 sm:px-6 md:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">
              Join Artistry Today
            </h2>
            <p className="mb-6">
              Ready to showcase your talent to the world? Create your profile
              and become part of a vibrant creative community.
            </p>
            <Link href="/register">
              <Button
                size="lg"
                variant="secondary"
                className="text-lg font-medium"
              >
                Sign Up Now
              </Button>
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
