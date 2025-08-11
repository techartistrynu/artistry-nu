"use client"

import { useState, useEffect } from "react"
import { X, Percent, AlertTriangle, Trophy, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

interface Tournament {
  id: string
  title: string
  entry_fee: number
  discount_percent?: number
}

interface TournamentsHomePopupProps {
  tournaments: Tournament[]
}

export function TournamentsHomePopup({ tournaments }: TournamentsHomePopupProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [maxDiscountTournament, setMaxDiscountTournament] = useState<Tournament | null>(null)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    // Check if user has already seen the popup
    const hasSeenPopup = localStorage.getItem('tournamentsHomePopupShown')
    if (hasSeenPopup === 'true') {
      return
    }

    // Find tournament with maximum discount
    const tournamentWithMaxDiscount = tournaments
      .filter(t => t.discount_percent && t.discount_percent > 0)
      .sort((a, b) => (b.discount_percent || 0) - (a.discount_percent || 0))[0]

    if (tournamentWithMaxDiscount && tournamentWithMaxDiscount.discount_percent! > 30) {
      setMaxDiscountTournament(tournamentWithMaxDiscount)
      // Show popup after a short delay for better UX
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 1000)
      
      return () => clearTimeout(timer)
    }
  }, [tournaments])

  const handleClose = () => {
    setIsVisible(false)
    if (dontShowAgain) {
      localStorage.setItem('tournamentsHomePopupShown', 'true')
    }
  }

  if (!isVisible || !maxDiscountTournament) return null

  const { title, entry_fee, discount_percent } = maxDiscountTournament
  const discountedPrice = Math.round((entry_fee * (100 - discount_percent!)) / 100)
  const savings = entry_fee - discountedPrice

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-lg relative animate-in zoom-in-95 duration-200">
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
          <div className="flex items-center justify-center gap-2 mb-3">
            <Trophy className="h-8 w-8 text-yellow-500" />
            <CardTitle className="text-2xl">🎉 Special Offers Available!</CardTitle>
            <Star className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="space-y-2">
            <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xl px-6 py-3">
              Up to {discount_percent}% OFF
            </Badge>
            <p className="text-sm text-muted-foreground">
              Don't miss out on these amazing deals!
            </p>
          </div>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg border-2 border-green-200">
            <h3 className="font-bold text-lg mb-3 text-green-800">Best Deal of the Day</h3>
            <div className="space-y-2">
              {/* <h4 className="font-semibold text-lg">{title}</h4> */}
              <div className="flex items-center justify-center gap-4 text-center">
                <div>
                  <p className="text-sm text-muted-foreground">Original Price</p>
                  <span className="text-xl line-through text-muted-foreground font-medium">
                    ₹{entry_fee}
                  </span>
                </div>
                <div className="text-2xl text-green-600">→</div>
                <div>
                  <p className="text-sm text-muted-foreground">Discounted Price</p>
                  <span className="text-3xl font-bold text-green-600">
                    ₹{discountedPrice}
                  </span>
                </div>
              </div>
              <div className="mt-3">
                <Badge className="bg-green-100 text-green-800 text-sm px-3 py-1">
                  You save ₹{savings}!
                </Badge>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>🎯 Multiple tournaments with special discounts available</p>
            <p>⏰ Limited time offers - Register now!</p>
          </div>

          <div className="flex items-center justify-center space-x-2">
            <Checkbox 
              id="dontShowAgain" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label htmlFor="dontShowAgain" className="text-sm text-muted-foreground">
              Don't show this popup again
            </label>
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleClose}
              variant="outline"
              className="flex-1"
            >
              Browse All Offers
            </Button>
            <Button 
              onClick={handleClose}
              className="flex-1"
            >
              View Details
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 