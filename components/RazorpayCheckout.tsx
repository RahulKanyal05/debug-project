'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loadRazorpayScript, createOrder, initializeRazorpayCheckout, verifyPayment} from '../lib/razorpay';
import { amountToPaisa, generateReceiptId } from '../lib/utilss';

interface RazorpayCheckoutProps {
  amount: string;
  userEmail: string | null;
  onPaymentStart: () => void;
  onPaymentSuccess: (paymentData: any) => void;
  onPaymentError: (error: string) => void;
  onPaymentCancel: () => void;
}

export default function RazorpayCheckout({
  amount,
  userEmail,
  onPaymentStart,
  onPaymentSuccess,
  onPaymentError,
  onPaymentCancel
}: RazorpayCheckoutProps) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Load Razorpay script when component mounts
    const loadScript = async () => {
      const scriptLoaded = await loadRazorpayScript();
      setIsReady(scriptLoaded);
      if (!scriptLoaded) {
        onPaymentError('Failed to load payment gateway. Please try again later.');
      }
    };

    loadScript();
  }, [onPaymentError]);

  const handlePayment = async () => {
    try {
      // Notify payment started
      onPaymentStart();

      // Convert string amount with commas to number in paisa
      const amountInPaisa = amountToPaisa(amount);
      const receiptId = generateReceiptId();
      
      // Create order
      const orderDetails = await createOrder(amountInPaisa, 'INR', receiptId);
      
      if (!orderDetails) {
        throw new Error('Failed to create order');
      }

      // Configure Razorpay options
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || '',
        amount: orderDetails.amount,
        currency: orderDetails.currency,
        name: 'Mastercraft Design',
        description: 'Premium Design Services',
        image: 'https://your-logo-url.png', // Replace with your logo URL
        order_id: orderDetails.id,
        handler: async function(response: any) {
          // Verify payment
          const paymentData = {
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
            amount: amountInPaisa,
            currency: 'INR',
            email: userEmail || '',
            contact: '',
            method: '',
          };

          const verification = await verifyPayment(paymentData);
          
          if (verification.verified && verification.payment) {
            onPaymentSuccess(verification.payment);
            // Navigate to payment summary
            router.push(`/payment-summary?paymentId=${verification.payment.paymentId}`);
          } else {
            onPaymentError('Payment verification failed. Please contact support.');
          }
        },
        prefill: {
          email: userEmail || undefined,
        },
        theme: {
          color: '#CAC5FE',
        },
        modal: {
          ondismiss: function() {
            onPaymentCancel();
          },
          animation: true,
        },
      };

      // Initialize Razorpay checkout
      const { success, error } = await initializeRazorpayCheckout(options);

      if (!success) {
        throw new Error(error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment error:', error);
      onPaymentError((error as Error).message || 'Payment failed. Please try again.');
    }
  };

  // Return the function that initiates payment
  return { handlePayment, isReady };
}