import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getAllUsers } from "@/app/actions/users"

export default async function AdminUsersPage() {
  const users = await getAllUsers()

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">All Users</h2>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>List of all users and their submission counts</CardDescription>
        </CardHeader>
        <CardContent>
          {users.length > 0 ? (
            <div className="rounded-md border overflow-x-auto">
              <div className="min-w-[700px]">
                {/* Header row */}
                <div className="grid grid-cols-12 p-4 text-sm font-medium bg-muted/50">
                  <div className="col-span-3">User ID</div>
                  <div className="col-span-3">Name</div>
                  <div className="col-span-4">Email</div>
                  <div className="col-span-2">Submissions</div>
                </div>
                
                {/* Data rows */}
                <div className="divide-y">
                  {users.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 items-center p-4 hover:bg-muted/50">
                      <div className="col-span-3 truncate text-sm text-muted-foreground">{user.id}</div>
                      <div className="col-span-3 truncate font-medium">{user.name || "N/A"}</div>
                      <div className="col-span-4 truncate text-sm">{user.email || "N/A"}</div>
                      <div className="col-span-2 text-sm font-semibold">{user.submissionCount}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">No users found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}