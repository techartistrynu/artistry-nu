"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Download, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"
import { format } from "date-fns"

export default function AdminCertificatesPage() {
  const [certificates, setCertificates] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const supabase = createBrowserClient()

  useEffect(() => {
    fetchCertificates()
  }, [])

  const fetchCertificates = async () => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select(`
          *,
          users:user_id (name, email),
          tournaments:tournament_id (title),
          submissions:submission_id (title)
        `)
        .order("issue_date", { ascending: false })

      if (error) {
        throw error
      }

      setCertificates(data || [])
    } catch (error) {
      console.error("Error fetching certificates:", error)
      toast({
        title: "Error",
        description: "Failed to fetch certificates",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "issued":
        return "bg-green-500"
      case "pending":
        return "bg-yellow-500"
      case "revoked":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <p>Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <p>No certificates found.</p>
        ) : (
          certificates.map((certificate) => (
            <Card key={certificate.id}>
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle>Certificate #{certificate.certificate_number}</CardTitle>
                  <CardDescription>
                    For {certificate.submissions?.title || "Unknown Submission"} in{" "}
                    {certificate.tournaments?.title || "Unknown Tournament"}
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Badge className={getStatusColor(certificate.status)}>{certificate.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Issued To</p>
                    <p className="text-sm text-muted-foreground">{certificate.users?.name || "Unknown"}</p>
                    <p className="text-sm text-muted-foreground">{certificate.users?.email || "Unknown"}</p>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <p className="text-sm font-medium">Issue Date</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(certificate.issue_date), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2 mt-4">
                  <Link href={`/admin/certificates/${certificate.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View
                    </Button>
                  </Link>
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
