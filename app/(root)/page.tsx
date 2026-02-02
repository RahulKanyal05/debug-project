// // app/(root)/page.tsx
// import Link from "next/link";
// import Image from "next/image";
// import { redirect } from "next/navigation";

// import { Button } from "@/components/ui/button";
// import InterviewCard from "@/components/interview/InterviewCard";

// import { getCurrentUser } from "@/lib/actions/auth.action";
// import {
//   getInterviewsByUserId,
//   getLatestInterviews,
// } from "@/lib/actions/interview.action";

// async function Home() {
//   // Get current user
//   const user = await getCurrentUser();
  
//   // If no user is found, redirect to sign-in
//   if (!user || !user.id) {
//     redirect("/sign-in");
//     // Alternative: return null; (the middleware will handle the redirect)
//   }

//   // Only fetch interviews if user exists and has an ID
//   const [userInterviews, allInterview] = await Promise.all([
//     getInterviewsByUserId(user.id),
//     getLatestInterviews({ userId: user.id }),
//   ]);

//   // Safely check array lengths with fallbacks
//   const hasPastInterviews = (userInterviews?.length || 0) > 0;
//   const hasUpcomingInterviews = (allInterview?.length || 0) > 0;

//   return (
//     <>
//       <section className="card-cta">
//         <div className="flex flex-col gap-6 max-w-lg">
//           <h2>Get Interview-Ready with AI-Powered Practice & Feedback</h2>
//           <p className="text-lg">
//             Practice real interview questions & get instant feedback
//           </p>

//           <Button asChild className="btn-primary max-sm:w-full">
//             <Link href="/interview">Start an Interview</Link>
//           </Button>
//         </div>

//         <Image
//           src="/robot.png"
//           alt="robo-dude"
//           width={400}
//           height={400}
//           className="max-sm:hidden"
//         />
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Your Interviews</h2>

//         <div className="interviews-section">
//           {hasPastInterviews ? (
//             userInterviews?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user.id}
//                 interviewId={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>You haven&apos;t taken any interviews yet</p>
//           )}
//         </div>
//       </section>

//       <section className="flex flex-col gap-6 mt-8">
//         <h2>Take Interviews</h2>

//         <div className="interviews-section">
//           {hasUpcomingInterviews ? (
//             allInterview?.map((interview) => (
//               <InterviewCard
//                 key={interview.id}
//                 userId={user.id}
//                 interviewId={interview.id}
//                 role={interview.role}
//                 type={interview.type}
//                 techstack={interview.techstack}
//                 createdAt={interview.createdAt}
//               />
//             ))
//           ) : (
//             <p>There are no interviews available</p>
//           )}
//         </div>
//       </section>
//     </>
//   );
// }

// export default Home;




"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { 
  Play, 
  TrendingUp, 
  History, 
  Zap, 
  Crown,
  Loader2
} from "lucide-react";
import Link from "next/link";

// Mock Data (Replace with API calls later)
const MOCK_STATS = {
  interviewsCompleted: 12,
  averageScore: 85,
  streakDays: 4,
  creditsLeft: 2
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 1. Auth Logic
  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // 2. Interface: Visitor View (Not Logged In)
  if (!user) {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center text-center px-4">
        <div className="mb-8 rounded-full bg-indigo-500/10 px-4 py-1.5 text-sm font-medium text-indigo-400 border border-indigo-500/20">
          🚀 The #1 AI Interview Coach
        </div>
        <h1 className="max-w-4xl text-5xl font-bold tracking-tight text-white sm:text-7xl">
          Master Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">Interview Skills</span>
        </h1>
        <p className="mt-6 max-w-2xl text-lg text-gray-400">
          Practice with realistic AI agents, get instant feedback, and land your dream job. 
          Real-time voice interaction and code analysis.
        </p>
        <div className="mt-10 flex gap-4">
          <Link href="/sign-up">
            <button className="rounded-xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:bg-gray-200">
              Get Started Free
            </button>
          </Link>
          <Link href="/about">
            <button className="rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-lg font-medium text-white transition hover:bg-white/10">
              How it works
            </button>
          </Link>
        </div>
      </div>
    );
  }

  // 3. Interface: User Dashboard (Logged In)
  return (
    <div className="container mx-auto max-w-6xl px-4 py-12">
      {/* Header */}
      <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">
            Welcome back, {user.displayName?.split(" ")[0] || "Candidate"} 👋
          </h1>
          <p className="text-gray-400">Here's what's happening with your prep today.</p>
        </div>
        
        {!MOCK_STATS.creditsLeft && (
           <Link href="/cart?plan=professional">
             <button className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-2.5 font-bold text-white shadow-lg shadow-orange-500/20 transition hover:scale-105">
               <Crown className="h-4 w-4" />
               Upgrade to Pro
             </button>
           </Link>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-12">
        <StatCard 
          icon={<TrendingUp className="h-5 w-5 text-green-400" />}
          label="Avg. Score"
          value={`${MOCK_STATS.averageScore}%`}
          sublabel="+5% from last week"
        />
        <StatCard 
          icon={<History className="h-5 w-5 text-blue-400" />}
          label="Completed"
          value={MOCK_STATS.interviewsCompleted.toString()}
          sublabel="Total sessions"
        />
        <StatCard 
          icon={<Zap className="h-5 w-5 text-yellow-400" />}
          label="Current Streak"
          value={`${MOCK_STATS.streakDays} Days`}
          sublabel="Keep it up!"
        />
        <StatCard 
          icon={<Crown className="h-5 w-5 text-purple-400" />}
          label="Credits Left"
          value={MOCK_STATS.creditsLeft.toString()}
          sublabel={MOCK_STATS.creditsLeft === 0 ? "Refill needed" : "Valid for 30 days"}
          alert={MOCK_STATS.creditsLeft === 0}
        />
      </div>

      {/* Main Actions */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Main Action: Start Interview */}
        <div className="group relative overflow-hidden rounded-3xl border border-indigo-500/20 bg-indigo-500/5 p-8 transition hover:border-indigo-500/40">
          <div className="absolute -right-10 -top-10 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl transition group-hover:bg-indigo-500/20" />
          
          <div className="relative">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-semibold text-indigo-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500"></span>
              </span>
              AI Interviewer Ready
            </div>
            
            <h2 className="mb-4 text-3xl font-bold text-white">Practice Interview</h2>
            <p className="mb-8 text-gray-400">
              Start a realistic voice interview session. Choose your topic (React, Node, System Design) and get instant feedback.
            </p>
            
            <Link href="/interview"> 
              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-4 text-lg font-bold text-white shadow-lg shadow-indigo-500/25 transition hover:bg-indigo-500">
                <Play className="h-5 w-5 fill-current" />
                Start Session
              </button>
            </Link>
          </div>
        </div>

        {/* Secondary Actions */}
        <div className="flex flex-col gap-6">
          {/* Resume Review Card */}
          <div className="flex-1 rounded-3xl border border-white/5 bg-white/5 p-8 transition hover:bg-white/10">
            <h3 className="mb-2 text-xl font-bold text-white">Resume Analysis</h3>
            <p className="mb-6 text-sm text-gray-400">Upload your CV to generate personalized questions tailored to your experience.</p>
            <button className="text-sm font-semibold text-white hover:text-indigo-400">Coming Soon →</button>
          </div>

          {/* Upgrade / Store Card (Connected to your Cart!) */}
          <div className="flex-1 rounded-3xl border border-white/5 bg-gradient-to-br from-gray-900 to-gray-800 p-8">
            <h3 className="mb-2 text-xl font-bold text-white">Pro Plan</h3>
            <p className="mb-6 text-sm text-gray-400">Unlock unlimited interviews, detailed analytics, and priority support.</p>
            <Link href="/cart?plan=professional">
              <button className="w-full rounded-lg border border-white/20 bg-white/5 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                View Plans
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Simple Stat Component
function StatCard({ icon, label, value, sublabel, alert }: any) {
  return (
    <div className={`rounded-2xl border bg-[#111] p-6 ${alert ? 'border-red-500/30' : 'border-white/5'}`}>
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-white/5">
        {icon}
      </div>
      <p className="text-sm font-medium text-gray-400">{label}</p>
      <div className="mt-1 flex items-baseline gap-2">
        <h4 className="text-2xl font-bold text-white">{value}</h4>
      </div>
      <p className="mt-1 text-xs text-gray-500">{sublabel}</p>
    </div>
  );
}