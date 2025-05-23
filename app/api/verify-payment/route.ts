import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const {
      orderId,
      paymentId,
      signature,
      amount,
      currency,
      email,
      contact,
      method
    } = await request.json();

    // Verify all required fields
    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing required payment details' },
        { status: 400 }
      );
    }

    // Get secret key from environment variables
    const key_secret = process.env.RAZORPAY_KEY_SECRET;

    if (!key_secret) {
      return NextResponse.json(
        { error: 'Razorpay credentials are not configured' },
        { status: 500 }
      );
    }

    // Verify the payment signature
    const payload = `${orderId}|${paymentId}`;
    const expectedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(payload)
      .digest('hex');

    const isSignatureValid = expectedSignature === signature;

    if (!isSignatureValid) {
      return NextResponse.json(
        { verified: false, error: 'Payment signature verification failed' },
        { status: 400 }
      );
    }

    // In a production app, you would store payment details in a database here
    const paymentDetails = {
      orderId,
      paymentId,
      signature,
      amount,
      currency,
      status: 'success',
      method: method || 'unknown',
      email: email || '',
      contact: contact || '',
      timestamp: new Date().toISOString(),
    };

    // Return successful response
    return NextResponse.json({
      verified: true,
      payment: paymentDetails
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { verified: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}