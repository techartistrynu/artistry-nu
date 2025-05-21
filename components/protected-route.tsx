"use client"

import type React from "react"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== "loading" && !session?.user) {
      router.push("/login")
    }
  }, [session, status, router])

  if (status === "loading") {
    return <div className="flex-1 p-8 flex items-center justify-center">Loading...</div>
  }

  if (!session?.user) {
    return null
  }

  return <>{children}</>
}
