"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Upload, Loader2, Link } from "lucide-react";
import {
  submitArtwork,
  updatePaymentDetails,
} from "@/app/actions/create-submission";
import {
  getTournamentById,
  getUserSubmissionForTournament,
} from "@/app/actions/tournaments";
import { getTournamentStatusText, formatPriceWithDiscount } from "@/lib/utils";
import {
  Select,
  SelectValue,
  SelectTrigger,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

export default function SubmitToTournamentPage() {
  const router = useRouter();
  const params = useParams();
  const tournamentId = params?.id as string;
  const { data: session } = useSession();
  const userId = session?.user?.id;


  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [applicantName, setApplicantName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>();
  const [phoneNumber, setPhoneNumber] = useState("");
  const [files, setFiles] = useState<FileList | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isPaymentLoading, setIsPaymentLoading] = useState(false);
  const [source, setSource] = useState("");

  const [tournament, setTournament] = useState<any>(null);
  const [existingSubmission, setExistingSubmission] = useState<any>(null);
  useEffect(() => {
    const fetchData = async () => {
      if (!tournamentId || !userId) {
        router.push("/dashboard");
        return;
      }

      try {
        setIsLoading(true);
        const tournamentData = await getTournamentById(tournamentId as string);
        // const existingSubmission = await getUserSubmissionForTournament(
        //   userId,
        //   tournamentId
        // );
        setTournament(tournamentData);
        setExistingSubmission(existingSubmission);
      } catch (error) {
        toast.error("Failed to load tournament data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [tournamentId, router, userId, toast]);

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin" />
              <span className="ml-2">Loading tournament data...</span>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Tournament Not Found</CardTitle>
            <CardDescription>
              The tournament you are looking for does not exist.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Link href="/dashboard/tournaments">
              <Button>Back to Tournaments</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (existingSubmission) {
    return (
      <div className="container mx-auto py-8">
        <Card className="max-w-3xl mx-auto">
          <CardHeader>
            <CardTitle>Submission Already Exists</CardTitle>
            <CardDescription>
              You have already submitted an artwork for this tournament. Please
              check your submissions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* <Link href={`/dashboard/submissions/${existingSubmission.id}`}> */}
            <Button
              variant="outline"
              onClick={() =>
                router.push(`/dashboard/submissions/${existingSubmission.id}`)
              }
            >
              Back to Submissions
            </Button>
            {/* </Link> */}
          </CardContent>
        </Card>
      </div>
    );
  }

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const triggerPayment = async (submissionId: string) => {
    try {
      setIsPaymentLoading(true);
      const discountedAmount = tournament?.discount_percent 
        ? Math.round((tournament.entry_fee * (100 - tournament.discount_percent))/100)
        : tournament?.entry_fee || 1000;
      
      const res = await fetch("/api/payment/order", {
        method: "POST",
        body: JSON.stringify({
          amount: discountedAmount,
          submissionId,
        }),
      });

      const data = await res.json();
      const isScriptLoaded = await loadRazorpay();

      if (!isScriptLoaded || !data.id) {
        toast.error("Razorpay script load or order creation failed.");
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: tournament?.title,
        description: "Entry Fee",
        order_id: data.id,
        handler: async function (response: any) {
          try {
            setIsPaymentLoading(true);
            setIsLoading(true);
            toast.success("Don't refresh the page, it will redirect you to the success page.");
            const result = await updatePaymentDetails({
              submissionId,
              paymentData: {
                paid_amount: data.amount,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
              },
              tournamentId: tournamentId,
              userId: session?.user?.id ?? "",
            });

            if (!result.success) {
              toast.error(result.error);
              return;
            }

            toast.success("Thank you!");
            router.push(
              `/dashboard/tournaments/${tournamentId}/payment/success?submissionId=${submissionId}`
            );
          } catch (error) {
            toast.error("Failed to process payment");
          } finally {
            setIsLoading(false);
            setIsPaymentLoading(false);
          }
        },
        prefill: {
          name: applicantName,
          email: session?.user?.email ?? "",
        },
        theme: {
          color: "#6366f1",
        },
      };

      const razorpay = new (window as any).Razorpay(options);
      razorpay.open();
    } catch (error) {
      toast.error( "Failed to initialize payment",);
    } finally {
      setIsPaymentLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!files || !dateOfBirth) {
      toast.error("Please upload files and select your date of birth.");
      return;
    }

    // File size validation (max 5MB per file)
    const maxFileSize = 5 * 1024 * 1024; // 5MB
    for (const file of Array.from(files)) {
      if (file.size > maxFileSize) {
        toast.error(`Each file must be under 5MB. "${file.name}" is too large.`);
        return;
      }
    }

    if (dateOfBirth >= new Date()) {
      toast.error("Date of birth cannot be in the future.");
      return;
    }
    

    setIsUploading(true);
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("applicantName", applicantName);
      formData.append("dateOfBirth", dateOfBirth.toISOString());
      formData.append("phoneNumber", phoneNumber);
      formData.append("tournamentId", tournamentId);
      formData.append("userId", session?.user?.id ?? "");
      formData.append("source", source);
      Array.from(files).forEach((file) => formData.append("files", file));

      const result = await submitArtwork(formData);

      if (!result) {
        toast( "Submission Failed, Failed to submit artwork");
        return;
      }

      toast.info( "Submission Received, Proceeding to payment...");
      await triggerPayment(result.submissionId);
    } catch (error) {
      console.error(error);
      toast(`Submission Failed!"`);
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  return (
    <div className="container max-w-3xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Submit Your Artwork</CardTitle>
          <CardDescription>
            Complete this form to submit your artwork to the Competition Enrollment.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicantName">Applicant Name*</Label>
                <Input
                  id="applicantName"
                  value={applicantName}
                  onChange={(e) => setApplicantName(e.target.value)}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth*</Label>
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  type="date"
                  onChange={(e) => setDateOfBirth(new Date(e.target.value))}
                  required
                  className="w-full"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  pattern="[0-9]{10}"
                  placeholder="10-digit number"
                  className="w-full"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title of Your Work*</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description*</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={5}
                required
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="source">Where you heard about us</Label>
              <Select
                name="source"
                value={source}
                onValueChange={(value) => setSource(value)}
                required
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="friend">Friend or Colleague</SelectItem>
                  <SelectItem value="search-engine">Search Engine</SelectItem>
                  <SelectItem value="advertisement">Advertisement</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="files">Upload Files*</Label>
              <div className="border-2 border-dashed border-gray-300 rounded-md p-6 flex flex-col items-center justify-center w-full">
                <Upload className="h-8 w-8 text-gray-400 mb-2" />
                <p className="text-sm text-gray-500 mb-2 text-center">
                  Drag and drop or click to upload
                </p>
                <Input
                  id="files"
                  type="file"
                  className="hidden"
                  onChange={(e) => setFiles(e.target.files)}
                  multiple
                  accept=".jpg,.jpeg,.png,.svg"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => document.getElementById("files")?.click()}
                  className="w-full mt-2"
                >
                  Select Files
                </Button>
              </div>
              {files && (
                <ul className="text-sm mt-2 text-gray-500 list-disc list-inside">
                  {Array.from(files).map((file, idx) => (
                    <li key={idx}>
                      {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 ">
            {tournament?.discount_percent && tournament.discount_percent > 0 && (
              <div className="w-full mb-4 p-4 bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold text-green-800">Discount Applied</h3>
                  <Badge className="bg-green-500 text-white">
                    {tournament.discount_percent}% OFF
                  </Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Original Entry Fee:</span>
                    <span className="line-through">₹{tournament.entry_fee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Discount Amount:</span>
                    <span className="text-green-600">-₹{Math.round((tournament.entry_fee * tournament.discount_percent) / 100)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2">
                    <span className="font-semibold">Final Amount:</span>
                    <span className="font-bold text-green-600 text-lg">
                      ₹{Math.round((tournament.entry_fee * (100 - tournament.discount_percent)) / 100)}
                    </span>
                  </div>
                </div>
              </div>
            )}
            
            <Button
              type="submit"
              disabled={isSubmitting || isUploading || isPaymentLoading}
              className="w-full"
            >
              {isUploading || isSubmitting || isPaymentLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isUploading 
                    ? "Uploading Files..." 
                    : isPaymentLoading 
                    ? "Processing Payment..." 
                    : "Submitting..."}
                </>
              ) : (
                (() => {
                  const priceInfo = formatPriceWithDiscount(tournament?.entry_fee || 0, tournament?.discount_percent);
                  if (priceInfo.hasDiscount) {
                    return (
                      <>
                        Submit and Pay {priceInfo.discountedPrice}
                        <span className="ml-1 text-xs text-muted-foreground line-through">{priceInfo.originalPrice}</span>
                      </>
                    );
                  }
                  return `Submit and Pay ${priceInfo.originalPrice}`;
                })()
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
