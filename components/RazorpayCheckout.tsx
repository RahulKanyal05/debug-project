"use client";

import { useState } from "react";
import Script from "next/script";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface RazorpayCheckoutProps {
  amount: number; // Amount in INR (e.g., 499)
  userEmail?: string;
  userName?: string;
  description?: string;
}

declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function RazorpayCheckout({
  amount,
  userEmail = "",
  userName = "User",
  description = "PrepWise Pro Subscription",
}: RazorpayCheckoutProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      // 1. Create Order
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      if (!response.ok) throw new Error("Failed to create order");

      const data = await response.json();

      // 2. Initialize Razorpay
      const options = {
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "PrepWise AI",
        description: description,
        order_id: data.orderId,
        image: "/logo.svg", // Ensure this exists in your public folder
        handler: function (response: any) {
          // 3. On Success
          console.log("Payment Successful:", response);
          toast.success("Payment Successful! Welcome to Pro.");

          // Redirect to a success page or Dashboard
          router.push("/");
          router.refresh();
        },
        prefill: {
          name: userName,
          email: userEmail,
        },
        theme: {
          color: "#4F46E5", // Indigo-600
        },
      };

      const rzp1 = new window.Razorpay(options);

      // Handle payment failure/closure
      rzp1.on("payment.failed", function (response: any) {
        toast.error("Payment Failed: " + response.error.description);
        console.error(response.error);
      });

      rzp1.open();

    } catch (error) {
      console.error("Payment Initialization Error:", error);
      toast.error("Could not initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      {/* Load Razorpay Script Globally */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      <button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white text-lg font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Processing...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5" />
            Pay ₹{amount}
          </>
        )}
      </button>
    </>
  );
}