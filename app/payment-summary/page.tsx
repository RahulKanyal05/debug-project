"use client";

import React from "react";
import { CheckCircle, Shield, CreditCard, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function PaymentSummary() {
  // Example Pricing Data
  const PLAN_PRICE = 499; // Base price in Rupees
  const GST_RATE = 0.18;  // 18% GST
  const gstAmount = Math.round(PLAN_PRICE * GST_RATE);
  const totalAmount = PLAN_PRICE + gstAmount;

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-12 items-start">

        {/* LEFT SIDE: Plan Details */}
        <div>
          <h1 className="text-4xl font-bold text-white mb-6">
            Complete your <span className="text-indigo-400">Purchase</span>
          </h1>
          <p className="text-gray-400 text-lg mb-8">
            Unlock unlimited AI mock interviews, detailed performance reports, and real-time grammar feedback.
          </p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl">
                <CheckCircle className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">Unlimited Practice</h3>
                <p className="text-gray-400">Practice with any role (HR, Tech, Manager) as many times as you want.</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="bg-indigo-500/10 p-3 rounded-xl">
                <Shield className="h-6 w-6 text-indigo-400" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-lg">AI Analysis & Reports</h3>
                <p className="text-gray-400">Get a downloadable PDF report with grammar fixes and STAR method answers.</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE: Payment Card */}
        <div className="bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-gray-400" /> Order Summary
          </h2>

          {/* Item List */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-4 border-b border-white/5">
              <div>
                <p className="text-white font-medium">AI Interview Pro Plan</p>
                <p className="text-xs text-gray-500">Monthly Subscription</p>
              </div>
              <p className="text-white font-medium">₹{PLAN_PRICE}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-400">Subtotal</p>
              <p className="text-gray-400">₹{PLAN_PRICE}</p>
            </div>

            <div className="flex justify-between items-center">
              <p className="text-gray-400">GST (18%)</p>
              <p className="text-gray-400">₹{gstAmount}</p>
            </div>
          </div>

          {/* Total */}
          <div className="flex justify-between items-center pt-6 border-t border-white/10 mb-8">
            <p className="text-xl font-bold text-white">Total Amount</p>
            <p className="text-3xl font-bold text-indigo-400">₹{totalAmount}</p>
          </div>

          {/* Pay Button */}
          <button
            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center gap-2 group"
            onClick={() => alert("Redirecting to Payment Gateway...")}
          >
            Proceed to Pay <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-center text-xs text-gray-500 mt-6 flex items-center justify-center gap-2">
            <Shield className="h-3 w-3" /> Secure SSL Encryption
          </p>
        </div>

      </div>
    </div>
  );
}