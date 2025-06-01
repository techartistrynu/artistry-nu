"use client";

import { useState, useEffect } from "react";
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
interface Tournament {
  id: string;
  title: string;
  registration_start: string | null;
  registration_end: string | null;
  submission_deadline: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminSubmissionsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const itemsPerPage = 10;
  const [currentSubmission, setCurrentSubmission] = useState<Submission | null>(
    null
  );
  const [score, setScore] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

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

  useEffect(() => {
    if (selectedTournament) {
      const fetchSubmissions = async () => {
        setLoading(true);
        try {
          const { submissions, total } = await getSubmissionsByTournament(
            selectedTournament,
            currentPage,
            itemsPerPage,
            searchQuery
          );
          console.log("submissions", submissions);
          setSubmissions(submissions);
          setTotalSubmissions(total);
          setLoading(false);
        } catch (error) {
          console.error("Error fetching submissions:", error);
          setLoading(false);
        }
      };
      fetchSubmissions();
    }
  }, [selectedTournament, currentPage, searchQuery]);

  const totalPages = Math.ceil(totalSubmissions / itemsPerPage);

  const handleTournamentChange = (value: string) => {
    setSelectedTournament(value);
    setCurrentPage(1);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    setDownloading(true);
    try {
      // Get the proper download URL from Firebase
      const downloadUrl = await getDownloadUrl(filePath);
      if (!downloadUrl) throw new Error("Could not generate download URL");

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const downloadUrlObject = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = downloadUrlObject;
      link.download = fileName || "submission-file";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrlObject);
    } catch (error) {
      console.error("Download failed:", error);
      toast.error("Failed to download file");
    } finally {
      setDownloading(false);
    }
  };

  const handleScoreSubmit = async (status: "approved" | "rejected") => {
    if (!currentSubmission?.id) {
      toast.error("No submission selected");
      return;
    }

    if (!score || isNaN(parseFloat(score))) {
      toast.error("Please enter a valid score");
      return;
    }

    const numericScore = parseFloat(score);
    if (numericScore < 0 || numericScore > 10) {
      toast.error("Score must be between 0 and 10");
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateSubmissionScore(
        currentSubmission.id,
        numericScore,
        status
      );

      if (result.success) {
        toast.success(
          `Submission ${status} with score ${numericScore.toFixed(2)}`
        );
        setPreviewImage(null);
        // Refresh submissions data
        const { submissions: any } = await getSubmissionsByTournament(
          selectedTournament,
          currentPage,
          itemsPerPage,
          searchQuery
        );
        setSubmissions(submissions);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("Failed to update submission");
    } finally {
      setIsUpdating(false);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
              placeholder="Search submissions..."
              value={searchQuery}
              onChange={handleSearch}
              className="pl-10"
              disabled={!selectedTournament}
            />
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {selectedTournament &&
              `Submissions for ${
                tournaments.find((t) => t.id === selectedTournament)?.title
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
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-40">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          ) : selectedTournament && submissions.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[1000px]">
                  {/* Header row */}
                  <div className="grid grid-cols-12 p-4 text-sm font-medium bg-muted/50 text-center">
                    <div className="col-span-2">User</div>
                    <div className="col-span-2">Email</div>
                    <div className="col-span-2">Submission Title</div>
                    <div className="col-span-2">Files</div>
                    <div className="col-span-2">Date</div>
                    <div className="col-span-2">Scored </div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Data rows */}
                  <div className="divide-y">
                    {submissions.map((submission) => (
                      <div
                        key={submission.id}
                        className="grid grid-cols-12 items-center p-4 hover:bg-muted/50 text-center"
                      >
                        <div className="col-span-2 font-medium">
                          {submission.applicant_name || "N/A"}
                        </div>
                        <div className="col-span-2 truncate text-sm">
                          {submission.user?.email || "N/A"}
                        </div>
                        <div className="col-span-2 truncate">
                          {submission.title || "N/A"}
                        </div>
                        <div className="col-span-2">
                          {submission.files?.length > 0 ? (
                            <div className="flex gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  setPreviewImage(submission.image_url || submission.files[0].file_url)
                                }
                              >
                                <ImageIcon className="h-4 w-4" />
                              </Button>
                              {/* <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleDownload(
                                    submission.files[0].file_path,
                                    submission.files[0].file_name
                                  )
                                }
                                disabled={downloading}
                              >
                                <Download className="h-4 w-4" />
                              </Button> */}
                            </div>
                          ) : (
                            <span className="text-muted-foreground">
                              No files
                            </span>
                          )}
                        </div>
                        <div className="col-span-2 text-sm">
                          {submission.created_at
                            ? new Date(
                                submission.created_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="col-span-2 text-sm">
                          {submission.score
                            ? submission.score.toFixed(2)
                            : "N/A"}
                        </div>
                        <div className="col-span-2 flex gap-2">
                          <Link
                            href={`/admin/dashboard/submissions/${submission.id}`}
                          >
                            <Button variant="outline" size="sm">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                          </Link>
                          {/* <Button variant="outline" size="sm">
                            <Star className="h-4 w-4 mr-2" />
                            Score
                          </Button> */}
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
          ) : selectedTournament ? (
            <div className="flex flex-col items-center justify-center h-40 gap-2">
              <p className="text-muted-foreground">
                {searchQuery
                  ? "No matching submissions found."
                  : "No submissions found for this competitions."}
              </p>
              {searchQuery && (
                <Button variant="ghost" onClick={() => setSearchQuery("")}>
                  Clear search
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
