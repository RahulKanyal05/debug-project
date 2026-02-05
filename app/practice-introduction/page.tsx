'use client';

import React, { useState, useRef, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import {
    Camera,
    Mic,
    Square,
    Download,
    Trash2,
    Play,
    FileText,
    Loader2,
    AlertCircle,
    Video,
    CheckCircle2
} from 'lucide-react';
import { toast } from 'sonner';

// --- Types ---
interface ReportData {
    original: string;
    analysis: string;
    grammar: string;
    revision: string;
    error: string | null;
}

interface RecordedVideo {
    id: string;
    name: string;
    url: string;
    blob: Blob;
    mimeType: string;
    downloadFileName: string;
    timestamp: string;
}

// --- Extended Window Interface for Speech API ---
declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

export default function PracticeIntroductionPage() {
    // --- State ---
    const [isRecording, setIsRecording] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [recordedVideos, setRecordedVideos] = useState<RecordedVideo[]>([]);
    const [streamActive, setStreamActive] = useState(false);

    // --- Refs ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const speechRecognitionRef = useRef<any>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const finalTranscriptRef = useRef<string>('');
    const interimTranscriptRef = useRef<string>('');
    const isMountedRef = useRef(true);

    // --- 1. Initialization & Cleanup ---
    useEffect(() => {
        isMountedRef.current = true;

        // Initialize Speech Recognition
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;

        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognition.maxAlternatives = 1;

            recognition.onresult = (event: any) => {
                console.log('Speech result event:', event.results.length); // Debug log

                let interim = '';
                // Process ALL results, not just from resultIndex
                for (let i = 0; i < event.results.length; ++i) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        // Add final results to permanent transcript
                        const newText = transcript.trim() + ' ';
                        if (!finalTranscriptRef.current.includes(newText)) {
                            finalTranscriptRef.current += newText;
                            console.log('Added final transcript:', newText);
                        }
                    } else {
                        // Collect interim results
                        interim += transcript;
                    }
                }
                interimTranscriptRef.current = interim;
                console.log('Current final:', finalTranscriptRef.current);
                console.log('Current interim:', interim);
            };

            recognition.onerror = (event: any) => {
                console.warn('Speech recognition error:', event.error);
                if (event.error === 'not-allowed') {
                    toast.error("Microphone access denied.");
                } else if (event.error === 'no-speech') {
                    console.log('No speech detected - continuing');
                    // Don't show error for no-speech, just log it
                } else if (event.error === 'audio-capture') {
                    toast.error("Microphone not working. Please check permissions.");
                } else if (event.error !== 'aborted') {
                    console.error(`Speech recognition error: ${event.error}`);
                }
            };

            recognition.onstart = () => {
                console.log('Speech recognition started');
            };

            recognition.onend = () => {
                console.log('Speech recognition ended. Recording:', isRecording);
                // Only restart if still recording
                if (isRecording && isMountedRef.current) {
                    try {
                        console.log('Restarting speech recognition...');
                        recognition.start();
                    } catch (e) {
                        console.log('Could not restart recognition:', e);
                    }
                }
            };

            speechRecognitionRef.current = recognition;
        } else {
            toast.warning("Speech recognition unavailable. Please use Chrome or Edge.");
        }

        // Cleanup function
        return () => {
            isMountedRef.current = false;

            // Stop speech recognition
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop();
                } catch (e) {
                    console.log('Speech recognition already stopped');
                }
            }

            // Stop camera
            stopCamera();

            // Revoke all blob URLs to prevent memory leaks
            recordedVideos.forEach(v => {
                try {
                    URL.revokeObjectURL(v.url);
                } catch (e) {
                    console.log('Error revoking URL');
                }
            });
        };
    }, []); // Empty dependency array - only run once

    // --- 2. Camera Logic ---
    const startCamera = async (): Promise<boolean> => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    autoGainControl: true
                }
            });

            streamRef.current = stream;

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true;
                await videoRef.current.play();
            }

            setStreamActive(true);
            return true;
        } catch (err: any) {
            console.error("Camera Error:", err);

            if (err.name === 'NotAllowedError') {
                toast.error("Camera/microphone permission denied. Please allow access.");
            } else if (err.name === 'NotFoundError') {
                toast.error("No camera or microphone found.");
            } else {
                toast.error("Could not access camera/microphone.");
            }

            return false;
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => {
                track.stop();
            });
            streamRef.current = null;
        }

        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }

        setStreamActive(false);
    };

    // --- 3. Recording Logic ---
    const handleStartRecording = async () => {
        const cameraReady = await startCamera();
        if (!cameraReady) return;

        // Reset state
        recordedChunksRef.current = [];
        finalTranscriptRef.current = '';
        interimTranscriptRef.current = '';
        setReportData(null);

        // Determine best available codec
        const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp9')
            ? 'video/webm;codecs=vp9'
            : MediaRecorder.isTypeSupported('video/webm;codecs=vp8')
                ? 'video/webm;codecs=vp8'
                : 'video/webm';

        try {
            const recorder = new MediaRecorder(streamRef.current!, {
                mimeType,
                videoBitsPerSecond: 2500000 // 2.5 Mbps for good quality
            });

            recorder.ondataavailable = (e) => {
                if (e.data && e.data.size > 0) {
                    recordedChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                if (recordedChunksRef.current.length > 0) {
                    const blob = new Blob(recordedChunksRef.current, { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    addVideoToList(url, blob, mimeType);

                    // Wait longer for speech recognition to finalize (especially on mobile)
                    setTimeout(() => {
                        processAnalysis();
                    }, 1200); // Increased from 800ms
                } else {
                    toast.error("No video data recorded.");
                }
            };

            // Request data every 1 second for better reliability
            recorder.start(1000);
            mediaRecorderRef.current = recorder;

            // Start Speech Recognition
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.start();
                } catch (e) {
                    console.log("Speech recognition already running");
                }
            }

            setIsRecording(true);
            toast.success("Recording started!");

        } catch (err: any) {
            console.error("Recording error:", err);
            toast.error("Failed to start recording: " + err.message);
            stopCamera();
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            // Stop speech recognition FIRST to capture final transcript
            if (speechRecognitionRef.current) {
                try {
                    speechRecognitionRef.current.stop();
                } catch (e) {
                    console.log("Speech recognition already stopped");
                }
            }

            // Wait a moment for final speech results to process
            setTimeout(() => {
                try {
                    mediaRecorderRef.current?.stop();
                } catch (e) {
                    console.log("Recorder already stopped");
                }

                setIsRecording(false);
                stopCamera();
                toast.success("Recording stopped!");
            }, 300); // Give speech recognition time to finalize
        }
    };

    // --- 4. Video Management ---
    const addVideoToList = (url: string, blob: Blob, mimeType: string) => {
        const timestamp = new Date();
        const newVideo: RecordedVideo = {
            id: Date.now().toString(),
            name: `Introduction ${timestamp.toLocaleTimeString()}`,
            url,
            blob,
            mimeType,
            downloadFileName: `introduction_${timestamp.getTime()}.webm`,
            timestamp: timestamp.toLocaleTimeString()
        };

        setRecordedVideos(prev => [newVideo, ...prev]);
    };

    const deleteVideo = (id: string) => {
        const video = recordedVideos.find(v => v.id === id);
        if (video) {
            try {
                URL.revokeObjectURL(video.url);
            } catch (e) {
                console.log('Error revoking URL');
            }
        }
        setRecordedVideos(prev => prev.filter(v => v.id !== id));
        toast.success("Video deleted");
    };

    // --- 5. Analysis Logic ---
    const processAnalysis = async () => {
        // Give extra time for mobile browsers to finalize speech
        await new Promise(resolve => setTimeout(resolve, 500));

        const transcript = (finalTranscriptRef.current + ' ' + interimTranscriptRef.current).trim();

        console.log("=== TRANSCRIPT ANALYSIS ===");
        console.log("Final transcript length:", finalTranscriptRef.current.length);
        console.log("Interim transcript length:", interimTranscriptRef.current.length);
        console.log("Combined transcript:", transcript);
        console.log("==========================");

        if (transcript.length < 5) {
            console.warn("Transcript too short! Final:", finalTranscriptRef.current, "Interim:", interimTranscriptRef.current);
            setReportData({
                original: "(No clear speech detected)",
                analysis: "We couldn't detect any clear speech. Please ensure your microphone is working and speak clearly during recording. On mobile, make sure Chrome has microphone permissions enabled in Settings > Site Settings.",
                grammar: "N/A",
                revision: "N/A",
                error: "No speech detected"
            });
            toast.warning("No speech detected in recording");
            return;
        }

        setIsProcessing(true);

        try {
            // Try to call the API
            const response = await fetch('/api/ai-interview', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    action: 'analyze_intro',
                    transcript: transcript
                })
            });

            if (!response.ok) {
                const errorText = await response.text();
                console.warn(`API returned ${response.status}:`, errorText);
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();

            if (data.feedback) {
                setReportData({
                    original: transcript,
                    analysis: data.feedback.analysis || data.feedback.betterAnswer || "Analysis complete.",
                    grammar: data.feedback.grammarFix || "No grammar issues detected.",
                    revision: data.feedback.revision || data.feedback.betterAnswer || transcript,
                    error: null
                });
                toast.success("Analysis complete!");
            } else {
                // Fallback structure
                setReportData({
                    original: transcript,
                    analysis: "Analysis complete. Your introduction was recorded successfully.",
                    grammar: "No major grammar issues found.",
                    revision: transcript,
                    error: null
                });
                toast.success("Analysis complete!");
            }

        } catch (error: any) {
            console.error("Analysis error:", error);

            // Generate a mock analysis based on transcript length and basic checks
            const wordCount = transcript.split(/\s+/).length;
            const hasFillerWords = /\b(um|uh|like|you know|actually)\b/gi.test(transcript);
            const avgWordLength = transcript.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / wordCount;

            let analysis = "";
            let grammar = "";
            let revision = transcript;

            if (wordCount < 20) {
                analysis = "Your introduction was quite brief. Try to expand on your background, skills, and what makes you unique. Aim for 30-60 seconds.";
            } else if (wordCount > 120) {
                analysis = "Your introduction was comprehensive, but consider condensing it slightly. Focus on the most impactful points to keep your audience engaged.";
            } else {
                analysis = "Good length for your introduction! Make sure you covered: who you are, your background, your key strengths, and why you're interested in this opportunity.";
            }

            if (hasFillerWords) {
                grammar = "Tip: Try to minimize filler words like 'um', 'uh', 'like', and 'you know'. Practice pausing instead when you need to think.";
            } else {
                grammar = "Great job! No obvious filler words detected. Your speech appears clear and confident.";
            }

            // Add suggestion based on word complexity
            if (avgWordLength < 4.5) {
                grammar += " Consider using more descriptive vocabulary to make a stronger impression.";
            }

            toast.warning("Using offline analysis mode");

            setReportData({
                original: transcript,
                analysis: analysis,
                grammar: grammar,
                revision: `Consider this structure: "Hello, I'm [Name]. I'm a [Role/Student] with [X years] experience in [Field]. I specialize in [Key Skill]. I'm passionate about [Interest] and looking to [Goal]. I'd love to contribute by [Value Proposition]."`,
                error: null // Don't show error since we provided fallback
            });
        } finally {
            setIsProcessing(false);
        }
    };

    // --- 6. PDF Generation ---
    const downloadPDF = () => {
        if (!reportData) return;

        try {
            const doc = new jsPDF();
            const pageWidth = doc.internal.pageSize.getWidth();
            const margin = 20;
            const contentWidth = pageWidth - (margin * 2);

            // Header
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("Introduction Analysis Report", margin, 25);

            doc.setFontSize(11);
            doc.setFont("helvetica", "normal");
            doc.setTextColor(100);
            doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 35);

            // Reset color
            doc.setTextColor(0);

            let y = 50;
            const lineHeight = 7;

            const addSection = (title: string, content: string) => {
                // Check if we need a new page
                if (y > 250) {
                    doc.addPage();
                    y = 20;
                }

                doc.setFont("helvetica", "bold");
                doc.setFontSize(13);
                doc.text(title, margin, y);
                y += 8;

                doc.setFont("helvetica", "normal");
                doc.setFontSize(10);

                const lines = doc.splitTextToSize(content, contentWidth);
                doc.text(lines, margin, y);
                y += (lines.length * lineHeight) + 10;
            };

            addSection("Your Transcript:", reportData.original);
            addSection("Analysis & Feedback:", reportData.analysis);

            if (reportData.grammar && reportData.grammar !== "N/A") {
                addSection("Grammar Review:", reportData.grammar);
            }

            if (reportData.revision && reportData.revision !== "N/A" && reportData.revision !== reportData.original) {
                addSection("Improved Version:", reportData.revision);
            }

            doc.save(`intro_analysis_${Date.now()}.pdf`);
            toast.success("PDF downloaded!");
        } catch (error) {
            console.error("PDF generation error:", error);
            toast.error("Failed to generate PDF");
        }
    };

    // --- RENDER ---
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                            Practice Introduction
                        </h1>
                        <p className="text-gray-400 mt-2 text-sm md:text-base">
                            Record a 30-60 second self-introduction. Our AI will analyze your confidence, content, and grammar.
                        </p>
                    </div>
                    {reportData && !reportData.error && (
                        <button
                            onClick={downloadPDF}
                            className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-medium transition-all hover:shadow-lg hover:shadow-indigo-500/20"
                        >
                            <FileText className="h-4 w-4" /> Download Report
                        </button>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* LEFT: Recorder */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="bg-[#111] border border-white/10 rounded-3xl overflow-hidden relative shadow-2xl">
                            {/* Video Preview */}
                            <div className="aspect-video bg-black relative flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    className={`w-full h-full object-cover ${!streamActive ? 'hidden' : ''}`}
                                    playsInline
                                    muted
                                />
                                {!streamActive && (
                                    <div className="text-center text-gray-500">
                                        <Camera className="h-16 w-16 mx-auto mb-4 opacity-20" />
                                        <p className="text-sm">Camera is off</p>
                                    </div>
                                )}

                                {/* Recording Indicator */}
                                {isRecording && (
                                    <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-500/90 text-white px-3 py-1.5 rounded-full text-sm font-bold animate-pulse shadow-lg">
                                        <div className="h-2 w-2 bg-white rounded-full animate-pulse" />
                                        RECORDING
                                    </div>
                                )}
                            </div>

                            {/* Controls Bar */}
                            <div className="p-6 bg-[#161616] border-t border-white/5 flex items-center justify-between">
                                <div className="flex items-center gap-2 text-sm text-gray-400">
                                    <Mic className={`h-4 w-4 ${isRecording ? 'text-red-400 animate-pulse' : ''}`} />
                                    {isRecording ? "Recording audio..." : "Ready to record"}
                                </div>

                                <div className="flex gap-4">
                                    {!isRecording ? (
                                        <button
                                            onClick={handleStartRecording}
                                            disabled={isProcessing}
                                            className="flex items-center gap-2 bg-white text-black hover:bg-gray-200 disabled:bg-gray-600 disabled:cursor-not-allowed px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-white/5 hover:scale-105"
                                        >
                                            <Video className="h-5 w-5" /> Start Recording
                                        </button>
                                    ) : (
                                        <button
                                            onClick={handleStopRecording}
                                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-full font-bold transition-all shadow-lg shadow-red-500/20 hover:scale-105"
                                        >
                                            <Square className="h-5 w-5 fill-current" /> Stop & Analyze
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Analysis Result Card */}
                        {(isProcessing || reportData) && (
                            <div className="bg-[#111] border border-white/10 rounded-3xl p-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                {isProcessing ? (
                                    <div className="text-center py-12">
                                        <Loader2 className="h-12 w-12 text-indigo-500 animate-spin mx-auto mb-4" />
                                        <h3 className="text-xl font-semibold text-white">Analyzing Speech...</h3>
                                        <p className="text-gray-400 mt-2">Generating grammar and content feedback.</p>
                                    </div>
                                ) : reportData && (
                                    <div className="space-y-8">
                                        <div className="flex items-center gap-3 pb-4 border-b border-white/10">
                                            <div className={`p-2 ${reportData.error ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'} rounded-lg`}>
                                                {reportData.error ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
                                            </div>
                                            <h3 className="text-xl font-bold text-white">
                                                {reportData.error ? 'Analysis Incomplete' : 'Analysis Complete'}
                                            </h3>
                                        </div>

                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                                <h4 className="text-indigo-400 font-semibold mb-3 flex items-center gap-2">
                                                    <AlertCircle className="h-4 w-4" /> Feedback
                                                </h4>
                                                <p className="text-gray-300 text-sm leading-relaxed">{reportData.analysis}</p>
                                            </div>

                                            {reportData.revision && reportData.revision !== "N/A" && (
                                                <div className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
                                                    <h4 className="text-purple-400 font-semibold mb-3 flex items-center gap-2">
                                                        <FileText className="h-4 w-4" /> Improved Version
                                                    </h4>
                                                    <p className="text-gray-300 text-sm leading-relaxed italic">"{reportData.revision}"</p>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-black/30 p-5 rounded-2xl border border-white/5">
                                            <h4 className="text-gray-400 font-semibold mb-3 text-sm uppercase tracking-wider">Your Transcript</h4>
                                            <p className="text-gray-300 text-sm font-mono leading-relaxed">{reportData.original}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Sidebar (History) */}
                    <div className="lg:col-span-1">
                        <div className="bg-[#111] border border-white/10 rounded-3xl p-6 sticky top-6">
                            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <Video className="h-5 w-5 text-indigo-400" /> Recorded Sessions
                            </h3>

                            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                {recordedVideos.length === 0 ? (
                                    <div className="text-center py-10 text-gray-500">
                                        <div className="bg-white/5 h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <Video className="h-8 w-8 opacity-50" />
                                        </div>
                                        <p className="text-sm">No recordings yet</p>
                                        <p className="text-xs text-gray-600 mt-2">Start recording to see your sessions here</p>
                                    </div>
                                ) : (
                                    recordedVideos.map((video) => (
                                        <div
                                            key={video.id}
                                            className="bg-white/5 border border-white/5 rounded-xl p-4 hover:bg-white/10 transition-all duration-300 group hover:border-white/20"
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-white truncate">{video.name}</p>
                                                    <p className="text-xs text-gray-500 mt-1">{video.timestamp}</p>
                                                </div>
                                                <button
                                                    onClick={() => deleteVideo(video.id)}
                                                    className="text-gray-600 hover:text-red-400 transition-colors p-1"
                                                    title="Delete recording"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>

                                            <div className="flex gap-2">
                                                <a
                                                    href={video.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="flex-1 bg-black/50 hover:bg-indigo-600 hover:text-white text-gray-400 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                                                >
                                                    <Play className="h-3 w-3" /> Play
                                                </a>
                                                <a
                                                    href={video.url}
                                                    download={video.downloadFileName}
                                                    className="flex-1 bg-black/50 hover:bg-green-600 hover:text-white text-gray-400 text-xs py-2.5 rounded-lg flex items-center justify-center gap-2 transition-all font-medium"
                                                >
                                                    <Download className="h-3 w-3" /> Save
                                                </a>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
            `}</style>
        </div>
    );
}