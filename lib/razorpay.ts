// lib/razorpay.ts

export const submitRefundRequest = async (paymentId: string, reason: string) => {
  try {
    const response = await fetch("/api/request-refund", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ paymentId, reason }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to submit refund request");
    }

    return data;
  } catch (error) {
    console.error("Refund Error:", error);
    throw error;
  }
};