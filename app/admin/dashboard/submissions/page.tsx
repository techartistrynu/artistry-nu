"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Eye,
  Download,
  Image as ImageIcon,
  Star,
  Filter,
  X,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAllTournaments,
  getSubmissionsByTournament,
  getDownloadUrl,
  updateSubmissionScore,
} from "@/app/actions/submissions";
import type { Submission } from "@/app/actions/submissions";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Image from "next/image";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { ButtonScore } from "@/components/ui/button-score";
import ImagePreview from "@/components/ui/previewer";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

interface Tournament {
  id: string;
  title: string;
  registration_start: string | null;
  registration_end: string | null;
  submission_deadline: string | null;
  created_at: string | null;
  updated_at: string | null;
}

interface Filters {
  paymentStatus: string;
  submissionStatus: string;
  scoreRange: { min?: number; max?: number };
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

export default function AdminSubmissionsPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    paymentStatus: "all",
    submissionStatus: "all",
    scoreRange: {},
    sortBy: "created_at",
    sortOrder: "desc",
  });
  
  const itemsPerPage = 10;
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const [score, setScore] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Function to update URL with current state
  const updateURL = useCallback((newState: Partial<{
    tournamentId: string;
    page: number;
    paymentStatus: string;
    submissionStatus: string;
    scoreMin?: number;
    scoreMax?: number;
    sortBy: string;
    sortOrder: 'asc' | 'desc';
  }>) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newState.tournamentId !== undefined) {
      if (newState.tournamentId) {
        params.set('tournamentId', newState.tournamentId);
      } else {
        params.delete('tournamentId');
      }
    }
    
    if (newState.page !== undefined) {
      if (newState.page > 1) {
        params.set('page', newState.page.toString());
      } else {
        params.delete('page');
      }
    }
    
    if (newState.paymentStatus !== undefined) {
      if (newState.paymentStatus !== 'all') {
        params.set('paymentStatus', newState.paymentStatus);
      } else {
        params.delete('paymentStatus');
      }
    }
    
    if (newState.submissionStatus !== undefined) {
      if (newState.submissionStatus !== 'all') {
        params.set('submissionStatus', newState.submissionStatus);
      } else {
        params.delete('submissionStatus');
      }
    }
    
    if (newState.scoreMin !== undefined) {
      if (newState.scoreMin !== undefined) {
        params.set('scoreMin', newState.scoreMin.toString());
      } else {
        params.delete('scoreMin');
      }
    }
    
    if (newState.scoreMax !== undefined) {
      if (newState.scoreMax !== undefined) {
        params.set('scoreMax', newState.scoreMax.toString());
      } else {
        params.delete('scoreMax');
      }
    }
    
    if (newState.sortBy !== undefined) {
      if (newState.sortBy !== 'created_at') {
        params.set('sortBy', newState.sortBy);
      } else {
        params.delete('sortBy');
      }
    }
    
    if (newState.sortOrder !== undefined) {
      if (newState.sortOrder !== 'desc') {
        params.set('sortOrder', newState.sortOrder);
      } else {
        params.delete('sortOrder');
      }
    }
    
    const newURL = `/admin/dashboard/submissions${params.toString() ? `?${params.toString()}` : ''}`;
    router.replace(newURL, { scroll: false });
  }, [searchParams, router]);

  // Restore state from URL parameters
  useEffect(() => {
    const tournamentId = searchParams.get("tournamentId");
    const page = searchParams.get("page") ? parseInt(searchParams.get("page")!, 10) : 1;
    const search = searchParams.get("search") || "";
    const paymentStatus = searchParams.get("paymentStatus") || "all";
    const submissionStatus = searchParams.get("submissionStatus") || "all";
    const scoreMin = searchParams.get("scoreMin") ? parseFloat(searchParams.get("scoreMin")!) : undefined;
    const scoreMax = searchParams.get("scoreMax") ? parseFloat(searchParams.get("scoreMax")!) : undefined;
    const sortBy = searchParams.get("sortBy") || "created_at";
    const sortOrder = (searchParams.get("sortOrder") as 'asc' | 'desc') || "desc";

    if (tournamentId) {
      setSelectedTournament(tournamentId);
    }
    setCurrentPage(page);
    setSearchQuery(search);
    setDebouncedSearchQuery(search);
    setFilters(prev => ({
      ...prev,
      paymentStatus,
      submissionStatus,
      scoreRange: { min: scoreMin, max: scoreMax },
      sortBy,
      sortOrder,
    }));
  }, [searchParams]);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page when searching
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handlePreview = async (submission: Submission, filePath: string) => {
    try {
      const previewUrl = await getDownloadUrl(filePath);
      if (previewUrl) {
        console.log("Setting current submission:", submission);
        setCurrentSubmission(submission);
        setPreviewImage(previewUrl);
        setScore(submission.score?.toString() || "");
      }
    } catch (error) {
      toast.error("Failed to load preview");
    }
  };

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
        // Ensure each tournament has a title
        const validTournaments = data.filter((t) => t.title) as Tournament[];
        setTournaments(validTournaments);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching tournaments:", error);
        setLoading(false);
      }
    };
    fetchTournaments();
  }, []);

  // Set tournament from URL after tournaments are loaded
  useEffect(() => {
    if (tournaments.length > 0 && !selectedTournament) {
      const tournamentId = searchParams.get("tournamentId");
      if (tournamentId) {
        setSelectedTournament(tournamentId);
      }
    }
  }, [tournaments, searchParams, selectedTournament]);

  useEffect(() => {
    if (selectedTournament) {
      const fetchSubmissions = async () => {
        if (debouncedSearchQuery || hasActiveFilters) {
          setSearchLoading(true);
        } else {
          setLoading(true);
        }
        
        try {
          const { submissions, total } = await getSubmissionsByTournament(
            selectedTournament,
            currentPage,
            itemsPerPage,
            debouncedSearchQuery,
            filters
          );
          console.log("submissions", submissions);
          setSubmissions(submissions);
          setTotalSubmissions(total);
          setLoading(false);
          setSearchLoading(false);
        } catch (error) {
          console.error("Error fetching submissions:", error);
          setLoading(false);
          setSearchLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [selectedTournament, currentPage, debouncedSearchQuery, filters]);

  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

  const handleTournamentChange = (value: string) => {
    setSelectedTournament(value);
    setCurrentPage(1);
    setSearchQuery("");
    setDebouncedSearchQuery("");
    setFilters({
      paymentStatus: "all",
      submissionStatus: "all",
      scoreRange: {},
      sortBy: "created_at",
      sortOrder: "desc",
    });
    updateURL({ tournamentId: value });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Update URL when search query changes (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      if (debouncedSearchQuery) {
        const params = new URLSearchParams(searchParams.toString());
        params.set('search', debouncedSearchQuery);
        params.delete('page'); // Reset to page 1 when searching
        router.replace(`/admin/dashboard/submissions?${params.toString()}`, { scroll: false });
      } else {
        const params = new URLSearchParams(searchParams.toString());
        params.delete('search');
        router.replace(`/admin/dashboard/submissions?${params.toString()}`, { scroll: false });
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [debouncedSearchQuery, searchParams, router]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // Reset to first page when filtering
    
    // Update URL with new filter state
    if (key === 'paymentStatus') {
      updateURL({ paymentStatus: value });
    } else if (key === 'submissionStatus') {
      updateURL({ submissionStatus: value });
    } else if (key === 'scoreRange') {
      updateURL({ 
        scoreMin: value.min, 
        scoreMax: value.max 
      });
    } else if (key === 'sortBy') {
      updateURL({ sortBy: value });
    } else if (key === 'sortOrder') {
      updateURL({ sortOrder: value });
    }
  };

  const handleColumnSort = (column: string) => {
    const newSortOrder = filters.sortBy === column && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    setFilters(prev => ({
      ...prev,
      sortBy: column,
      sortOrder: newSortOrder
    }));
    setCurrentPage(1); // Reset to first page when sorting
    
    // Update URL with new sort state
    updateURL({ sortBy: column, sortOrder: newSortOrder });
  };

  const clearFilters = () => {
    setFilters({
      paymentStatus: "all",
      submissionStatus: "all",
      scoreRange: {},
      sortBy: "created_at",
      sortOrder: "desc",
    });
    setCurrentPage(1);
    
    // Update URL to remove all filters
    updateURL({
      paymentStatus: "all",
      submissionStatus: "all",
      scoreMin: undefined,
      scoreMax: undefined,
      sortBy: "created_at",
      sortOrder: "desc",
      page: 1
    });
  };

  const hasActiveFilters = filters.paymentStatus !== "all" || 
                          filters.submissionStatus !== "all" || 
                          Object.keys(filters.scoreRange).length > 0 ||
                          filters.sortBy !== "created_at" ||
                          filters.sortOrder !== "desc";

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    updateURL({ page: pageNumber });
  };

  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Previous button
    if (currentPage > 1) {
      pages.push(
        <Button
          key="prev"
          variant="outline"
          size="sm"
          onClick={() => paginate(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
      );
    }

    // First page
    if (startPage > 1) {
      pages.push(
        <Button
          key={1}
          variant="outline"
          size="sm"
          onClick={() => paginate(1)}
        >
          1
        </Button>
      );
      if (startPage > 2) {
        pages.push(
          <span key="ellipsis1" className="px-2 py-1">
            ...
          </span>
        );
      }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Button
          key={i}
          variant={currentPage === i ? "default" : "outline"}
          size="sm"
          onClick={() => paginate(i)}
        >
          {i}
        </Button>
      );
    }

    // Last page
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pages.push(
          <span key="ellipsis2" className="px-2 py-1">
            ...
          </span>
        );
      }
      pages.push(
        <Button
          key={totalPages}
          variant="outline"
          size="sm"
          onClick={() => paginate(totalPages)}
        >
          {totalPages}
        </Button>
      );
    }

    // Next button
    if (currentPage < totalPages) {
      pages.push(
        <Button
          key="next"
          variant="outline"
          size="sm"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      );
    }

    return (
      <div className="flex items-center justify-center gap-2 mt-6">
        {pages}
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>

        <div className="flex flex-col md:flex-row gap-4 w-full md:w-auto">
          <Select
            onValueChange={handleTournamentChange}
            value={selectedTournament}
          >
            <SelectTrigger className="w-full md:w-[300px]">
              <SelectValue placeholder="Select a Competition" />
            </SelectTrigger>
            <SelectContent>
              {tournaments.map((tournament) => (
                <SelectItem key={tournament.id} value={tournament.id}>
                  {tournament.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="relative w-full md:w-[300px]">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={searchLoading ? "Searching..." : "Search by name, title, or description..."}
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
              disabled={!selectedTournament || searchLoading}
            />
            {searchLoading && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              </div>
            )}
          </div>

          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-1">
                {Object.values(filters).filter(v => v !== "all" && (typeof v === "object" ? Object.keys(v).length > 0 : true)).length}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Filters Section */}
      {showFilters && selectedTournament && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Filters & Sorting</CardTitle>
            <CardDescription>
              Filter submissions by various criteria and sort by columns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Filter Options */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Filter Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="payment-status">Payment Status</Label>
                    <Select
                      value={filters.paymentStatus}
                      onValueChange={(value) => handleFilterChange("paymentStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All payment statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="paid">Paid</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="unpaid">Unpaid</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="submission-status">Submission Status</Label>
                    <Select
                      value={filters.submissionStatus}
                      onValueChange={(value) => handleFilterChange("submissionStatus", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="All submission statuses" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending_review">Pending Review</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="score-range">Score Range</Label>
                    <div className="flex gap-2">
                      <Input
                        type="number"
                        placeholder="Min"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters.scoreRange.min || ""}
                        onChange={(e) => handleFilterChange("scoreRange", {
                          ...filters.scoreRange,
                          min: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                      />
                      <Input
                        type="number"
                        placeholder="Max"
                        min="0"
                        max="10"
                        step="0.1"
                        value={filters.scoreRange.max || ""}
                        onChange={(e) => handleFilterChange("scoreRange", {
                          ...filters.scoreRange,
                          max: e.target.value ? parseFloat(e.target.value) : undefined
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Sorting Options */}
              <div>
                <h4 className="font-medium mb-3 text-sm text-muted-foreground">Sort Options</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sort-by">Sort By</Label>
                    <Select
                      value={filters.sortBy}
                      onValueChange={(value) => handleFilterChange("sortBy", value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select column to sort by" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="created_at">Submission Date</SelectItem>
                        <SelectItem value="applicant_name">Applicant Name</SelectItem>
                        <SelectItem value="title">Title</SelectItem>
                        <SelectItem value="score">Score</SelectItem>
                        <SelectItem value="payment_status">Payment Status</SelectItem>
                        <SelectItem value="status">Submission Status</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sort-order">Sort Order</Label>
                    <Select
                      value={filters.sortOrder}
                      onValueChange={(value) => handleFilterChange("sortOrder", value as 'asc' | 'desc')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select sort order" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="asc">Ascending (A-Z, 0-9)</SelectItem>
                        <SelectItem value="desc">Descending (Z-A, 9-0)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center mt-6 pt-4 border-t">
              <Button
                variant="ghost"
                onClick={clearFilters}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
              
              <div className="text-sm text-muted-foreground">
                {hasActiveFilters && (
                  <span>
                    Active: {Object.values(filters).filter(v => 
                      v !== "all" && 
                      v !== "created_at" && 
                      v !== "desc" && 
                      (typeof v === "object" ? Object.keys(v).length > 0 : true)
                    ).length} filters
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTournament &&
              `Submissions for ${tournaments.find((t) => t.id === selectedTournament)?.title
              }`}
          </CardTitle>
          <CardDescription>
            {totalSubmissions && selectedTournament
              ? `${totalSubmissions} submissions found. Showing ${Math.min(
                (currentPage - 1) * itemsPerPage + 1,
                totalSubmissions
              )} to ${Math.min(
                currentPage * itemsPerPage,
                totalSubmissions
              )}.`
              : "Please select a Competition to view submissions."}
            {debouncedSearchQuery && (
              <span className="block mt-1 text-sm text-muted-foreground">
                Search results for: <span className="font-medium">"{debouncedSearchQuery}"</span>
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Loading submissions...</p>
              </div>
            </div>
          ) : searchLoading ? (
            <div className="flex items-center justify-center h-40">
              <div className="flex flex-col items-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <p className="text-muted-foreground">Searching...</p>
              </div>
            </div>
          ) : selectedTournament && submissions.length > 0 ? (
            <div className="space-y-4">
              {/* Active Filters Summary */}
              {hasActiveFilters && (
                <div className="flex flex-wrap gap-2 p-3 bg-muted/30 rounded-lg border">
                  <span className="text-sm font-medium text-muted-foreground">Active filters:</span>
                  {filters.paymentStatus !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Payment: {filters.paymentStatus}
                    </Badge>
                  )}
                  {filters.submissionStatus !== "all" && (
                    <Badge variant="outline" className="text-xs">
                      Status: {filters.submissionStatus}
                    </Badge>
                  )}
                  {filters.scoreRange.min !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Score ≥ {filters.scoreRange.min}
                    </Badge>
                  )}
                  {filters.scoreRange.max !== undefined && (
                    <Badge variant="outline" className="text-xs">
                      Score ≤ {filters.scoreRange.max}
                    </Badge>
                  )}
                  {filters.sortBy !== "created_at" && (
                    <Badge variant="outline" className="text-xs">
                      Sort: {filters.sortBy.replace('_', ' ')} ({filters.sortOrder})
                    </Badge>
                  )}
                  {filters.sortOrder !== "desc" && filters.sortBy === "created_at" && (
                    <Badge variant="outline" className="text-xs">
                      Sort: Date ({filters.sortOrder})
                    </Badge>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={clearFilters}
                    className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3 mr-1" />
                    Clear
                  </Button>
                </div>
              )}

              <div className="rounded-md border">
                <div className="relative overflow-x-auto">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs bg-muted/50">
                      <tr>
                        <th 
                          scope="col" 
                          className="px-6 py-3 cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("applicant_name")}
                        >
                          <div className="flex items-center gap-1">
                            User
                            {filters.sortBy === "applicant_name" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 hidden md:table-cell cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("user.email")}
                        >
                          <div className="flex items-center gap-1">
                            Email
                            {filters.sortBy === "user.email" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("title")}
                        >
                          <div className="flex items-center gap-1">
                            Title
                            {filters.sortBy === "title" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3">Files</th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 hidden sm:table-cell cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("created_at")}
                        >
                          <div className="flex items-center gap-1">
                            Date
                            {filters.sortBy === "created_at" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("score")}
                        >
                          <div className="flex items-center gap-1">
                            Score
                            {filters.sortBy === "score" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("payment_status")}
                        >
                          <div className="flex items-center gap-1">
                            Payment
                            {filters.sortBy === "payment_status" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th 
                          scope="col" 
                          className="px-6 py-3 cursor-pointer hover:bg-muted/70 transition-colors select-none"
                          onClick={() => handleColumnSort("status")}
                        >
                          <div className="flex items-center gap-1">
                            Status
                            {filters.sortBy === "status" && (
                              <span className="text-primary font-bold">
                                {filters.sortOrder === "asc" ? "↑" : "↓"}
                              </span>
                            )}
                          </div>
                        </th>
                        <th scope="col" className="px-6 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {submissions.map((submission) => (
                        <tr key={submission.id} className="hover:bg-muted/50">
                          <td className="px-6 py-4 font-medium whitespace-nowrap">
                            {submission.applicant_name || "N/A"}
                          </td>
                          <td className="px-6 py-4 hidden md:table-cell">
                            <div className="max-w-[200px] truncate">
                              {submission.user?.email || "N/A"}
                            </div>
                          </td>
                          <td className="px-6 py-4 max-w-[150px] truncate">
                            {submission.title || "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {submission.files?.length > 0 ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setPreviewImage(
                                    submission.image_url || submission.files[0].file_url
                                  )
                                }
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground">No files</span>
                            )}
                          </td>
                          <td className="px-6 py-4 hidden sm:table-cell">
                            {submission.created_at
                              ? new Date(submission.created_at).toLocaleDateString()
                              : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            {submission.score ? submission.score.toFixed(2) : "N/A"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.payment_status === 'paid'
                                ? 'bg-green-100 text-green-800'
                                : submission.payment_status === 'pending'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                              {submission.payment_status || 'unpaid'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${submission.status === 'approved'
                                ? 'bg-green-100 text-green-800'
                                : submission.status === 'rejected'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                              {submission.status || 'pending_review'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <Link href={`/admin/dashboard/submissions/${submission.id}`}>
                              <Button variant="outline" size="sm">
                                <Eye className="h-4 w-4" />
                                <span className="sr-only md:not-sr-only md:ml-1">View</span>
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Pagination */}
              {renderPagination()}
            </div>
          ) : selectedTournament ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-muted-foreground">
                {searchQuery || hasActiveFilters
                  ? "No matching submissions found."
                  : "No submissions found for this competitions."}
              </p>
              {(searchQuery || hasActiveFilters) && (
                <Button variant="ghost" onClick={() => {
                  setSearchQuery("");
                  clearFilters();
                }}>
                  Clear search & filters
                </Button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">
                Please select a Competition Enrollment to view submissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Image Preview Dialog */}
      {previewImage && (
        <ImagePreview
          imageUrl={previewImage}
          alt="Submission preview"
          className="rounded-lg shadow-md"
          width={300}
          height={200}
          onClose={() => setPreviewImage(null)}
        />
      )}
    </div>
  );
}
