import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Award, Download, Eye } from "lucide-react"
import Link from "next/link"
import { getCertificatesByUserId } from "@/app/actions/certificates"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardCertificatesPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const certificates = await getCertificatesByUserId(session.user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">My Certificates</h2>
      </div>

      {certificates.length > 0 ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {certificates.map((certificate) => (
            <Card key={certificate.id} className="flex flex-col">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{certificate.tournaments?.title}</CardTitle>
                    <CardDescription className="mt-1">
                      {certificate.submissions?.rank
                        ? `${getOrdinal(certificate.submissions.rank)} Place`
                        : "Participation"}
                    </CardDescription>
                  </div>
                  <Badge variant={certificate.status === "issued" ? "default" : "outline"}>
                    {certificate.status.charAt(0).toUpperCase() + certificate.status.slice(1)}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="aspect-[8.5/11] overflow-hidden rounded-md border bg-muted mb-4">
                  <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                    <Award className="h-12 w-12 text-primary mb-2" />
                    <h3 className="text-lg font-bold">Certificate of Achievement</h3>
                    <p className="text-sm mt-2">
                      {certificate.certificate_number} • {new Date(certificate.issue_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Certificate ID:</span>
                    <span className="text-sm">{certificate.certificate_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Issue Date:</span>
                    <span className="text-sm">{new Date(certificate.issue_date).toLocaleDateString()}</span>
                  </div>
                </div>
              </CardContent>
              <div className="p-4 pt-0 mt-auto">
                <div className="flex gap-2">
                  <Link href={`/dashboard/certificates/${certificate.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Button className="flex-1">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-60 p-6">
            <Award className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Certificates Yet</h3>
            <p className="text-center text-muted-foreground mb-4">
              You haven't earned any certificates yet. Participate in tournaments and submit your work to earn
              certificates.
            </p>
            <Link href="/dashboard/tournaments">
              <Button>Browse Tournaments</Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
