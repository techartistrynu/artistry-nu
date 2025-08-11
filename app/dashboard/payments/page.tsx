import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPaymentsByUserId } from "@/app/actions/payments"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Eye } from "lucide-react"

export default async function DashboardPaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const payments: any[] = await getPaymentsByUserId(session.user.id)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Payments</CardTitle>
          <CardDescription>View your payment history for competition registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[800px]">
                {/* Header row */}
                <div className="grid grid-cols-12 p-4 text-sm font-medium bg-muted/50">
                  <div className="col-span-3">Tournament</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Discount</div>
                  <div className="col-span-2">Date</div>
                  <div className="col-span-1">Status</div>
                  <div className="col-span-2">Actions</div>
                </div>
                
                {/* Data rows */}
                <div className="divide-y">
                  {payments.map((payment) => (
                    <div key={payment.id} className="grid grid-cols-12 items-center p-4 hover:bg-muted/50">
                      <div className="col-span-3 truncate font-medium">{payment.tournament?.title}</div>
                      <div className="col-span-2">
                        <div className="flex flex-col">
                          {payment.tournament?.discount_percent && payment.tournament.discount_percent > 0 ? (
                            <>
                              <span className="line-through text-muted-foreground text-xs">
                                ₹{payment.tournament.entry_fee}
                              </span>
                              <span className="text-green-600 font-medium">
                                ₹{(payment.paid_amount / 100).toFixed(2)}
                              </span>
                              <span className="text-xs text-green-600">
                                {payment.tournament.discount_percent}% OFF
                              </span>
                            </>
                          ) : (
                            <span>₹{(payment.paid_amount / 100).toFixed(2)}</span>
                          )}
                        </div>
                      </div>
                      <div className="col-span-2">
                        {payment.tournament?.discount_percent && payment.tournament.discount_percent > 0 ? (
                          <div className="flex flex-col">
                            <span className="text-green-600 font-medium">
                              -{payment.tournament.discount_percent}%
                            </span>
                            <span className="text-xs text-muted-foreground">
                              Saved ₹{Math.round((payment.tournament.entry_fee * payment.tournament.discount_percent) / 100)}
                            </span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">No discount</span>
                        )}
                      </div>
                      <div className="col-span-2 truncate text-sm">
                        {new Date(payment.payment_date._seconds * 1000).toLocaleString()}
                      </div>
                      <div className="col-span-1">
                        <Badge
                          variant={
                            payment.payment_status === "paid"
                              ? "default"
                              : payment.payment_status === "pending"
                                ? "outline"
                                : "destructive"
                          }
                        >
                          {payment.payment_status ? payment.payment_status.charAt(0).toUpperCase() + payment.payment_status.slice(1) : "Unpaid"}
                        </Badge>
                      </div>
                      <div className="col-span-2">
                        <Link 
                          href={`/dashboard/submissions/${payment.submission_id}`}
                          className="w-full"
                        >
                          <Button variant="ghost" size="sm" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Receipt
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">You haven't made any payments yet.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}