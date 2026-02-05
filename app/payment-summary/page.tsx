'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  CheckCircle,
  Clock,
  XCircle,
  ArrowLeft,
  Download,
  HelpCircle,
  CreditCard,
  Calendar,
  Mail,
  Smartphone,
  ShieldCheck
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
type PaymentStatus = 'success' | 'processing' | 'failed';

export default function PaymentSummaryPage() {
  return (
    <Suspense fallback={<PaymentLoading />}>
      <PaymentSummaryClient />
    </Suspense>
  );
}

// --- Loading Component ---
function PaymentLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center text-white">
      <div className="h-12 w-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mb-4"></div>
      <p className="text-gray-400">Verifying payment details...</p>
    </div>
  );
}

// --- Main Client Component ---
function PaymentSummaryClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams?.get('paymentId');

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Refund State
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState('');
  const [isRefunding, setIsRefunding] = useState(false);

  // --- 1. Fetch Payment Data (Mock Logic) ---
  useEffect(() => {
    if (!paymentId) {
      setLoading(false);
      return;
    }

    // Simulate API Call
    setTimeout(() => {
      const mockPayment = {
        paymentId: paymentId,
        orderId: `ORD-${Date.now().toString().substring(6)}`,
        amount: 49900, // 499 INR in paisa
        currency: 'INR',
        status: 'success', // Try changing this to 'failed' to see error state
        method: 'card',
        email: 'user@example.com',
        contact: '+91 98765 43210',
        plan: 'PrepWise Pro Lifetime',
        timestamp: new Date().toISOString(),
      };

      setPayment(mockPayment);
      setLoading(false);
    }, 1500);
  }, [paymentId]);

  // --- 2. Formatters ---
  const formatCurrency = (amountInPaisa: number, currency: string) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency,
    }).format(amountInPaisa / 100);
  };

  const formatDate = (isoString: string) => {
    return new Date(isoString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // --- 3. Handlers ---
  const handleRefundSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!refundReason.trim()) return;

    setIsRefunding(true);

    // Simulate Refund API Call
    setTimeout(() => {
      setIsRefunding(false);
      setShowRefundForm(false);
      toast.success("Refund request submitted successfully. We will update you via email.");
    }, 2000);
  };

  if (loading) return <PaymentLoading />;

  if (!payment) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 max-w-md w-full text-center">
          <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Payment Not Found</h2>
          <p className="text-gray-400 mb-6">We couldn't locate the transaction details. Please check your link or contact support.</p>
          <button
            onClick={() => router.push('/')}
            className="bg-indigo-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-indigo-500 transition-all"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
      <div className="max-w-3xl w-full space-y-8">

        {/* Header / Nav */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white">P</div>
            <span className="text-xl font-bold text-white tracking-tight">PrepWise</span>
          </div>
          <button
            onClick={() => router.push('/')}
            className="text-gray-400 hover:text-white flex items-center gap-2 transition-colors text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
        </div>

        {/* Main Card */}
        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden shadow-2xl relative">

          {/* Top Decorative Line */}
          <div className={`h-2 w-full ${payment.status === 'success' ? 'bg-green-500' :
              payment.status === 'processing' ? 'bg-blue-500' : 'bg-red-500'
            }`} />

          <div className="p-8 md:p-12">

            {/* Status Header */}
            <div className="text-center mb-10">
              <div className={`mx-auto h-20 w-20 rounded-full flex items-center justify-center mb-6 ${payment.status === 'success' ? 'bg-green-500/10 text-green-500' :
                  payment.status === 'processing' ? 'bg-blue-500/10 text-blue-500' : 'bg-red-500/10 text-red-500'
                }`}>
                {payment.status === 'success' ? <CheckCircle className="h-10 w-10" /> :
                  payment.status === 'processing' ? <Clock className="h-10 w-10" /> :
                    <XCircle className="h-10 w-10" />}
              </div>

              <h1 className="text-3xl font-bold text-white mb-2">
                {payment.status === 'success' ? 'Payment Successful!' :
                  payment.status === 'processing' ? 'Payment Processing...' : 'Payment Failed'}
              </h1>
              <p className="text-gray-400 max-w-md mx-auto">
                {payment.status === 'success' ? `Thank you for your purchase. Your account has been upgraded to ${payment.plan}.` :
                  'We are verifying your transaction status. You will receive an email shortly.'}
              </p>
            </div>

            {/* Receipt Box */}
            <div className="bg-black/40 border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex justify-between items-end mb-6 pb-6 border-b border-white/10">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Total Amount</p>
                  <p className="text-3xl font-bold text-white tracking-tight">
                    {formatCurrency(payment.amount, payment.currency)}
                  </p>
                </div>
                <div className="text-right">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-gray-300">
                    <ShieldCheck className="h-3 w-3 text-green-500" /> Secure
                  </div>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-12">
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Transaction ID</p>
                  <p className="text-gray-200 font-mono text-sm">{payment.paymentId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Order Reference</p>
                  <p className="text-gray-200 font-mono text-sm">{payment.orderId}</p>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Date & Time</p>
                  <div className="flex items-center gap-2 text-gray-200 text-sm">
                    <Calendar className="h-4 w-4 text-indigo-400" />
                    {formatDate(payment.timestamp)}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Payment Method</p>
                  <div className="flex items-center gap-2 text-gray-200 text-sm capitalize">
                    <CreditCard className="h-4 w-4 text-indigo-400" />
                    {payment.method}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Billed To</p>
                  <div className="flex items-center gap-2 text-gray-200 text-sm">
                    <Mail className="h-4 w-4 text-indigo-400" />
                    {payment.email}
                  </div>
                </div>
                <div>
                  <p className="text-gray-500 text-xs uppercase font-bold tracking-wider mb-2">Contact</p>
                  <div className="flex items-center gap-2 text-gray-200 text-sm">
                    <Smartphone className="h-4 w-4 text-indigo-400" />
                    {payment.contact}
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => window.print()}
                className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-medium transition-all border border-white/10"
              >
                <Download className="h-4 w-4" /> Download Receipt
              </button>

              {payment.status === 'success' && (
                <button
                  onClick={() => setShowRefundForm(!showRefundForm)}
                  className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-transparent hover:bg-white/5 text-gray-400 hover:text-white font-medium transition-all"
                >
                  <HelpCircle className="h-4 w-4" /> Need Help?
                </button>
              )}
            </div>

            {/* Refund Form (Collapsible) */}
            {showRefundForm && (
              <div className="mt-8 pt-8 border-t border-white/10 animate-in fade-in slide-in-from-top-4 duration-300">
                <h3 className="text-white font-bold mb-4">Request a Refund</h3>
                <form onSubmit={handleRefundSubmit}>
                  <label className="block text-sm text-gray-400 mb-2">Reason for refund request</label>
                  <textarea
                    required
                    value={refundReason}
                    onChange={(e) => setRefundReason(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl p-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all mb-4"
                    rows={3}
                    placeholder="Briefly explain the issue..."
                  />
                  <div className="flex gap-3 justify-end">
                    <button
                      type="button"
                      onClick={() => setShowRefundForm(false)}
                      className="px-4 py-2 rounded-lg text-sm text-gray-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isRefunding}
                      className="px-6 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/50 text-sm font-medium transition-all disabled:opacity-50"
                    >
                      {isRefunding ? 'Submitting...' : 'Submit Request'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

          {/* Footer of Card */}
          <div className="bg-black/20 p-4 text-center border-t border-white/5">
            <p className="text-xs text-gray-600">
              Transaction secured by Razorpay. ID: {payment.paymentId}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}