import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Trophy, Upload, CreditCard, Award } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getTournamentStatusText } from "@/lib/utils"
import { formatPriceWithDiscount } from "@/lib/utils"
import { DiscountPopup } from "@/components/ui/discount-popup"

// Static fallback data
const staticData = {
  tournaments: [
    {
      id: "1",
      title: "Digital Art Competition",
      description: "Showcase your digital art skills in this exciting competition.",
      status: "open",
      submission_deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      entry_fee: 25,
      discount_percent: 0,
    },
    {
      id: "2",
      title: "Photography Contest",
      description: "Share your best photographs and win amazing prizes.",
      status: "open",
      submission_deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      entry_fee: 15,
      discount_percent: 0,
    },
    {
      id: "3",
      title: "Illustration Challenge",
      description: "Create stunning illustrations and get recognized.",
      status: "coming_soon",
      submission_deadline: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      entry_fee: 20,
      discount_percent: 0,
    },
  ],
}

export default function StaticDashboardPage() {
  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <div className="flex items-center space-x-2">
          <Link href="/dashboard/submissions/new">
            <Button>New Submission</Button>
          </Link>
        </div>
      </div>
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming Tournaments</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Tournaments</CardTitle>
                <Trophy className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {staticData.tournaments.filter((t) => t.status === "open").length}
                </div>
                <p className="text-xs text-muted-foreground">Available tournaments</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Submissions</CardTitle>
                <Upload className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Total submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Payments</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹0.00</div>
                <p className="text-xs text-muted-foreground">Total spent</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Certificates</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Earned certificates</p>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent activity across all tournaments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center h-24">
                  <p className="text-muted-foreground">No recent activity</p>
                </div>
              </CardContent>
            </Card>
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Upcoming Deadlines</CardTitle>
                <CardDescription>Don't miss these important dates</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {staticData.tournaments
                    .filter((t) => t.status === "open")
                    .map((tournament) => (
                      <div key={tournament.id} className="flex flex-col gap-1">
                        <div className="text-sm font-medium">{tournament.title}</div>
                        <div className="text-sm text-muted-foreground">
                          Submission Deadline: {new Date(tournament.submission_deadline).toLocaleDateString()}
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="upcoming" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Upcoming Tournaments</CardTitle>
              <CardDescription>Tournaments that are currently open for registration</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {staticData.tournaments.map((tournament) => (
                  <div key={tournament.id} className="space-y-2">
                    <h3 className="text-lg font-medium">{tournament.title}</h3>
                    <p className="text-sm text-muted-foreground">{tournament.description}</p>
                    <div className="flex flex-wrap gap-2">
                      <div
                        className={`rounded-full px-3 py-1 text-xs ${
                          tournament.status === "open"
                            ? "bg-primary/10 text-primary"
                            : "bg-yellow-500/10 text-yellow-500"
                        }`}
                      >
                        Registration: {getTournamentStatusText(tournament.status)}
                      </div>
                      <div className="rounded-full bg-muted px-3 py-1 text-xs">
                        Deadline: {new Date(tournament.submission_deadline).toLocaleDateString()}
                      </div>
                      <div className="rounded-full bg-muted px-3 py-1 text-xs">
                        Entry Fee: {(() => {
                          const priceInfo = formatPriceWithDiscount(tournament.entry_fee, tournament.discount_percent);
                          if (priceInfo.hasDiscount) {
                            return (
                              <>
                                <span className="line-through">{priceInfo.originalPrice}</span>
                                <span className="ml-1 text-green-600 font-medium">{priceInfo.discountedPrice}</span>
                                <span className="ml-1 text-xs text-green-600">({tournament.discount_percent}% off)</span>
                              </>
                            );
                          }
                          return priceInfo.originalPrice;
                        })()}
                      </div>
                    </div>
                    {tournament.status === "open" && (
                      <div className="mt-2">
                        <Link href={`/dashboard/tournaments/${tournament.id}`}>
                          <Button size="sm">View Details</Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Discount Popup for tournaments with >30% discount */}
      {staticData.tournaments.map((tournament) => 
        tournament.discount_percent && tournament.discount_percent > 30 ? (
          <DiscountPopup
            key={`popup-${tournament.id}`}
            discountPercent={tournament.discount_percent}
            originalPrice={tournament.entry_fee}
            discountedPrice={Math.round((tournament.entry_fee * (100 - tournament.discount_percent)) / 100)}
            tournamentTitle={tournament.title}
          />
        ) : null
      )}
    </div>
  )
}
