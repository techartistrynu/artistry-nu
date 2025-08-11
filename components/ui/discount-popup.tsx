"use client"

import { useState, useEffect } from "react"
import { X, Percent, AlertTriangle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface DiscountPopupProps {
  discountPercent: number
  originalPrice: number
  discountedPrice: number
  tournamentTitle: string
  tournamentId: string
}

export function DiscountPopup({ 
  discountPercent, 
  originalPrice, 
  discountedPrice, 
  tournamentTitle,
  tournamentId
}: DiscountPopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has already seen this specific tournament's popup
    const hasSeenPopup = localStorage.getItem(`tournamentPopup_${tournamentId}`)
    if (hasSeenPopup === 'true') {
      return
    }

    // Show popup if discount is more than 30%
    if (discountPercent > 30) {
      setIsVisible(true)
    }
  }, [discountPercent, tournamentTitle, tournamentId])

  const handleClose = () => {
    setIsVisible(false)
    if (dontShowAgain) {
      localStorage.setItem(`tournamentPopup_${tournamentId}`, 'true')
    }
  }

  if (!isVisible || discountPercent <= 30) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-md relative animate-in zoom-in-95 duration-200">
        <CardHeader className="text-center pb-4">
          <div className="absolute top-2 right-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex items-center justify-center gap-2 mb-2">
            <AlertTriangle className="h-6 w-6 text-orange-500" />
            <CardTitle className="text-xl">Special Offer!</CardTitle>
          </div>
          <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-lg px-4 py-2">
            {discountPercent}% OFF
          </Badge>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">
              Limited time offer for:
            </p>
            <h3 className="font-semibold text-lg">{tournamentTitle}</h3>
          </div>
          
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-muted-foreground line-through text-lg">
                ₹{originalPrice}
              </span>
              <Percent className="h-5 w-5 text-orange-500" />
              <span className="text-2xl font-bold text-green-600">
                ₹{discountedPrice}
              </span>
            </div>
            <p className="text-sm text-green-600 font-medium">
              You save ₹{originalPrice - discountedPrice}!
            </p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Checkbox 
              id={`dontShowAgain_${tournamentId}`} 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label htmlFor={`dontShowAgain_${tournamentId}`} className="text-sm text-muted-foreground">
              Don't show this popup again
            </label>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleClose}
              className="flex-1"
              variant="outline"
            >
              Maybe Later
            </Button>
            <Button 
              onClick={handleClose}
              className="flex-1"
            >
              Get This Deal!
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 