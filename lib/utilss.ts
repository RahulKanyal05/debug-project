import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to load external scripts
export function loadScript(src: string): Promise<boolean> {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
}

// Format currency amount
export function formatCurrency(amount: number | string, currency: string = 'INR'): string {
  // Remove commas from string and convert to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(numAmount);
}

// Convert amount to paisa (for Razorpay)
export function amountToPaisa(amount: number | string): number {
  // Remove commas from string and convert to number
  const numAmount = typeof amount === 'string' ? parseFloat(amount.replace(/,/g, '')) : amount;
  return Math.round(numAmount * 100);
}

// Convert paisa to amount
export function paisaToAmount(paisa: number): number {
  return paisa / 100;
}

// Generate a unique order receipt ID
export function generateReceiptId(): string {
  return `order_rcpt_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Format date from timestamp
export function formatDate(timestamp: string | number | Date): string {
  const date = new Date(timestamp);
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}