"use client";

import { Brain, Users, Globe, CheckCircle, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function AboutPage() {
  return (
    <div className="bg-[#0a0a0a] text-white">
      
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 sm:py-32">
        <div className="container mx-auto max-w-6xl px-4 text-center">
          <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-6xl">
            We are building the future of <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Career Preparation</span>
          </h1>
          <p className="mx-auto max-w-2xl text-lg text-gray-400 mb-10">
            Mentora AI isn't just a chatbot. It's a real-time voice simulator designed to 
            bridge the gap between knowledge and confidence.
          </p>
        </div>
        
        {/* Abstract Background Element */}
        <div className="absolute top-1/2 left-1/2 -z-10 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-[100px]" />
      </section>

      {/* Mission Grid */}
      <section className="py-16">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard 
              icon={<Brain className="h-8 w-8 text-purple-400" />}
              title="Realistic Simulation"
              desc="We use advanced LLMs and voice synthesis to mimic the pressure and flow of a real human interview."
            />
            <FeatureCard 
              icon={<Users className="h-8 w-8 text-blue-400" />}
              title="Unbiased Feedback"
              desc="Get objective, actionable feedback on your tone, pacing, and technical accuracy immediately after every session."
            />
            <FeatureCard 
              icon={<Globe className="h-8 w-8 text-green-400" />}
              title="Global Accessibility"
              desc="Democratizing high-quality career coaching. Practice anytime, anywhere, for any role."
            />
          </div>
        </div>
      </section>

      {/* Story / Stats Section */}
      <section className="border-y border-white/5 bg-[#111] py-20">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex flex-col gap-16 md:flex-row md:items-center">
            <div className="flex-1 space-y-6">
              <h2 className="text-3xl font-bold">Why we started</h2>
              <p className="text-gray-400 leading-relaxed">
                Traditional interview prep is broken. Reading LeetCode solutions or memorizing behavioral answers doesn't prepare you for the nervous energy of a live call.
              </p>
              <p className="text-gray-400 leading-relaxed">
                We built Mentora to give candidates a safe space to fail, learn, and improve. Whether you're a fresh grad or a seasoned pro, repetition is the key to mastery.
              </p>
              
              <div className="pt-4 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400" />
                  <span>Powered by GPT-4 & Vapi</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400" />
                  <span>Latency under 800ms</span>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-indigo-400" />
                  <span>Secure & Private</span>
                </div>
              </div>
            </div>
            
            <div className="flex-1 relative h-[400px] w-full rounded-2xl overflow-hidden border border-white/10 bg-black">
               {/* Replace with a real team image or abstract graphic */}
               <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                  [Team/Office Image Placeholder]
               </div>
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
               <div className="absolute bottom-6 left-6">
                 <p className="font-bold text-white">Deepak Gariya, Rahul Kanyal</p>
                 <p className="text-sm text-indigo-400">Founder & Lead Developers</p>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-24 text-center">
        <div className="container mx-auto px-4">
          <h2 className="mb-6 text-3xl font-bold">Ready to master your pitch?</h2>
          <Link href="/practice-interview">
            <button className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-gray-200">
              Start Practicing Now <ArrowRight className="h-5 w-5" />
            </button>
          </Link>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: any) {
  return (
    <div className="rounded-2xl border border-white/5 bg-white/5 p-8 transition hover:bg-white/10">
      <div className="mb-4 inline-block rounded-lg bg-black/50 p-3">
        {icon}
      </div>
      <h3 className="mb-3 text-xl font-bold">{title}</h3>
      <p className="text-gray-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}