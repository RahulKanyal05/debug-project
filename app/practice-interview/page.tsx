"use client";

import { useState, useRef, useEffect } from "react";
import {
  UploadCloud,
  FileText,
  CheckCircle,
  Mic,
  Square,
  Download,
  Loader2,
  AlertCircle
} from "lucide-react";

// IMPORT THE NEW PDF GENERATOR
import { generatePDF } from "@/lib/generatePDF";

// --- Types ---
type InterviewState = "upload" | "analyzing" | "interview" | "feedback";

type QnA = {
  question: string;
  userAnswer: string;
  feedback?: {
    grammarFix: string;
    betterAnswer: string;
    score: number;
  };
};

export default function PracticeInterview() {
  // --- State ---
  const [difficulty, setDifficulty] = useState("Mid-Level");
  const [questions, setQuestions] = useState<string[]>([]);
  const [step, setStep] = useState<InterviewState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");

  // Audio State
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [interimTranscript, setInterimTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Interview Logic
  const [qnaHistory, setQnaHistory] = useState<QnA[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  // Refs
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  // --- 1. Setup Web Speech API ---
  useEffect(() => {
    if (typeof window !== "undefined") {
      synthRef.current = window.speechSynthesis;
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = "en-US";

        recognition.onresult = (event: any) => {
          let interim = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              setTranscript((prev) => prev + event.results[i][0].transcript + " ");
            } else {
              interim += event.results[i][0].transcript;
            }
          }
          setInterimTranscript(interim);
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // --- 2. Handlers ---

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) setFile(e.target.files[0]);
  };

  const startAnalysis = async () => {
    if (!file || !role) return;
    setStep("analyzing");

    try {
      const formData = new FormData();
      formData.append("action", "generate_questions");
      formData.append("file", file);
      formData.append("role", role);
      formData.append("difficulty", difficulty);

      const res = await fetch("/api/ai-interview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.questions) {
        throw new Error(data.details || data.error || "Failed to generate questions");
      }

      setQuestions(data.questions);
      setStep("interview");

      // Start Session
      setCurrentQuestionIndex(0);
      setTimeout(() => speak(data.questions[0]), 500);

    } catch (error) {
      console.error(error);
      alert("Error reading resume. Please try again.");
      setStep("upload");
    }
  };

  const speak = (text: string) => {
    if (synthRef.current) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      synthRef.current.speak(utterance);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
    } else {
      setTranscript("");
      recognitionRef.current?.start();
      setIsRecording(true);
    }
  };

  const submitAnswer = async () => {
    recognitionRef.current?.stop();
    setIsRecording(false);

    // 1. Capture Answer
    const finalAnswer = transcript + interimTranscript;
    const currentQ = questions[currentQuestionIndex];
    const historyIndex = qnaHistory.length;

    // 2. UI: Add Pending Entry
    setQnaHistory((prev) => [...prev, {
      question: currentQ,
      userAnswer: finalAnswer || "No answer provided.",
      feedback: undefined
    }]);

    setTranscript("");
    setInterimTranscript("");

    // 3. Move Next
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => speak(questions[nextIndex]), 500);
    } else {
      setStep("feedback");
    }

    // 4. Background Analysis
    (async () => {
      try {
        const formData = new FormData();
        formData.append("action", "analyze_answer");
        formData.append("question", currentQ);
        formData.append("answer", finalAnswer);

        const response = await fetch("/api/ai-interview", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error(`Server Error`);
        }

        const result = await response.json();
        const feedback = result.feedback;

        // Update History with AI Feedback
        setQnaHistory((prev) => {
          const newHistory = [...prev];
          if (newHistory[historyIndex]) {
            newHistory[historyIndex] = { ...newHistory[historyIndex], feedback };
          }
          return newHistory;
        });

      } catch (e: any) {
        console.error("AI Error:", e);
        // Fallback for UI if AI fails
        setQnaHistory((prev) => {
          const newHistory = [...prev];
          if (newHistory[historyIndex]) {
            newHistory[historyIndex] = {
              ...newHistory[historyIndex],
              feedback: { grammarFix: "Error connecting to AI", betterAnswer: "Could not generate feedback.", score: 0 }
            };
          }
          return newHistory;
        });
      }
    })();
  };

  // --- 3. PDF Generator Function ---
  const downloadReport = () => {
    // Calculate final score
    const avgScore = qnaHistory.length > 0
      ? Math.round(qnaHistory.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / qnaHistory.length)
      : 0;

    // Call the utility function
    generatePDF(role, qnaHistory, avgScore);
  };

  // --- RENDER ---

  // 1. Upload View
  if (step === "upload") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center p-4">
        <div className="w-full max-w-4xl grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-5xl font-bold text-white mb-6">
              AI Interview <span className="text-indigo-400">Simulator</span>
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Upload your CV. We will generate specific questions, record your answers, and provide a downloadable PDF report with grammar fixes.
            </p>
          </div>
          <div className="bg-[#111] border border-white/10 rounded-3xl p-8">
            <h2 className="text-xl font-semibold text-white mb-6">Setup Session</h2>

            {/* Resume Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Upload Resume</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <FileText className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">{file ? file.name : "Drop PDF here"}</span>
              </div>
            </div>

            {/* Role Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Target Role</label>
              <select
                className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-indigo-500"
                onChange={(e) => setRole(e.target.value)}
                value={role}
              >
                <option value="">Select Role</option>
                <option value="Software Engineer">Software Engineer</option>
                <option value="Product Manager">Product Manager</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="HR Manager">HR Manager</option>
              </select>
            </div>

            {/* Difficulty Selector */}
            <div className="mb-8">
              <label className="block text-sm font-medium text-gray-400 mb-2">Difficulty</label>
              <div className="grid grid-cols-3 gap-2">
                {["Junior", "Mid-Level", "Senior"].map((level) => (
                  <button
                    key={level}
                    onClick={() => setDifficulty(level)}
                    className={`py-3 rounded-xl border text-sm font-medium transition-all ${difficulty === level
                      ? "bg-indigo-600 border-indigo-500 text-white"
                      : "bg-black border-white/10 text-gray-400 hover:bg-white/5"
                      }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <button
              onClick={startAnalysis}
              disabled={!file || !role}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl disabled:opacity-50 transition-all"
            >
              Start Interview
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. Analyzing View
  if (step === "analyzing") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center">
        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mb-4" />
        <h2 className="text-xl text-white">Analyzing Resume...</h2>
      </div>
    );
  }

  // 3. Interview View
  if (step === "interview") {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col p-4">
        <div className="flex-1 container mx-auto max-w-2xl flex flex-col justify-center">
          {/* Question Card */}
          <div className="mb-8">
            <span className="text-indigo-400 font-mono text-sm">Question {currentQuestionIndex + 1} of {questions.length}</span>
            <h2 className="text-3xl font-bold text-white mt-2">{questions[currentQuestionIndex]}</h2>
          </div>

          {/* Answer Area */}
          <div className="bg-[#111] border border-white/10 rounded-2xl p-6 min-h-[200px] mb-8 relative">
            {transcript || interimTranscript ? (
              <p className="text-white text-lg">{transcript} <span className="text-gray-500">{interimTranscript}</span></p>
            ) : (
              <p className="text-gray-600 italic">Listening... (Click mic to start)</p>
            )}
            {isSpeaking && <div className="absolute top-4 right-4 h-3 w-3 bg-indigo-500 rounded-full animate-ping" />}
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            <button
              onClick={toggleRecording}
              className={`h-16 w-16 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-500 scale-110 shadow-red-500/50 shadow-lg' : 'bg-white hover:bg-gray-200'}`}
            >
              {isRecording ? <Square className="h-6 w-6 text-white fill-current" /> : <Mic className="h-8 w-8 text-black" />}
            </button>
            <button
              onClick={submitAnswer}
              disabled={!transcript && !interimTranscript}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full disabled:opacity-50"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Report View (Feedback)
  if (step === "feedback") {
    const avgScore = qnaHistory.length > 0
      ? Math.round(qnaHistory.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / qnaHistory.length)
      : 0;

    // Safety Helper for Text Rendering
    const renderSafeText = (text: any) => {
      if (!text) return "No feedback provided.";
      if (typeof text === "string") return text;
      if (typeof text === "object") {
        return text.betterAnswer || text.improved_answer || text.STAR || JSON.stringify(text);
      }
      return String(text);
    };

    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analysis Report</h1>
              <p className="text-gray-400">Role: {role}</p>
            </div>

            {/* DOWNLOAD BUTTON */}
            <button
              onClick={downloadReport}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all"
            >
              <Download className="h-5 w-5" /> Download PDF Report
            </button>
          </div>

          {/* Score Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Overall Score</div>
              <div className={`text-4xl font-bold ${avgScore > 70 ? 'text-green-400' : 'text-yellow-400'}`}>{avgScore}/100</div>
            </div>
            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Grammar Accuracy</div>
              <div className="text-4xl font-bold text-indigo-400">High</div>
            </div>
            <div className="bg-[#111] border border-white/10 p-6 rounded-2xl">
              <div className="text-gray-400 text-sm mb-1">Questions Answered</div>
              <div className="text-4xl font-bold text-white">{qnaHistory.length}</div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-6">
            {qnaHistory.map((item, idx) => (
              <div key={idx} className="bg-[#111] border border-white/10 rounded-2xl p-6">

                {/* Question Title */}
                <h3 className="text-lg font-semibold text-white mb-2">Q{idx + 1}: {item.question}</h3>

                {/* User Answer */}
                <div className="mb-4 bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-gray-200">{item.userAnswer}</p>
                </div>

                {/* AI Feedback Section */}
                {!item.feedback ? (
                  // Loading State
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is grading this answer...</span>
                  </div>
                ) : (
                  // Result State
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Grammar Box */}
                    <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2 text-red-400 font-medium">
                        <AlertCircle className="h-4 w-4" /> Grammar / Issues
                      </div>
                      <p className="text-sm text-gray-300">
                        {renderSafeText(item.feedback?.grammarFix)}
                      </p>
                    </div>

                    {/* Improved Answer Box */}
                    <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                      <div className="flex items-center gap-2 mb-2 text-green-400 font-medium">
                        <CheckCircle className="h-4 w-4" /> Improved Answer
                      </div>
                      <p className="text-sm text-gray-300">
                        {renderSafeText(item.feedback?.betterAnswer)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}