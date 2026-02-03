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
  Cpu,
  Briefcase,
  AlertCircle
} from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

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

// --- Mock Question DB ---
const MOCK_QUESTIONS = {
  hr: [
    "Tell me about yourself and your background.",
    "Describe a conflict you faced at work and how you handled it.",
    "Where do you see yourself in 5 years?"
  ],
  tech: [
    "Explain the difference between a Process and a Thread.",
    "How does the Event Loop work in JavaScript?",
    "What are the ACID properties in databases?"
  ]
};

export default function PracticeInterview() {
  // State
  const [difficulty, setDifficulty] = useState("Mid-Level"); // Default
  const [questions, setQuestions] = useState<string[]>([]);
  const [step, setStep] = useState<InterviewState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");

  // Interview Logic
  const [qnaHistory, setQnaHistory] = useState<QnA[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Web Speech Refs
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
          let interimTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              setTranscript((prev) => prev + event.results[i][0].transcript + " ");
            } else {
              interimTranscript += event.results[i][0].transcript;
            }
          }
        };
        recognitionRef.current = recognition;
      }
    }
  }, []);

  // --- 2. Core Logic ---

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
      // Add the difficulty level here
      formData.append("difficulty", difficulty);

      const res = await fetch("/api/ai-interview", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!data.questions) {
        // Log the actual error from backend
        console.error("Backend Error Details:", data);
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

  const askQuestion = (index: number) => {
    //const questions = role.includes("Engineer") ? MOCK_QUESTIONS.tech : MOCK_QUESTIONS.hr;
    const question = questions[index];
    speak(question);
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

    // 4. Background Analysis (WITH DEBUG ALERT)
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

        // Check if server crashed
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Server Error (${response.status}): ${errorText}`);
        }

        const result = await response.json();
        const feedback = result.feedback;

        // Update History
        setQnaHistory((prev) => {
          const newHistory = [...prev];
          if (newHistory[historyIndex]) {
            newHistory[historyIndex] = { ...newHistory[historyIndex], feedback };
          }
          return newHistory;
        });

      } catch (e: any) {
        console.error("DEBUG ERROR:", e);
        // THIS WILL TELL YOU EXACTLY WHAT IS WRONG:
        alert(`AI Failed: ${e.message}`);

        // Fallback
        setQnaHistory((prev) => {
          const newHistory = [...prev];
          if (newHistory[historyIndex]) {
            newHistory[historyIndex] = {
              ...newHistory[historyIndex],
              feedback: { grammarFix: "Error", betterAnswer: "Connection Failed", score: 0 }
            };
          }
          return newHistory;
        });
      }
    })();
  };
  // --- 3. Mock Analysis Engine ---
  const analyzeAnswer = (question: string, answer: string) => {
    // This simulates AI logic. In real production, send 'answer' to GPT-4.
    return {
      grammarFix: answer.length < 10 ? "Answer too short to analyze." : `Corrected: "${answer.charAt(0).toUpperCase() + answer.slice(1)}." (Ensure proper sentence structure).`,
      betterAnswer: "Use the STAR method: Situation, Task, Action, Result. Be more specific about your role.",
      score: answer.length > 20 ? 85 : 40
    };
  };

  // --- 4. PDF Generator ---
  const downloadReport = () => {
    const doc = new jsPDF();

    // Title
    doc.setFontSize(20);
    doc.setTextColor(79, 70, 229); // Indigo color
    doc.text("Interview Performance Report", 14, 22);

    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Role: ${role} | Date: ${new Date().toLocaleDateString()}`, 14, 30);

    // Stats
    const avgScore = Math.round(qnaHistory.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / qnaHistory.length);
    doc.text(`Overall Score: ${avgScore}/100`, 14, 38);

    // Table Data Generation
    const tableData = qnaHistory.map((item, index) => [
      `Q${index + 1}: ${item.question}`,
      `Your Answer: "${item.userAnswer}"\n\nGrammar Check: ${item.feedback?.grammarFix}\n\n💡 Improvement: ${item.feedback?.betterAnswer}`
    ]);

    // Generate Table
    autoTable(doc, {
      startY: 45,
      head: [['Question', 'Analysis & Feedback']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229] },
      styles: { fontSize: 10, cellPadding: 6 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 'auto' }
      }
    });

    doc.save(`${role.replace(" ", "_")}_Report.pdf`);
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

            {/* 1. Resume Upload */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Upload Resume</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <FileText className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">{file ? file.name : "Drop PDF here"}</span>
              </div>
            </div>

            {/* 2. Role Selector (Closed correctly) */}
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

            {/* 3. Difficulty Selector (Moved OUTSIDE the select) */}
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

            {/* 4. Start Button */}
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
    //const questions = role.includes("Engineer") ? MOCK_QUESTIONS.tech : MOCK_QUESTIONS.hr;
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
            {transcript ? (
              <p className="text-white text-lg">{transcript}</p>
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
              disabled={!transcript}
              className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-8 py-4 rounded-full disabled:opacity-50"
            >
              Next Question
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 4. Report View
  // ... (inside your component)

  // 4. Report View (Crash-Proof Version)
  if (step === "feedback") {
    const avgScore = qnaHistory.length > 0
      ? Math.round(qnaHistory.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / qnaHistory.length)
      : 0;

    // Safety Helper
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
            {/* Only show download if you have the function, otherwise remove button */}
            <button className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-xl font-bold transition-all">
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

                {/* 1. Question Title */}
                <h3 className="text-lg font-semibold text-white mb-2">Q{idx + 1}: {item.question}</h3>

                {/* 2. User Answer (Always Visible) */}
                <div className="mb-4 bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-gray-200">{item.userAnswer}</p>
                </div>

                {/* 3. LOGIC BRANCH: Loading vs. Results */}
                {!item.feedback ? (
                  // STATE A: Loading
                  <div className="flex items-center gap-2 text-indigo-400 animate-pulse p-4 bg-indigo-500/10 rounded-xl border border-indigo-500/20">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is grading this answer...</span>
                  </div>
                ) : (
                  // STATE B: Results (Grid)
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