export type PaymentStatus = 'success' | 'processing' | 'failed';

export interface PaymentDetails {
  paymentId: string;
  orderId: string;
  amount: number; // Amount in paisa (e.g., 100000 for ₹1,000)
  currency: string;
  status: PaymentStatus;
  method: string;
  email: string;
  contact?: string;
  timestamp: string;
  packageId?: string;
  packageName?: string;
  packageDescription?: string;
}

export interface RefundStatus {
  status: string;
  message: string;
}

export interface InvoiceData extends PaymentDetails {
  invoiceNumber: string;
  billingAddress?: string;
  companyName: string;
  companyLogo?: string;
  companyAddress?: string;
  companyEmail?: string;
  companyPhone?: string;
}