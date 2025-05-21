import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { getPaymentsByUserId } from "@/app/actions/payments"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { redirect } from "next/navigation"

export default async function DashboardPaymentsPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/login")
  }

  const payments: any[] = await getPaymentsByUserId(session.user.id)
  console.log(payments)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Payment History</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Payments</CardTitle>
          <CardDescription>View your payment history for tournament registrations</CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length > 0 ? (
            <div className="rounded-md border">
              <div className="grid grid-cols-5 p-4 text-sm font-medium">
                <div>Tournament</div>
                <div>Amount</div>
                <div>Date</div>
                <div>Payment Method</div>
                <div>Status</div>
              </div>
              <div className="divide-y">
                {payments.map((payment) => (
                  <div key={payment.id} className="grid grid-cols-5 items-center p-4">
                    <div className="font-medium">{payment.tournament?.title}</div>
                    <div>₹{(payment.paid_amount / 100).toFixed(2)}</div>
                    <div>{new Date(payment.payment_date._seconds * 1000).toLocaleString()}</div>
                    <div className="capitalize">{payment.payment_method.replace("_", " ")}</div>
                    <div>
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
                  </div>
                ))}
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
