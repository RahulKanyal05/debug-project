import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { paymentId, reason, email } = await request.json();

    if (!paymentId || !reason) {
      return NextResponse.json(
        { success: false, message: 'Payment ID and reason are required' },
        { status: 400 }
      );
    }

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    const admin_email = process.env.ADMIN_EMAIL;
    const smtp_user = process.env.SMTP_USER; // Your Gmail (e.g., you@gmail.com)
    const smtp_pass = process.env.SMTP_PASS; // App password from Gmail

    if (!key_id || !key_secret || !smtp_user || !smtp_pass || !admin_email) {
      return NextResponse.json(
        { success: false, message: 'Required environment variables not set' },
        { status: 500 }
      );
    }

    // Send email using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtp_user,
        pass: smtp_pass,
      },
    });

    const mailOptions = {
      from: smtp_user,
      to: admin_email,
      subject: 'Refund Request Received',
      html: `
        <h2>Refund Request</h2>
        <p><strong>Payment ID:</strong> ${paymentId}</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <p><strong>User Email:</strong> ${email || 'Not provided'}</p>
        <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
      `,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Refund request submitted and email sent to admin.',
    });
  } catch (error) {
    console.error('Error requesting refund:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process refund request' },
      { status: 500 }
    );
  }
}
