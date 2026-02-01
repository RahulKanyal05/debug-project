import { loadScript } from './utils';

export interface OrderDetails {
  id: string;
  amount: number;
  currency: string;
  receipt: string;
}

export interface PaymentDetails {
  orderId: string;
  paymentId: string;
  signature: string;
  amount: number;
  currency: string;
  status: string;
  method: string;
  email: string;
  contact: string;
  timestamp: string;
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  image?: string;
  order_id: string;
  handler: (response: any) => void;
  prefill: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: {
    [key: string]: string;
  };
  theme?: {
    color: string;
  };
  modal?: {
    ondismiss?: () => void;
    animation?: boolean;
  };
}

// Load Razorpay script
export const loadRazorpayScript = async (): Promise<boolean> => {
  return await loadScript('https://checkout.razorpay.com/v1/checkout.js');
};

// Create Razorpay order
export const createOrder = async (
  amount: number,
  currency: string = 'INR',
  receipt: string
): Promise<OrderDetails | null> => {
  try {
    const response = await fetch('/api/create-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        amount,
        currency,
        receipt,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to create order');
    }

    const data = await response.json();
    return data.order;
  } catch (error) {
    console.error('Error creating order:', error);
    return null;
  }
};

// Verify payment
export const verifyPayment = async (
  paymentDetails: {
    orderId: string;
    paymentId: string;
    signature: string;
    amount: number;
    currency: string;
    email: string;
    contact: string;
    method: string;
  }
): Promise<{ verified: boolean; payment?: PaymentDetails }> => {
  try {
    const response = await fetch('/api/verify-payment', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(paymentDetails),
    });

    if (!response.ok) {
      throw new Error('Failed to verify payment');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error verifying payment:', error);
    return { verified: false };
  }
};

// Submit refund request
export const submitRefundRequest = async (
  paymentId: string,
  reason: string,
  email: string
): Promise<{ success: boolean; message: string }> => {
  try {
    const response = await fetch('/api/request-refund', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        paymentId,
        reason,
        email,
      }),
    });

    if (!response.ok) {
      throw new Error('Failed to submit refund request');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error submitting refund request:', error);
    return { success: false, message: 'Something went wrong while processing your refund request.' };
  }
};

// Initialize Razorpay checkout
export const initializeRazorpayCheckout = (
  options: RazorpayOptions
): Promise<{ success: boolean; error?: string }> => {
  return new Promise((resolve) => {
    const rzp = new (window as any).Razorpay(options);

    rzp.on('payment.failed', (response: any) => {
      resolve({
        success: false,
        error: response.error.description,
      });
    });

    rzp.open();
    resolve({ success: true });
  });
};