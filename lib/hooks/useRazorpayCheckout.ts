"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { loadRazorpayScript } from "@/lib/services/razorpay.client";

type StartPaymentParams = {
  amount: number; // in RUPEES
  email?: string;
};

type UseRazorpayCheckoutResult = {
  isReady: boolean;
  startPayment: (params: StartPaymentParams) => Promise<void>;
};

export function useRazorpayCheckout(): UseRazorpayCheckoutResult {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  /* -------------------------------------------------------------------------- */
  /*                            Load Razorpay Script                             */
  /* -------------------------------------------------------------------------- */

  useEffect(() => {
    async function load() {
      const loaded = await loadRazorpayScript();
      setIsReady(loaded);
    }
    load();
  }, []);

  /* -------------------------------------------------------------------------- */
  /*                              Start Payment                                  */
  /* -------------------------------------------------------------------------- */

  const startPayment = useCallback(
    async ({ amount, email }: StartPaymentParams) => {
      if (!isReady) {
        throw new Error("Payment system not ready");
      }

      if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID) {
        throw new Error("Razorpay key not configured");
      }

      // 1️⃣ Create order on server (amount in rupees)
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount, // RUPEES
        }),
      });

      if (!orderRes.ok) {
        throw new Error("Failed to create payment order");
      }

      const { order } = await orderRes.json();

      // 2️⃣ Open Razorpay checkout
      const razorpay = new (window as any).Razorpay({
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount, // paise (from server)
        currency: order.currency,
        name: "Mentora AI",
        description: "Interview Preparation Plan",
        prefill: {
          email,
        },
        theme: {
          color: "#CAC5FE",
        },

        handler: async (response: any) => {
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

          // 4️⃣ Redirect to summary
          router.push(
            `/payment-summary?paymentId=${response.razorpay_payment_id}`
          );
        },

        modal: {
          ondismiss: () => {
            console.warn("Payment cancelled by user");
          },
        },
      });

      razorpay.open();
    },
    [isReady, router]
  );

  return { isReady, startPayment };
}
