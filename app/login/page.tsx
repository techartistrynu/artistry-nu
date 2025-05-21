"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { signIn, useSession } from "next-auth/react"
import { Palette } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const { data: session, status } = useSession()

  useEffect(() => {
    if (status === "authenticated") {
      const redirectPath = session?.user?.role === "admin" ? "/admin/dashboard" : "/dashboard"
      router.push(redirectPath)
    }
  }, [status, session, router])

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true)
      setError(null)
      const result = await signIn("google", { 
        redirect: false,
        callbackUrl: "/dashboard"
      })
      
      if (result?.error) {
        setError(result.error)
        toast({
          title: "Login Failed",
          description: result.error,
          variant: "destructive",
        })
      } else if (result?.url) {
        router.push(result.url)
      }
    } catch (error) {
      setError("An unexpected error occurred")
      toast({
        title: "Login Failed",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAdminLogin = () => {
    // Use router.push instead of link to avoid 405 errors
    router.push("/admin/login")
  }

  if (status === "loading") {
    return (
      <div className="container flex h-screen w-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center px-4 sm:px-6 md:px-8">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleGoogleLogin}
              disabled={isLoading}
            >
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Admin Access
                </span>
              </div>
            </div>

            <Button 
              variant="ghost" 
              className="w-full"
              onClick={handleAdminLogin}
              disabled={isLoading}
            >
              Admin Login
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}