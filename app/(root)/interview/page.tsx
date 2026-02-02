"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Code2, 
  Database, 
  Globe, 
  Cpu, 
  BrainCircuit, 
  ArrowRight,
  Sparkles
} from "lucide-react";
import { cn } from "@/lib/utils"; // Ensure you have this helper or remove 'cn' and use template strings

const TOPICS = [
  { id: "react", name: "React Developer", icon: Code2, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
  { id: "node", name: "Node.js Backend", icon: Database, color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/20" },
  { id: "system-design", name: "System Design", icon: Cpu, color: "text-purple-400", bg: "bg-purple-400/10", border: "border-purple-400/20" },
  { id: "fullstack", name: "Full Stack Web", icon: Globe, color: "text-orange-400", bg: "bg-orange-400/10", border: "border-orange-400/20" },
  { id: "behavioral", name: "HR / Behavioral", icon: BrainCircuit, color: "text-pink-400", bg: "bg-pink-400/10", border: "border-pink-400/20" },
];

const DIFFICULTIES = ["Junior", "Mid-Level", "Senior", "Lead"];

export default function InterviewSetupPage() {
  const router = useRouter();
  const [selectedTopic, setSelectedTopic] = useState<string>("");
  const [customTopic, setCustomTopic] = useState("");
  const [difficulty, setDifficulty] = useState("Mid-Level");
  const [loading, setLoading] = useState(false);

  const handleStart = () => {
    setLoading(true);
    
    // 1. Determine the final topic
    const finalTopic = selectedTopic === "custom" ? customTopic : TOPICS.find(t => t.id === selectedTopic)?.name;
    
    if (!finalTopic) return;

    // 2. Generate a random ID for the session
    const sessionId = Math.random().toString(36).substring(7);

    // 3. Create the configuration object (In a real app, save this to DB)
    // For now, we will pass it via URL params or just rely on the ID
    const queryParams = new URLSearchParams({
      topic: finalTopic,
      level: difficulty
    }).toString();

    // 4. Redirect to the room
    router.push(`/interview/${sessionId}?${queryParams}`);
  };

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10 text-center">
        <h1 className="mb-4 text-4xl font-bold text-white">Configure Your Session</h1>
        <p className="text-gray-400">Choose a focus area and difficulty level for your AI interviewer.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        {/* Left Col: Topic Selection */}
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-white">1. Choose Topic</h2>
          
          <div className="grid gap-3">
            {TOPICS.map((topic) => {
              const Icon = topic.icon;
              const isSelected = selectedTopic === topic.id;
              
              return (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic.id)}
                  className={cn(
                    "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                    isSelected 
                      ? `${topic.bg} ${topic.border} ring-1 ring-white/20` 
                      : "border-white/5 bg-[#111] hover:bg-white/5"
                  )}
                >
                  <div className={`rounded-lg p-2 ${topic.bg} ${topic.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${isSelected ? "text-white" : "text-gray-400"}`}>
                    {topic.name}
                  </span>
                  {isSelected && <div className="ml-auto h-2 w-2 rounded-full bg-white animate-pulse" />}
                </button>
              );
            })}

            {/* Custom Topic Input */}
            <button
              onClick={() => setSelectedTopic("custom")}
              className={cn(
                "flex items-center gap-4 rounded-xl border p-4 text-left transition-all",
                selectedTopic === "custom"
                  ? "bg-indigo-500/10 border-indigo-500/20 ring-1 ring-white/20"
                  : "border-white/5 bg-[#111] hover:bg-white/5"
              )}
            >
              <div className="rounded-lg p-2 bg-indigo-500/10 text-indigo-400">
                <Sparkles className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <span className={`block font-medium ${selectedTopic === "custom" ? "text-white" : "text-gray-400"}`}>
                  Custom Role
                </span>
                {selectedTopic === "custom" && (
                  <input 
                    autoFocus
                    type="text"
                    placeholder="e.g. Kotlin Developer..."
                    className="mt-2 w-full bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none"
                    value={customTopic}
                    onChange={(e) => setCustomTopic(e.target.value)}
                  />
                )}
              </div>
            </button>
          </div>
        </div>

        {/* Right Col: Difficulty & Launch */}
        <div className="flex flex-col gap-8">
          {/* Difficulty Selector */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold text-white">2. Difficulty Level</h2>
            <div className="grid grid-cols-2 gap-3">
              {DIFFICULTIES.map((level) => (
                <button
                  key={level}
                  onClick={() => setDifficulty(level)}
                  className={cn(
                    "rounded-xl border px-4 py-3 text-sm font-medium transition-all",
                    difficulty === level
                      ? "border-white/20 bg-white text-black"
                      : "border-white/5 bg-[#111] text-gray-400 hover:bg-white/5"
                  )}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Info Card */}
          <div className="mt-auto rounded-2xl border border-yellow-500/10 bg-yellow-500/5 p-6">
            <h4 className="mb-2 flex items-center gap-2 font-semibold text-yellow-200">
              <Sparkles className="h-4 w-4" />
              Pro Tip
            </h4>
            <p className="text-sm text-yellow-200/60">
              The AI will adapt to your answers. If you choose "{difficulty}", expect questions about 
              {selectedTopic === 'system-design' ? ' scalability and architecture' : ' optimization and edge cases'}.
            </p>
          </div>

          {/* Start Button */}
          <button
            onClick={handleStart}
            disabled={!selectedTopic || (selectedTopic === "custom" && !customTopic) || loading}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-white py-4 text-lg font-bold text-black transition hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              "Setting up Room..."
            ) : (
              <>
                Start Interview <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}