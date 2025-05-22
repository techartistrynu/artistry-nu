"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { getAllUsers } from "@/app/actions/users"

interface User {
  id: string
  name: string | null
  email: string | null
  submissionCount: number
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers()
        setUsers(data)
        setFilteredUsers(data)
        setLoading(false)
      } catch (error) {
        console.error('Error fetching users:', error)
        setLoading(false)
      }
    }
    fetchUsers()
  }, [])

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredUsers(users)
      setCurrentPage(1)
      return
    }

    const filtered = users.filter(user => 
      user.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.name && user.name.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.email && user.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      user.submissionCount.toString().includes(searchQuery)
    )
    setFilteredUsers(filtered)
    setCurrentPage(1)
  }, [searchQuery, users])

  // Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredUsers.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  if (loading) {
    return <div className="flex-1 flex items-center justify-center">Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">All Users</h2>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 w-full md:w-[300px]"
          />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registered Users</CardTitle>
          <CardDescription>
            {filteredUsers.length} users found. Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentItems.length > 0 ? (
            <div className="space-y-4">
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
                    {currentItems.map((user) => (
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
                {searchQuery ? "No matching users found." : "No users found."}
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