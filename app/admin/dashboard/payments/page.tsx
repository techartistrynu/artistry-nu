// app/admin/dashboard/payments/page.tsx
"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { getAllPayments } from "@/app/actions/payments"

interface Payment {
  id: string
  amount: string
  date: string
  status: string
  paymentMethod: string
  submissionId: string
  tournamentId: string
  tournamentTitle: string
  userId: string
  userName: string
  userEmail: string
  discount_percent?: number
  original_amount?: number
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([])
  const [filteredPayments, setFilteredPayments] = useState<Payment[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const data = await getAllPayments()
        setPayments(data)
        setFilteredPayments(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching payments:', error)
        setLoading(false)
      }
    }
    fetchPayments()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredPayments(payments)
      setCurrentPage(1)
      return
    }

    const filtered = payments.filter(payment => 
      payment.tournamentTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      payment.submissionId.toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredPayments(filtered)
    setCurrentPage(1)
  }, [searchQuery, payments])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredPayments.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredPayments.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Payments</h2>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search payments..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-[300px]"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Successful Payments</CardTitle>
          <CardDescription>
            {filteredPayments.length} payments found. Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPayments.length)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentItems.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[900px]">
                  {/* Header row */}
                  <div className="grid grid-cols-12 p-4 text-sm font-medium bg-muted/50">
                    <div className="col-span-2">Tournament</div>
                    <div className="col-span-2">Payment ID</div>
                    <div className="col-span-1">Amount</div>
                    <div className="col-span-1">Discount</div>
                    <div className="col-span-2">User</div>
                    <div className="col-span-2">Email</div>
                    <div className="col-span-1">Submission ID</div>
                    <div className="col-span-1">Date</div>
                  </div>

                  {/* Data rows */}
                  <div className="divide-y">
                    {currentItems.map((payment) => (
                      <div
                        key={payment.id}
                        className="grid grid-cols-12 items-center p-4 hover:bg-muted/50 text-sm"
                      >
                        <div className="col-span-2 truncate">{payment.tournamentTitle}</div>
                        <div className="col-span-2 truncate text-muted-foreground">{payment.id}</div>
                        <div className="col-span-1 font-semibold">₹{payment.amount}</div>
                        <div className="col-span-1">
                          {payment.discount_percent && payment.discount_percent > 0 && payment.original_amount ? (
                            <div className="flex flex-col">
                              <span className="text-green-600 font-medium text-xs">
                                -{payment.discount_percent}%
                              </span>
                              <span className="text-xs text-muted-foreground">
                                Saved ₹{Math.round((payment.original_amount * payment.discount_percent) / 100)}
                              </span>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-xs">No discount</span>
                          )}
                        </div>
                        <div className="col-span-2 truncate">{payment.userName}</div>
                        <div className="col-span-2 truncate text-muted-foreground">{payment.userEmail}</div>
                        <div className="col-span-1 truncate">{payment.submissionId}</div>
                        <div className="col-span-1">
                          {new Date(payment.date).toLocaleDateString("en-IN")}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Page {currentPage} of {totalPages}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    disabled={currentPage <= 1}
                    onClick={() => paginate(currentPage - 1)}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    disabled={currentPage >= totalPages}
                    onClick={() => paginate(currentPage + 1)}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-muted-foreground">
                {searchQuery ? "No matching payments found." : "No payments found."}
              </p>
              {searchQuery && (
                <Button
                  variant="ghost"
                  onClick={() => setSearchQuery('')}
                >
                  Clear search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}