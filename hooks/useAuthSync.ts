"use client"

import { useEffect } from "react"
import { useSession } from "next-auth/react"

export function useAuthSync() {
  const { data: session } = useSession()

  useEffect(() => {
    if (session?.user) {
      localStorage.setItem(
        "auth",
        JSON.stringify({
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
        //   role: session.user.role,
          image: session.user.image,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
        })
      )
    } else {
      localStorage.removeItem("auth")
    }
  }, [session])
}