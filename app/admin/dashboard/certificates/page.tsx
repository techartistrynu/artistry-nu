"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  FileText,
  Trophy,
  Search,
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
} from "@/app/actions/submissions";
import { generateCertificatesForTournament, generateRanksForTournament } from '@/app/actions/certificates';
import type { Submission } from "@/app/actions/submissions";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";

interface Tournament {
  id: string;
  title: string;
  registration_start: string | null;
  registration_end: string | null;
  submission_deadline: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export default function AdminCertificatesPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [selectedTournament, setSelectedTournament] = useState("");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [generatingRank, setGeneratingRank] = useState(false);
  const [generatingCertificates, setGeneratingCertificates] = useState(false);
  const [ranksGenerated, setRanksGenerated] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const itemsPerPage = 10;

  useEffect(() => {
    const fetchTournaments = async () => {
      try {
        const data = await getAllTournaments();
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
          setSubmissions(submissions);
          setFilteredSubmissions(submissions);
          setTotalSubmissions(total);
          setLoading(false);
          setRanksGenerated(submissions.some(sub => typeof sub.rank === 'number'));
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
    setSearchQuery("");
    setRanksGenerated(false);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const generateRank = async () => {
    if (!selectedTournament) {
      console.log("No tournament selected");
      toast.error("Please select a tournament first");
      return;
    }

    setGeneratingRank(true);
    try {
      const result = await generateRanksForTournament(selectedTournament);
      
      if (result.success) {
        toast.success(result.message);
        setRanksGenerated(true);
        
        // Refresh submissions to show updated ranks
        const { submissions } = await getSubmissionsByTournament(
          selectedTournament,
          currentPage,
          itemsPerPage,
          searchQuery
        );
        setSubmissions(submissions);
        setFilteredSubmissions(submissions);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      console.error("Error generating ranks:", error);
      toast.error("Failed to generate ranks");
    } finally {
      setGeneratingRank(false);
    }
  };

  const handleGenerateCertificates = async () => {
    if (!selectedTournament) {
      toast.error("Please select a tournament first");
      return;
    }
    
    if (!ranksGenerated) {
      toast.error("Please generate ranks first");
      return;
    }
    
    setGeneratingCertificates(true);
    try {
      const result = await generateCertificatesForTournament(selectedTournament);
      
      if (result.success) {
        toast.success(`Generated ${result.generatedCount} certificates! ${result.existingCount} already existed.`);
        // Refresh submissions to show certificate status
        const { submissions } = await getSubmissionsByTournament(
          selectedTournament,
          currentPage,
          itemsPerPage,
          searchQuery
        );
        setSubmissions(submissions);
        setFilteredSubmissions(submissions);
      } else {
        toast.error(result.message || "Failed to generate certificates");
      }
    } catch (error) {
      console.error("Error generating certificates:", error);
      toast.error("Failed to generate certificates");
    } finally {
      setGeneratingCertificates(false);
    }
  };

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Certificates</h2>

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
              placeholder="Search participants..."
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
          ) : selectedTournament && filteredSubmissions.length > 0 ? (
            <div className="space-y-4">
              <div className="rounded-md border overflow-x-auto">
                <div className="min-w-[1000px]">
                  {/* Header row */}
                  <div className="grid grid-cols-12 p-4 text-sm font-medium bg-muted/50 text-center">
                    <div className="col-span-2">User</div>
                    <div className="col-span-2">Email</div>
                    <div className="col-span-1">Score</div>
                    <div className="col-span-1">Rank</div>
                    <div className="col-span-2">Date of Birth</div>
                    <div className="col-span-2">Certificate</div>
                    <div className="col-span-2">Actions</div>
                  </div>

                  {/* Data rows */}
                  <div className="divide-y">
                    {filteredSubmissions.map((submission) => (
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
                        <div className="col-span-1">
                          {submission.score?.toFixed(2) || "N/A"}
                        </div>
                        <div className="col-span-1">
                          {submission.rank || "N/A"}
                        </div>
                        <div className="col-span-2 text-sm">
                          {submission.date_of_birth
                            ? new Date(submission.date_of_birth).toLocaleDateString()
                            : "N/A"}
                        </div>
                        <div className="col-span-2">
                          {submission.certificate_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => window.open(submission.certificate_url, '_blank')}
                            >
                              <Download className="h-4 w-4 mr-2" />
                              Download
                            </Button>
                          ) : (
                            <span className="text-muted-foreground">Not generated</span>
                          )}
                        </div>
                        <div className="col-span-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              // Handle individual certificate generation
                            }}
                            disabled={!submission.rank}
                          >
                            <FileText className="h-4 w-4 mr-2" />
                            Generate
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex justify-between items-center">
                <div className="flex gap-4">
                  <Button
                    onClick={generateRank}
                    disabled={generatingRank || !selectedTournament}
                  >
                    <Trophy className="h-4 w-4 mr-2" />
                    {generatingRank ? "Generating Ranks..." : "Generate Ranks"}
                  </Button>
                  <Button
                    onClick={handleGenerateCertificates}
                    disabled={generatingCertificates || !ranksGenerated}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    {generatingCertificates ? "Generating Certificates..." : "Generate All Certificates"}
                  </Button>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                  </div>
                  <div className="flex space-x-2 ml-4">
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
                Please select a Competition to view submissions.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}