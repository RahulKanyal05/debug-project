"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/services/razorpay.client";

export type StartPaymentParams = {
  amount: number;
  currency?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
};

type UseRazorpayCheckoutResult = {
  isReady: boolean;
  startPayment: (params: StartPaymentParams) => Promise<void>;
};

export function useRazorpayCheckout(): UseRazorpayCheckoutResult {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  /* -------------------------------------------------------------------------- */
  /* Load Razorpay Script                            */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    async function load() {
      const loaded = await loadRazorpayScript();
      setIsReady(loaded);
    }
    load();
  }, []);

  /* -------------------------------------------------------------------------- */
  /* Start Payment                                */
  /* -------------------------------------------------------------------------- */

  const startPayment = useCallback(
    async (params: StartPaymentParams) => {
      // Destructure the new params so we can use them
      const { 
        amount, 
        currency = "INR", 
        name = "Mentora AI", 
        description, 
        prefill, 
        onSuccess, 
        onError 
      } = params;

      if (!isReady) {
        throw new Error("Payment system not ready");
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("Razorpay key not configured");
      }

      try {
        // 1️⃣ Create order on server (amount in rupees, converted to paise on server usually, 
        // but if your API expects rupees, keep it as is. 
        // NOTE: Ensure your API handles the conversion if needed.)
        const orderRes = await fetch("/api/create-order", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount, 
            currency
          }),
        });

        if (!orderRes.ok) {
          const errorData = await orderRes.json();
          throw new Error(errorData.error || "Failed to create payment order");
        }

        const { order } = await orderRes.json();

        // 2️⃣ Open Razorpay checkout
        const razorpay = new (window as any).Razorpay({
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          order_id: order.id,
          amount: order.amount, // paise (from server)
          currency: order.currency,
          name: name,            // Uses the name from Cart page
          description: description, // Uses description from Cart page
          
          prefill: {
            name: prefill?.name,
            email: prefill?.email,
            contact: prefill?.contact,
          },
          theme: {
            color: "#CAC5FE",
          },

          handler: async (response: any) => {
            try {
              // 3️⃣ Verify payment on server
              const verifyRes = await fetch("/api/verify-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  orderId: response.razorpay_order_id,
                  paymentId: response.razorpay_payment_id,
                  signature: response.razorpay_signature,
                }),
              });

              const verifyData = await verifyRes.json();

              if (!verifyData.verified) {
                throw new Error("Payment verification failed");
              }

              // 4️⃣ Handle Success
              if (onSuccess) {
                // If a callback is provided (like in your Cart page), use it
                onSuccess(response);
              } else {
                // Default fallback: Redirect to summary
                router.push(
                  `/payment-summary?paymentId=${response.razorpay_payment_id}`
                );
              }
            } catch (err: any) {
              if (onError) onError(err);
              else console.error("Verification Error:", err);
            }
          },

          modal: {
            ondismiss: () => {
              if (onError) {
                 onError(new Error("Payment cancelled by user"));
              } else {
                 console.warn("Payment cancelled by user");
              }
            },
          },
        });

        razorpay.open();
        
      } catch (error: any) {
        if (onError) {
          onError(error);
        } else {
          console.error("Payment initialization failed:", error);
          throw error;
        }
      }
    },
    [isReady, router]
  );

  return { isReady, startPayment };
}