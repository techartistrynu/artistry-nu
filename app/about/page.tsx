import { Card, CardContent } from "@/components/ui/card"
import { Palette, Trophy, Award, Users } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="container px-4 sm:px-6 md:px-8 py-10 md:py-20">
      <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">About ArtistryNu</h1>
          <p className="mx-auto max-w-[700px] text-muted-foreground md:text-xl">
            Empowering creative students to showcase their talent and gain recognition
          </p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground mb-6">
            ArtistryNu was founded with a clear mission: to provide a platform where creative design and art students
            can showcase their talent, compete in prestigious tournaments, and gain recognition from industry experts.
          </p>
          <p className="text-muted-foreground mb-6">
            We believe that every student deserves the opportunity to have their work seen and appreciated. Our platform
            bridges the gap between education and industry, helping students build portfolios that stand out and
            connecting them with opportunities for growth.
          </p>
          <p className="text-muted-foreground">
            Through our tournaments, workshops, and community events, we aim to foster a supportive environment where
            creativity thrives and innovation is celebrated.
          </p>
        </div>
        <div className="relative h-[400px] overflow-hidden rounded-lg">
          <img
            src="/placeholder.svg?height=400&width=600"
            alt="Creative students collaborating"
            className="h-full w-full object-cover"
          />
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-4 my-16">
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Trophy className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">50+</h3>
            <p className="text-muted-foreground">Tournaments Hosted</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">10,000+</h3>
            <p className="text-muted-foreground">Student Participants</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Palette className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">25,000+</h3>
            <p className="text-muted-foreground">Artwork Submissions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col items-center text-center p-6">
            <div className="mb-4 rounded-full bg-primary/10 p-3">
              <Award className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">5,000+</h3>
            <p className="text-muted-foreground">Certificates Awarded</p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-16">
        <h2 className="text-2xl font-bold mb-6 text-center">Our Team</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <div className="flex flex-col items-center text-center">
            <div className="h-32 w-32 overflow-hidden rounded-full mb-4">
              <img
                src="/placeholder.svg?height=128&width=128"
                alt="Sarah Johnson"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold">Sarah Johnson</h3>
            <p className="text-primary mb-2">Founder & CEO</p>
            <p className="text-muted-foreground">Former art professor with a passion for nurturing creative talent.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-32 w-32 overflow-hidden rounded-full mb-4">
              <img
                src="/placeholder.svg?height=128&width=128"
                alt="Michael Chen"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold">Michael Chen</h3>
            <p className="text-primary mb-2">Creative Director</p>
            <p className="text-muted-foreground">Award-winning designer with 15 years of industry experience.</p>
          </div>
          <div className="flex flex-col items-center text-center">
            <div className="h-32 w-32 overflow-hidden rounded-full mb-4">
              <img
                src="/placeholder.svg?height=128&width=128"
                alt="Olivia Rodriguez"
                className="h-full w-full object-cover"
              />
            </div>
            <h3 className="text-xl font-bold">Olivia Rodriguez</h3>
            <p className="text-primary mb-2">Head of Operations</p>
            <p className="text-muted-foreground">
              Experienced in organizing large-scale creative events and competitions.
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold mb-6 text-center">Our Values</h2>
        <div className="grid gap-8 md:grid-cols-3">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Creativity</h3>
              <p className="text-muted-foreground">
                We believe in the power of creative expression and its ability to transform lives and communities.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Inclusivity</h3>
              <p className="text-muted-foreground">
                We welcome students from all backgrounds and celebrate diversity in artistic expression.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-2">Excellence</h3>
              <p className="text-muted-foreground">
                We strive for excellence in everything we do, from organizing tournaments to supporting our community.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
