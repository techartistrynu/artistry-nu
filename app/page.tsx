import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Trophy, Upload, CreditCard, Award } from "lucide-react"

export default function Home() {
  return (
    <div className="flex flex-col">
      <main className="flex-1">
        <section className="py-12 md:py-24 lg:py-32 bg-muted">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                  Showcase Your Artistic Talent
                </h1>
                <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
                  Join our creative design tournaments, get recognized by industry experts, and win certificates.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button size="lg">Get Started</Button>
                </Link>
                <Link href="/tournaments">
                  <Button variant="outline" size="lg">
                    View Tournaments
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <section className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 sm:px-6 md:px-8">
            <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Trophy className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Register</h3>
                <p className="text-sm text-muted-foreground">Sign up and register for upcoming tournaments</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Upload className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Submit Artwork</h3>
                <p className="text-sm text-muted-foreground">Upload your creative designs and artwork</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <CreditCard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Payment</h3>
                <p className="text-sm text-muted-foreground">Secure payment for tournament registration</p>
              </div>
              <div className="flex flex-col items-center gap-2 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Award className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold">Certificates</h3>
                <p className="text-sm text-muted-foreground">Download your certificates after jury evaluation</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
