import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/actions/auth.action";
import { db } from "@/firebase/admin";
import {
  Zap,
  TrendingUp,
  Clock,
  ArrowRight,
  Crown,
  FileText,
  Plus,
  Target
} from "lucide-react";
import { Suspense } from "react";

// --- LOADING COMPONENT ---
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* Hero Section Skeleton */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Background Glows */}
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none animate-pulse" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div className="flex-1">
              <div className="h-4 w-24 bg-white/5 rounded-lg mb-3 animate-pulse" />
              <div className="h-12 w-80 bg-white/10 rounded-xl mb-3 animate-pulse" />
              <div className="h-6 w-96 bg-white/5 rounded-lg animate-pulse" />
            </div>
            <div className="h-14 w-60 bg-white/10 rounded-full animate-pulse" />
          </div>

          {/* Stats Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-[#111] border border-white/10 p-6 rounded-3xl animate-pulse">
                <div className="flex items-center gap-3 mb-2">
                  <div className="h-10 w-10 bg-white/5 rounded-lg" />
                  <div className="h-4 w-32 bg-white/5 rounded" />
                </div>
                <div className="h-9 w-20 bg-white/10 rounded mt-2" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Content Section Skeleton */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="h-8 w-48 bg-white/10 rounded-lg mb-6 animate-pulse" />
          <div className="bg-[#111] border border-white/10 rounded-3xl p-10 min-h-[300px] flex items-center justify-center">
            <div className="text-center">
              <div className="h-16 w-16 bg-white/5 rounded-full mx-auto mb-4 animate-pulse" />
              <div className="h-6 w-48 bg-white/5 rounded-lg mx-auto mb-2 animate-pulse" />
              <div className="h-4 w-64 bg-white/5 rounded mx-auto animate-pulse" />
            </div>
          </div>
        </div>
        <div className="space-y-6">
          <div className="bg-[#111] border border-white/10 rounded-3xl p-6 h-64 animate-pulse" />
        </div>
      </div>
    </div>
  );
}

// --- HELPER FUNCTIONS ---
const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
};

// --- TYPES ---
interface UserStats {
  interviewsTaken: number;
  averageScore: number;
  hoursPracticed: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  plan?: string;
  isPro?: boolean;
  createdAt: string;
}

// --- DATA FETCHING ---
async function getUserStats(userId: string): Promise<UserStats> {
  try {
    const interviewsSnapshot = await db
      .collection("interviews")
      .where("userId", "==", userId)
      .count()
      .get();

    return {
      interviewsTaken: interviewsSnapshot.data().count || 0,
      averageScore: 0,
      hoursPracticed: 0
    };
  } catch (error) {
    console.error("Error fetching user stats:", error);
    return {
      interviewsTaken: 0,
      averageScore: 0,
      hoursPracticed: 0
    };
  }
}

// --- STATS CARD COMPONENT ---
interface StatCardProps {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  iconBgColor: string;
  iconColor: string;
}

function StatCard({ icon, label, value, iconBgColor, iconColor }: StatCardProps) {
  return (
    <div className="bg-[#111] border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-white/5">
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 ${iconBgColor} ${iconColor} rounded-lg`}>
          {icon}
        </div>
        <span className="text-gray-400 font-medium">{label}</span>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}

// --- MAIN CONTENT COMPONENT ---
// ... imports and helper functions remain the same ...

// --- MAIN CONTENT COMPONENT ---
async function DashboardContent() {
  // FIX: Explicitly tell TypeScript that 'user' matches our 'User' interface
  const user = (await getCurrentUser()) as User | null;

  if (!user) {
    redirect("/sign-in");
  }

  const stats = await getUserStats(user.id);

  // Now TypeScript knows 'plan' and 'isPro' are valid properties
  const isPro = user.plan === "pro" || user.isPro === true;

  return (
    // ... rest of your JSX remains exactly the same ...
    <div className="min-h-screen bg-[#0a0a0a] pb-20">
      {/* ... content ... */}
    </div>
  );
}

// ... rest of the file ...

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}