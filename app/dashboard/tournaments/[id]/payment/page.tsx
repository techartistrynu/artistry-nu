// /tournaments/[id]/payment/page.tsx
"use client";

import {  useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/client";

export default function PaymentPage() {
  const [isPaying, setIsPaying] = useState(false);
  const searchParams = useSearchParams();
  const tournamentId = searchParams.get("id");
  const submissionId = searchParams.get("submission_id");

  const loadRazorpay = () =>
    new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  const handlePayment = async () => {
    setIsPaying(true);

    const res = await fetch("/api/payment/order", {
      method: "POST",
      body: JSON.stringify({ amount: 100, submissionId }), // Replace 100 with dynamic amount if needed
    });

    const data = await res.json();
    const isScriptLoaded = await loadRazorpay();
    if (!isScriptLoaded || !data.id) {
      alert("Failed to load Razorpay or create order");
      setIsPaying(false);
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.amount,
      currency: data.currency,
      name: "Art Tournament",
      description: "Entry Fee",
      order_id: data.id,
      handler: async function (response: any) {
        // Update submission payment status
        if (submissionId) {
          const ref = doc(db, "submissions", submissionId);
          await updateDoc(ref, {
            payment_status: "paid",
            status: "paid",
            paid_amount: data.amount,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_order_id: response.razorpay_order_id,
            razorpay_signature: response.razorpay_signature,
          });
        }

        alert("Payment successful");
        window.location.href = `/dashboard/tournaments/${tournamentId}/payment/success?submissionId=${submissionId}`;

      },
      prefill: {
        name: "Participant",
        email: "email@example.com", // optional
      },
      theme: {
        color: "#6366f1",
      },
    };

    const razorpay = new (window as any).Razorpay(options);
    razorpay.open();
    setIsPaying(false);
  };

  return (
    <div className="container py-10 max-w-md">
      <h1 className="text-2xl font-bold mb-6">Complete Your Payment</h1>
      <Button onClick={handlePayment} disabled={isPaying}>
        {isPaying ? "Processing..." : "Pay ₹100 Now"}
      </Button>
    </div>
  );
}
