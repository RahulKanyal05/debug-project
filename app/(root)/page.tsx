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
  Target,
  AlertTriangle
} from "lucide-react";
import { Suspense } from "react";

// --- LOADING COMPONENT (Brighter for Visibility) ---
function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20 text-white p-10">
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        {/* Visible Loading Indicator */}
        <div className="flex items-center gap-4 text-indigo-400">
          <div className="h-6 w-6 border-4 border-current border-t-transparent rounded-full animate-spin" />
          <h2 className="text-xl font-bold">Loading your dashboard...</h2>
        </div>

        {/* Hero Skeleton */}
        <div className="h-40 w-full bg-gray-800 rounded-3xl" />

        {/* Stats Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="h-32 bg-gray-800 rounded-3xl" />
          <div className="h-32 bg-gray-800 rounded-3xl" />
          <div className="h-32 bg-gray-800 rounded-3xl" />
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

// --- DATA FETCHING (Safe Mode) ---
async function getUserStats(userId: string): Promise<UserStats> {
  // Return safe default if ID is missing
  if (!userId) return { interviewsTaken: 0, averageScore: 0, hoursPracticed: 0 };

  try {
    // Timeout Promise to prevent infinite hanging
    const timeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error("Firebase Timeout")), 5000)
    );

    // Actual Data Fetch
    const fetchStats = async () => {
      // NOTE: .count() requires newer firebase-admin. If this fails, we fall back.
      const snapshot = await db.collection("interviews").where("userId", "==", userId).get();
      return {
        interviewsTaken: snapshot.size,
        averageScore: 0,
        hoursPracticed: 0
      };
    };

    // Race the fetch against the timeout
    return await Promise.race([fetchStats(), timeout]) as UserStats;

  } catch (error) {
    console.error("⚠️ Stats Fetch Warning:", error);
    // Return zeros instead of crashing the page
    return { interviewsTaken: 0, averageScore: 0, hoursPracticed: 0 };
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
    <div className="bg-[#111] border border-white/10 p-6 rounded-3xl hover:border-white/20 transition-all duration-300">
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
async function DashboardContent() {
  console.log("🔍 Dashboard: Fetching User...");
  const user = (await getCurrentUser()) as User | null;

  if (!user) {
    console.log("⚠️ Dashboard: No User Found, Redirecting...");
    redirect("/sign-in");
  }

  console.log("✅ Dashboard: User Found, Fetching Stats...");
  const stats = await getUserStats(user.id);
  const isPro = user.plan === "pro" || user.isPro === true;

  return (
    <div className="min-h-screen bg-[#0a0a0a] pb-20">

      {/* --- HERO SECTION --- */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-purple-600/10 rounded-full blur-[100px] pointer-events-none" />

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-gray-400 text-sm font-medium uppercase tracking-wider">
                  Dashboard
                </span>
                {isPro && (
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Crown className="h-3 w-3" /> PRO
                  </span>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                {getGreeting()}, <span className="text-indigo-400">{user.name.split(" ")[0]}</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-xl">
                Ready to master your next interview? You have completed <span className="text-white font-bold">{stats.interviewsTaken}</span> sessions.
              </p>
            </div>

            <Link href="/practice-interview">
              <button className="bg-white text-black hover:bg-gray-200 transition-colors font-bold text-lg px-8 py-4 rounded-full flex items-center gap-2 shadow-xl shadow-white/5">
                <Plus className="h-5 w-5" /> Start New Interview
              </button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <StatCard
              icon={<FileText className="h-5 w-5" />}
              label="Total Interviews"
              value={stats.interviewsTaken}
              iconBgColor="bg-indigo-500/20"
              iconColor="text-indigo-400"
            />
            <StatCard
              icon={<Target className="h-5 w-5" />}
              label="Average Score"
              value={stats.averageScore > 0 ? `${stats.averageScore}%` : "-"}
              iconBgColor="bg-green-500/20"
              iconColor="text-green-400"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="Hours Practiced"
              value={`${stats.hoursPracticed}h`}
              iconBgColor="bg-purple-500/20"
              iconColor="text-purple-400"
            />
          </div>
        </div>
      </section>

      {/* --- CONTENT SECTION --- */}
      <div className="max-w-6xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" /> Recent Activity
          </h2>

          <div className="bg-[#111] border border-white/10 rounded-3xl p-10 text-center flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-16 w-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-8 w-8 text-gray-600" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No interviews yet</h3>
            <p className="text-gray-400 max-w-sm mb-6">
              Your detailed reports and performance analytics will appear here once you complete your first AI interview.
            </p>
            <Link
              href="/practice-interview"
              className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              Start practicing now <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>

        {/* Right Column: Upgrade / Profile */}
        <div className="space-y-6">

          {!isPro && (
            <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 border border-indigo-500/30 rounded-3xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-20 group-hover:opacity-30 transition-opacity">
                <Zap className="h-24 w-24 text-white" />
              </div>

              <div className="relative z-10">
                <h3 className="text-xl font-bold text-white mb-2">Upgrade to Pro</h3>
                <p className="text-indigo-200 text-sm mb-6">
                  Get unlimited AI interviews, detailed PDF reports, and advanced analytics.
                </p>
                <Link href="/services">
                  <button className="w-full bg-white text-indigo-900 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-colors">
                    View Plans
                  </button>
                </Link>
              </div>
            </div>
          )}

          <div className="bg-[#111] border border-white/10 rounded-3xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Your Profile</h3>
            <div className="flex items-center gap-4 mb-6">
              <div className="h-12 w-12 bg-indigo-600 rounded-full flex items-center justify-center text-xl font-bold text-white">
                {user.name.charAt(0)}
              </div>
              <div>
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-500 text-sm truncate max-w-[150px]">{user.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Account Type</span>
                <span className="text-white font-medium capitalize">{isPro ? "Pro Member" : "Starter Plan"}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Joined</span>
                <span className="text-white font-medium">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

// --- MAIN PAGE COMPONENT ---
export default function Home() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  );
}