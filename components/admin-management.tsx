"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Users, Shield, Calendar, Mail, UserPlus, Trash2 } from "lucide-react"

interface AdminData {
  id: string
  email: string
  name: string
  role: "admin" | "super-admin"
  createdAt: string
  updatedAt: string
  lastLoginAt?: string
}

export default function AdminManagement() {
  const { data: session } = useSession()
  const [admins, setAdmins] = useState<AdminData[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Only show this component to super-admins
  if (session?.user?.role !== "super-admin") {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
          <CardDescription>
            You need super-admin privileges to access this feature.
          </CardDescription>
        </CardHeader>
      </Card>
    )
  }

  const fetchAdmins = async () => {
    try {
      const response = await fetch("/api/admin/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "list"
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setAdmins(data.admins || [])
      } else {
        setError("Failed to fetch admin list")
      }
    } catch (error) {
      setError("An error occurred while fetching admin list")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAdmins()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const getRoleBadge = (role: string) => {
    return role === "super-admin" ? (
      <Badge variant="destructive" className="flex items-center gap-1">
        <Shield className="h-3 w-3" />
        Super Admin
      </Badge>
    ) : (
      <Badge variant="secondary" className="flex items-center gap-1">
        <Users className="h-3 w-3" />
        Admin
      </Badge>
    )
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Admin Management</CardTitle>
          <CardDescription>Loading admin accounts...</CardDescription>
        </CardHeader>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Admin Management
              </CardTitle>
              <CardDescription>
                Manage admin accounts and permissions
              </CardDescription>
            </div>
            <Button className="flex items-center gap-2">
              <UserPlus className="h-4 w-4" />
              Add Admin
            </Button>
          </div>
        </CardHeader>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold text-lg">{admin.name}</h3>
                    {getRoleBadge(admin.role)}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    {admin.email}
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      Created: {formatDate(admin.createdAt)}
                    </div>
                    {admin.lastLoginAt && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Last Login: {formatDate(admin.lastLoginAt)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  {admin.role !== "super-admin" && (
                    <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {admins.length === 0 && !isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Admin Accounts</h3>
              <p className="text-muted-foreground mb-4">
                No admin accounts found. Create the first admin account to get started.
              </p>
              <Button className="flex items-center gap-2 mx-auto">
                <UserPlus className="h-4 w-4" />
                Create First Admin
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 