"use client"

import { useEffect, useState } from "react"

type AuthData = {
  id: string
  email: string
  name: string
  role: "admin" | "user"
  image?: string
  expires: Date
}

export function useLocalAuth(): AuthData | null {
  const [authData, setAuthData] = useState<AuthData | null>(null)

  useEffect(() => {
    const storedAuth = localStorage.getItem("auth")
    if (storedAuth) {
      const parsed = JSON.parse(storedAuth)
      // Convert string date back to Date object
      parsed.expires = new Date(parsed.expires)
      setAuthData(parsed)
    }
  }, [])

  return authData
}