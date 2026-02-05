'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Script from 'next/script';
import { Check, ArrowRight, Zap, Crown, Shield, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
type PricingPlan = {
  id: string;
  name: string;
  price: number; // in INR
  description: string;
  features: string[];
  buttonText: string;
  featured?: boolean;
  icon: any;
};

// --- Data ---
const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'basic',
    name: 'Starter',
    price: 0,
    description: 'Perfect for students and beginners starting their journey.',
    features: [
      '5 AI Practice Interviews',
      'Basic Grammar Feedback',
      'Standard Question Bank',
      'Email Support',
    ],
    buttonText: 'Start for Free',
    icon: Zap,
  },
  {
    id: 'pro',
    name: 'Pro Lifetime',
    price: 499,
    description: 'Unlock your full potential with unlimited access forever.',
    features: [
      'Unlimited AI Interviews',
      'Advanced STAR Method Analysis',
      'PDF Report Downloads',
      'Role-Specific Questions',
      'Priority Support',
      'Resume Analysis (Beta)'
    ],
    buttonText: 'Get Pro Access',
    featured: true,
    icon: Crown,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 2999,
    description: 'For coaching centers and educational institutions.',
    features: [
      'All Pro Features',
      'Admin Dashboard',
      'Student Progress Tracking',
      'Bulk License Management',
      'Custom Branding',
      'API Access'
    ],
    buttonText: 'Contact Sales',
    icon: Shield,
  }
];

// Add Razorpay type to window
declare global {
  interface Window {
    Razorpay: any;
  }
}

export default function ServicesPage() {
  const router = useRouter();
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  // --- PAYMENT LOGIC ---
  const handlePlanSelect = async (plan: PricingPlan) => {
    // Case 1: Free Plan
    if (plan.price === 0) {
      router.push('/practice-interview');
      return;
    }

    // Case 2: Enterprise (Manual Contact)
    if (plan.id === 'enterprise') {
      toast.info("Please contact support@prepwise.ai for enterprise plans.");
      return;
    }

    // Case 3: Paid Plan (Razorpay Integration)
    setProcessingPlanId(plan.id);

    try {
      // 1. Create Order on Server
      const response = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: plan.price }),
      });

      if (!response.ok) throw new Error("Failed to initiate payment");

      const orderData = await response.json();

      // 2. Open Razorpay Popup
      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "PrepWise AI",
        description: `Upgrade to ${plan.name}`,
        order_id: orderData.orderId,
        image: "/logo.svg",
        handler: function (response: any) {
          // 3. On Success -> Go to Receipt Page
          toast.success("Payment Successful! Upgrading account...");
          console.log("Payment ID:", response.razorpay_payment_id);

          // Redirect to the Summary page we built earlier
          router.push(`/payment-summary?paymentId=${response.razorpay_payment_id}`);
        },
        prefill: {
          name: "User", // You can fetch this from your Auth Context
          email: "user@example.com",
        },
        theme: {
          color: "#4F46E5",
        },
      };

      const rzp1 = new window.Razorpay(options);

      rzp1.on("payment.failed", function (response: any) {
        toast.error(response.error.description || "Payment failed");
        setProcessingPlanId(null);
      });

      rzp1.open();

    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Something went wrong. Please try again.");
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-x-hidden">
      {/* Load Razorpay Script */}
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />

      {/* --- Background Effects --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

        {/* --- Header --- */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h2 className="text-indigo-500 font-semibold tracking-wide uppercase text-sm mb-2">
            Pricing Plans
          </h2>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
            Invest in Your Career
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto text-lg">
            Choose the plan that fits your needs. Whether you're just starting or looking to master your interview skills, we have you covered.
          </p>
        </div>

        {/* --- Pricing Grid --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, index) => {
            const Icon = plan.icon;
            const isHovered = hoveredIndex === index;
            const isLoading = processingPlanId === plan.id;

            return (
              <div
                key={plan.id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`relative group bg-[#111] border rounded-3xl p-8 transition-all duration-300 ${plan.featured
                    ? 'border-indigo-500/50 shadow-2xl shadow-indigo-900/20 scale-105 z-10'
                    : 'border-white/10 hover:border-white/20 hover:scale-[1.02]'
                  }`}
              >
                {/* Popular Badge */}
                {plan.featured && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                    Most Popular
                  </div>
                )}

                {/* Card Header */}
                <div className="flex items-center gap-4 mb-6">
                  <div className={`p-3 rounded-xl ${plan.featured ? 'bg-indigo-500/20 text-indigo-400' : 'bg-white/5 text-gray-400'
                    }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {plan.price === 0 ? 'Free' : `₹${plan.price}`}
                      </span>
                      {plan.price > 0 && <span className="text-sm text-gray-500">/one-time</span>}
                    </div>
                  </div>
                </div>

                <p className="text-gray-400 text-sm mb-8 min-h-[40px]">
                  {plan.description}
                </p>

                {/* Features */}
                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-gray-300">
                      <div className={`mt-0.5 rounded-full p-0.5 ${plan.featured ? 'bg-green-500/20 text-green-500' : 'bg-white/10 text-gray-500'
                        }`}>
                        <Check className="h-3 w-3" />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* Button */}
                <button
                  onClick={() => handlePlanSelect(plan)}
                  disabled={isLoading}
                  className={`w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${plan.featured
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25'
                      : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'
                    } ${isLoading ? 'opacity-80 cursor-not-allowed' : ''}`}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      {plan.buttonText}
                      <ArrowRight className={`h-4 w-4 transition-transform ${isHovered ? 'translate-x-1' : ''}`} />
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* --- Trust Badge Section --- */}
        <div className="mt-24 text-center border-t border-white/5 pt-16">
          <p className="text-gray-500 text-sm mb-6 uppercase tracking-widest">Trusted by candidates from</p>
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
            <span className="text-xl font-bold text-gray-300">Google</span>
            <span className="text-xl font-bold text-gray-300">Microsoft</span>
            <span className="text-xl font-bold text-gray-300">Amazon</span>
            <span className="text-xl font-bold text-gray-300">Spotify</span>
          </div>
        </div>
      </div>
    </div>
  );
}