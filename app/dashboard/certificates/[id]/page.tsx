import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Download, Share2 } from "lucide-react"
import Link from "next/link"
import { getCertificateById } from "@/app/actions/certificates"

interface CertificateDetailsPageProps {
  params: {
    id: string
  }
}

export default async function CertificateDetailsPage({ params }: CertificateDetailsPageProps) {
  const certificate = await getCertificateById(params.id)

  if (!certificate) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/certificates">
            <Button variant="outline" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h2 className="text-3xl font-bold tracking-tight">Certificate Not Found</h2>
        </div>
        <p>The certificate you're looking for doesn't exist or has been removed.</p>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center space-x-2">
        <Link href="/dashboard/certificates">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h2 className="text-3xl font-bold tracking-tight">Certificate Details</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{certificate.tournaments?.title} Certificate</CardTitle>
              <CardDescription>
                {certificate.submissions?.rank ? `${getOrdinal(certificate.submissions.rank)} Place` : "Participation"}{" "}
                - {certificate.submissions?.title}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="aspect-[8.5/11] overflow-hidden rounded-md border bg-muted">
                  {certificate.file_path ? (
                    <img
                      src={certificate.file_path || "/placeholder.svg"}
                      alt={`${certificate.tournaments?.title} Certificate`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                      <h2 className="text-2xl font-bold mb-4">Certificate of Achievement</h2>
                      <p className="text-lg mb-8">This certifies that</p>
                      <p className="text-xl font-bold mb-8">{certificate.users?.name}</p>
                      <p className="text-lg mb-4">
                        has been awarded{" "}
                        {certificate.submissions?.rank
                          ? getOrdinal(certificate.submissions.rank) + " Place"
                          : "recognition"}{" "}
                        in the
                      </p>
                      <p className="text-xl font-bold mb-8">{certificate.tournaments?.title}</p>
                      <p className="text-lg mb-4">for the submission</p>
                      <p className="text-xl font-bold mb-8">{certificate.submissions?.title}</p>
                      <p className="text-lg mb-2">Certificate ID: {certificate.certificate_number}</p>
                      <p className="text-lg">Issued on: {new Date(certificate.issue_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </Button>
              <Button>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Certificate Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Certificate ID:</span>
                    <span className="text-sm">{certificate.certificate_number}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Issue Date:</span>
                    <span className="text-sm">{new Date(certificate.issue_date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <span className="text-sm capitalize">{certificate.status}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Tournament:</span>
                    <span className="text-sm">{certificate.tournaments?.title}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Submission:</span>
                    <span className="text-sm">{certificate.submissions?.title}</span>
                  </div>
                  {certificate.submissions?.rank && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Rank:</span>
                      <span className="text-sm">{getOrdinal(certificate.submissions.rank)}</span>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Verification</CardTitle>
              <CardDescription>Certificate authenticity information</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  This certificate can be verified using the Certificate ID and the verification portal on the
                  ArtistryNu website.
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Verification URL:</span>
                </div>
                <div className="p-2 bg-muted rounded-md">
                  <code className="text-xs break-all">
                    https://artistrynu.com/verify/{certificate.certificate_number}
                  </code>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full">
                Verify Certificate
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}

function getOrdinal(n: number): string {
  const s = ["th", "st", "nd", "rd"]
  const v = n % 100
  return n + (s[(v - 20) % 10] || s[v] || s[0])
}
