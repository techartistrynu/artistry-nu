"use client"

import { useEffect } from "react"
import { useTheme } from "next-themes"

export function ThemeScript() {
  const { setTheme, theme, resolvedTheme } = useTheme()

  // Only run once on mount to set the initial theme
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme")
    if (savedTheme && savedTheme !== theme) {
      setTheme(savedTheme)
    }
  }, []) // Empty dependency array means this only runs once on mount

  // Save theme changes to localStorage, but only when theme actually changes
  useEffect(() => {
    if (theme && theme !== "system") {
      localStorage.setItem("theme", theme)
    }
  }, [theme])

  return null
}
