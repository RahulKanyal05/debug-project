import { NextResponse } from "next/server";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const { orderId, paymentId, signature } = await req.json();

    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Create the expected signature
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(orderId + "|" + paymentId)
      .digest("hex");

    // Compare with the signature Razorpay sent
    if (generated_signature === signature) {
      // ✅ Payment is Legit!
      // TODO: Update your database here (e.g., set user.isPro = true)
      
      return NextResponse.json({ verified: true });
    } else {
      return NextResponse.json(
        { verified: false, message: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error verifying payment:", error);
    return NextResponse.json(
      { error: "Error verifying payment" },
      { status: 500 }
    );
  }
}