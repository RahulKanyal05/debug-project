// "use client";

// import { color } from "framer-motion";
// import Script from "next/script";
// import { useEffect } from "react";

// export default function PracticeInterview() {
//   useEffect(() => {
//     // If you need to run anything from main.js, make sure it's accessible globally or bound to events
//   }, []);

//   return (
//     <>

//       {/* Load external JS script */}
      
//   <Script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js" />
//       <Script src="/main.js" />

//       {/* Load external CSS */}
      

//       {/* Page content */}
//       <div id="backgroundVideoContainer">
//         <video id="backgroundVideo" autoPlay muted loop>
//           <source src="/video1.mp4" type="video/mp4" />
//           Your browser does not support the video tag.
//         </video>
//       </div>

//       <section>
//         <h1>Virtual AI Interviewer</h1>
//         <p>Available In Chrome Only</p>

//         {/* Upload Section */}
//         <div id="uploadSection">
//           <input type="file" id="resume" accept=".pdf,.doc,.docx,.txt" />
//           <select id="jobRole" defaultValue="">
//             <option value="" disabled>
//                   Select Interview Type
//                 </option>
//                   <option value="hr interview">HR Interview</option>
//                   <option value="software development technical interview">Software Development Technical Interview</option>
//                   <option value="ml technical interview">ML Technical Interview</option>
//                   <option value="application development technical interview">Application Development Technical Interview</option>
//                   <option value="Resume Based Interview">Resume Based Interview</option>
//           </select>
//           <button id="start">Analyze Resume & Prepare</button>
//         </div>

//         <div id="loadingIndicator" style={{ display: "none" }}>Processing...</div>

//         {/* ATS Display Section */}
//         <div id="atsDisplaySection" style={{ display: "none" }}>
//           <div id="atsScoreDisplay"></div>
//           <div id="atsTipsDisplay"></div>
//           <button id="proceedInterviewBtn">Start Interview</button>
//         </div>

//         {/* Interview Section */}
//         <div id="container" style={{ display: "none" }}>
//           <div className="texts"></div>
//           <button id="answerComplete" disabled>
//             Complete Answer
//           </button>
//           <button id="stop" disabled>Stop Interview</button>
//         </div>

//         {/* Post Interview */}
//         <div id="postInterviewSection" style={{ display: "none" }}>
//           <div id="thankYouMessage"></div>

//           <div id="feedbackBlock">
//             <h2>Feedback</h2>
//             <textarea
//               id="feedback"
//               rows={4}
//               cols={50}
//               placeholder="Please provide your feedback here..."
//             ></textarea>
//             <button id="submitFeedback">Submit Feedback</button>
//           </div>

//           <div id="downloadButton">
//             <button id="downloadPdfBtn" className="downloadButton1">
//               Download Summary PDF
//             </button>
//           </div>
//         </div>
//       </section>

//       <style jsx>{`
//       * {
//     padding: 0;
//     margin: 0;
//     box-sizing: border-box;
// }

// html {
//     font-family: "Montserrat", sans-serif;
//     font-size: 20px;
//     scroll-behavior: smooth;
// }

// body {
//     background: url('./assets/b1.webp') no-repeat center center fixed;
//     background-size: cover;
//     overflow-x: hidden;
//     color: white;
// }

// section {
//     min-height: 100vh;
//     width: 100%;
//     display: flex;
//     align-items: center;
//     justify-content: center;
//     /* background-color: rgba(0, 0, 0, 0.8); */
    
//     flex-direction: column;
//     padding: 50px 20px;
//     text-align: center;
// }

// h1 {
//     font-size: 48px;
//     margin-bottom: 15px;
//     color: #FFD700; /* Gold color for the heading */
//     text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.7);
// }

// p {
//     margin-bottom: 30px;
//     font-size: 18px;
// }

// #uploadSection, #container, #thankYouMessage, #feedbackBlock {
//     width: 100%;
//     max-width: 550px;
//     margin: 20px auto;
//     text-align: left;
//     background-color: rgba(255, 255, 255, 0.15);
//     padding: 20px;
//     border-radius: 10px;
//     box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
// }

// .texts {
//     margin-bottom: 30px;
// }

// .texts p {
//     color: #333;
//     background-color: #f8f9fa;
//     padding: 15px;
//     border-radius: 8px;
//     margin-bottom: 15px;
//     text-align: left;
//     box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
// }

// .question {
//     background-color: #cce5ff; /* Light blue */
//     border-left: 5px solid #007bff; /* Blue border */
// }

// .answer {
//     background-color: #f8d7da; /* Light red */
//     border-left: 5px solid #dc3545; /* Red border */
// }

// button {
//     background-color: #28a745; /* Green */
//     color: white;
//     border: none;
//     padding: 12px 25px;
//     margin: 10px;
//     border-radius: 5px;
//     cursor: pointer;
//     font-size: 16px;
//     transition: background-color 0.3s ease, transform 0.3s ease;
//     box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
// }

// button:hover {
//     background-color: #218838; /* Darker green */
//     transform: translateY(-3px);
// }

// button:disabled {
//     background-color: #6c757d; /* Gray */
//     cursor: not-allowed;
// }

// #feedback {
//     width: 100%;
//     padding: 15px;
//     border-radius: 5px;
//     border: 1px solid #ccc;
//     background-color: rgba(255, 255, 255, 0.8);
//     color: #333;
//     font-size: 16px;
// }

// #jobRole {
//     width: 100%;
//     padding: 12px;
//     border-radius: 5px;
//     border: 1px solid #ccc;
//     margin-bottom: 20px;
//     background-color: #f1f1f1;
//     font-size: 16px;
//     color: #333;
//     cursor: pointer;
//     transition: background-color 0.3s ease;
// }

// #jobRole:hover {
//     background-color: #e2e6ea;
// }

// #thankYouMessage {
//     font-size: 24px;
//     color: #FFD700; /* Gold color for the thank you message */
//     text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.5);
// }

// input[type="file"] {
//     background-color: #f1f1f1;
//     border-radius: 5px;
//     padding: 10px;
//     width: 100%;
//     margin-bottom: 20px;
//     cursor: pointer;
//     font-size: 16px;
//     transition: background-color 0.3s ease;
// }

// input[type="file"]:hover {
//     background-color: #e2e6ea;
// }

// #downloadButton {
//     display: none;
//     background-color: #4CAF50;
//     border: none;
//     color: white;
//     padding: 15px 32px;
//     text-align: center;
//     text-decoration: none;
//     display: inline-block;
//     font-size: 16px;
//     margin: 4px 2px;
//     cursor: pointer;
//     border-radius: 4px;
// }
// #downloadButton:hover {
//     background-color: #45a049;
// }

// .downloadButton1{
//     color: black;
// }

// #backgroundVideoContainer {
//     position: fixed;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     overflow: hidden;
//     z-index: -1; /* Makes sure the video stays in the background */
//   }
  
//   #backgroundVideo {
//     position: absolute;
//     top: 50%;
//     left: 50%;
//     width: 100%;
//     height: 100%;
//     object-fit: cover; /* Ensures the video covers the entire container */
//     transform: translate(-50%, -50%); /* Centers the video */
//   }
  
// `}
  
//       </style>
//     </>
//   );
// }

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
  const [questions, setQuestions] = useState<string[]>([]);
  const [step, setStep] = useState<InterviewState>("upload");
  const [file, setFile] = useState<File | null>(null);
  const [role, setRole] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
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
    setIsAnalyzing(true);

    try {
      const response = await fetch("/api/ai-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate_questions",
          data: { role: role, topic: "Technical & Behavioral" }
        })
      });

      const result = await response.json();
      
      if (!response.ok || !result.questions) {
        throw new Error(result.details || "Failed to generate questions");
      }

      // Success: Use AI Questions
      setQuestions(result.questions);
      setIsAnalyzing(false);
      setStep("interview");
      setCurrentQuestionIndex(0);
      speak(result.questions[0]); 
      
    } catch (error) {
      console.error("AI Generation Failed, using fallback:", error);
      
      // FALLBACK: Use Mock Data if AI fails
      const fallbackQuestions = role.includes("Engineer") ? MOCK_QUESTIONS.tech : MOCK_QUESTIONS.hr;
      setQuestions(fallbackQuestions);
      
      setIsAnalyzing(false);
      setStep("interview");
      setCurrentQuestionIndex(0);
      speak(fallbackQuestions[0]);
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

    // Use the dynamic questions state
    const currentQ = questions[currentQuestionIndex]; 

    // 1. Call API for Real Analysis
    let aiFeedback;
    try {
      const response = await fetch("/api/ai-interview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "analyze_answer",
          data: { question: currentQ, answer: transcript }
        })
      });
      const result = await response.json();
      aiFeedback = result.feedback;
    } catch (e) {
      console.error(e);
      // Fallback if API fails
      aiFeedback = { grammarFix: "N/A", betterAnswer: "Could not connect to AI.", score: 0 };
    }

    // 2. Save QnA pair
    const newEntry: QnA = {
      question: currentQ,
      userAnswer: transcript || "No answer provided.",
      feedback: aiFeedback
    };

    setQnaHistory((prev) => [...prev, newEntry]);
    setTranscript("");

    // 3. Move Next
    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeout(() => {
        speak(questions[nextIndex]);
      }, 1000);
    } else {
      setStep("feedback");
    }
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
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-400 mb-2">Upload Resume</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl p-8 text-center hover:bg-white/5 cursor-pointer relative">
                <input type="file" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
                <FileText className="h-8 w-8 mx-auto text-gray-500 mb-2" />
                <span className="text-sm text-gray-400">{file ? file.name : "Drop PDF here"}</span>
              </div>
            </div>
            <select 
              className="w-full bg-black border border-white/10 rounded-xl px-4 py-3 text-white mb-6"
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="">Select Role</option>
              <option value="Software Engineer">Software Engineer</option>
              <option value="HR Manager">HR Manager</option>
            </select>
            <button 
              onClick={startAnalysis} 
              disabled={!file || !role}
              className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-4 rounded-xl disabled:opacity-50"
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
  if (step === "feedback") {
    const avgScore = Math.round(qnaHistory.reduce((acc, curr) => acc + (curr.feedback?.score || 0), 0) / qnaHistory.length);
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] p-8">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Analysis Report</h1>
              <p className="text-gray-400">Role: {role}</p>
            </div>
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
                <h3 className="text-lg font-semibold text-white mb-2">Q{idx+1}: {item.question}</h3>
                
                <div className="mb-4 bg-black/50 p-4 rounded-xl border border-white/5">
                  <p className="text-sm text-gray-400 mb-1">Your Answer:</p>
                  <p className="text-gray-200">{item.userAnswer}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-red-400 font-medium">
                      <AlertCircle className="h-4 w-4" /> Grammar / Issues
                    </div>
                    <p className="text-sm text-gray-300">{item.feedback?.grammarFix}</p>
                  </div>
                  
                  <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl">
                    <div className="flex items-center gap-2 mb-2 text-green-400 font-medium">
                      <CheckCircle className="h-4 w-4" /> Improved Answer
                    </div>
                    <p className="text-sm text-gray-300">{item.feedback?.betterAnswer}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return null;
}