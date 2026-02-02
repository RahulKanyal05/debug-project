"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Agent from "@/components/interview/Agent"; // Ensure this path matches your file structure
import { Loader2 } from "lucide-react";

// Helper to generate context based on topic/level
const getInterviewContext = (topic: string, level: string) => {
  const baseContext = `You are conducting a ${level} level interview for a ${topic} role.`;
  
  // Dynamic starter questions to seed the AI's context
  let starterQuestions = [
    `Tell me about your experience with ${topic}.`,
    `What is the most challenging problem you've solved using ${topic}?`,
  ];

  if (topic.toLowerCase().includes("react")) {
    starterQuestions.push("Explain the Virtual DOM and how it handles updates.");
    if (level === "Senior") starterQuestions.push("How would you optimize a React app that is suffering from re-render issues?");
  } else if (topic.toLowerCase().includes("node")) {
    starterQuestions.push("How does the Event Loop work in Node.js?");
    if (level === "Senior") starterQuestions.push("Discuss strategies for scaling a Node.js microservices architecture.");
  } else if (topic.toLowerCase().includes("system")) {
    starterQuestions.push("Design a URL shortening service like Bit.ly.");
    starterQuestions.push("How do you handle database consistency in a distributed system?");
  }

  return starterQuestions;
};

export default function InterviewRoom({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const [ready, setReady] = useState(false);

  // Extract data from URL
  const topic = searchParams.get("topic") || "General Software Engineering";
  const level = searchParams.get("level") || "Mid-Level";
  
  // Generate the questions for the AI
  const questions = getInterviewContext(topic, level);

  // Prevent hydration mismatch
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] pt-20 pb-10">
      <div className="container mx-auto max-w-5xl px-4">
        
        {/* Session Header */}
        <div className="mb-8 flex items-center justify-between border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-2 w-2">
                <span className="absolute inline-flex h-2 w-2 animate-ping rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
              </span>
              <h1 className="text-xl font-bold text-white">Live Interview Session</h1>
            </div>
            <p className="mt-1 text-sm text-gray-400">
              Topic: <span className="text-indigo-400">{topic}</span> • Level: <span className="text-indigo-400">{level}</span>
            </p>
          </div>
          <div className="rounded-full bg-white/5 px-4 py-1.5 text-xs font-mono text-gray-400">
            ID: {params.id}
          </div>
        </div>

        {/* The AI Agent Component */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-[#111] shadow-2xl">
          <Agent 
            userName="Candidate" // You can fetch real name from Auth context if needed
            userId="user_123"    // Replace with actual user ID
            interviewId={params.id}
            type="feedback"      // "feedback" mode tells Agent to save the transcript
            questions={questions} // We pass the generated questions here
          />
        </div>

        {/* Instructions Footer */}
        <div className="mt-8 grid gap-4 text-center sm:grid-cols-3">
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Microphone</p>
            <p className="font-medium text-gray-300">Allow Access</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Speaking</p>
            <p className="font-medium text-gray-300">Speak Clearly</p>
          </div>
          <div className="rounded-xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Ending</p>
            <p className="font-medium text-gray-300">Click End to Save</p>
          </div>
        </div>
      </div>
    </div>
  );
}