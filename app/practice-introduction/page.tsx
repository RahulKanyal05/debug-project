// Use client directive is necessary for hooks and event listeners
'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { jsPDF } from 'jspdf'; // Import jsPDF

// Define the structure for report data
interface ReportData {
    original: string | null;
    analysis: string | null;
    grammar: string | null;
    revision: string | null;
    error: string | null;
}

// Define the structure for recorded video items
interface RecordedVideo {
    id: string;
    name: string;
    url: string;
    blob: Blob;
    mimeType: string;
    downloadFileName: string;
}

export default function VideoSpeechAnalyzerPage() {
    // --- State Variables ---
    const [isRecording, setIsRecording] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false); // For loader state
    const [reportData, setReportData] = useState<ReportData>({ original: null, analysis: null, grammar: null, revision: null, error: null });
    const [showReport, setShowReport] = useState<boolean>(false);
    const [recordedVideos, setRecordedVideos] = useState<RecordedVideo[]>([]);
    const [apiKeyError, setApiKeyError] = useState<boolean>(false);

    // --- Refs for DOM elements and mutable instances ---
    const videoRef = useRef<HTMLVideoElement>(null);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const speechRecognitionRef = useRef<SpeechRecognition | null>(null);
    const recordedChunksRef = useRef<Blob[]>([]);
    const currentTranscriptionRef = useRef<string>('');
    const recognitionActiveRef = useRef<boolean>(false); // To manage recognition state without re-renders

    // --- API Key ---
    // <!> CRITICAL SECURITY WARNING: Never hardcode API keys in frontend code for production. <!>
    // <!> Use environment variables (NEXT_PUBLIC_...) or preferably a backend API route. <!>
    const geminiApiKey = "AIzaSyA2GPUIDGRPdMy0uQUsdXBE7Gepgo1DJqI"; // <<<<<< PASTE YOUR KEY HERE (BUT DON'T DEPLOY LIKE THIS!)

    // --- Initialization Effect ---
    useEffect(() => {
        console.log("Video & Speech Analyzer Initializing...");
        if (!geminiApiKey || geminiApiKey === "YOUR_GEMINI_API_KEY" || geminiApiKey.length < 30) {
            console.error("CRITICAL: Google Gemini API Key not set or invalid. Report generation WILL FAIL.");
            alert("API Key is missing or invalid! Edit the component file, paste your key (or use env vars), and reload.");
            setApiKeyError(true);
        } else {
            console.log("API Key found (basic check passed).");
            setApiKeyError(false);
        }

        // Setup Speech Recognition instance
        const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionAPI) {
            const recognition = new SpeechRecognitionAPI();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-IN'; // Default, change if needed
            console.log(`Using speech recognition language: ${recognition.lang}`);

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript.trim() + ' ';
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                finalTranscript = finalTranscript.trim();
                if (finalTranscript) {
                    currentTranscriptionRef.current += finalTranscript + ' ';
                    // console.log("Intermediate Transcription:", currentTranscriptionRef.current); // Optional: log updates
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error:', event.error, event.message);
                let alertMsg = `Speech recognition error: ${event.error}`;
                recognitionActiveRef.current = false;

                if (event.error === 'audio-capture') alertMsg = 'Error capturing audio. Check microphone permissions/hardware.';
                else if (event.error === 'not-allowed' || event.error === 'service-not-allowed') alertMsg = 'Microphone access denied. Please allow microphone access.';
                else if (event.error === 'network') alertMsg = "Network error during speech recognition. Check connection.";
                else if (event.error === 'no-speech') alertMsg = ''; // Common, don't alert
                else if (event.error === 'aborted') alertMsg = ''; // Intentional stop
                else alertMsg = `Unknown speech recognition error: ${event.error}. Recognition stopped.`;

                if (alertMsg) alert(alertMsg);

                if (['audio-capture', 'not-allowed', 'service-not-allowed'].includes(event.error)) {
                     if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
                         handleStopRecording(); // Attempt to stop recording fully
                     }
                }
            };

            recognition.onend = () => {
                console.log("Speech recognition service ended.");
                if (recognitionActiveRef.current) {
                    console.log("Attempting to restart recognition...");
                    // Use setTimeout to avoid immediate restart issues
                    setTimeout(() => {
                        if (recognitionActiveRef.current && speechRecognitionRef.current) {
                           try {
                               speechRecognitionRef.current.start();
                               console.log("Recognition restarted.");
                           } catch (error: any) {
                               // Avoid infinite loops on persistent errors
                               if (error.name !== 'InvalidStateError') {
                                   console.error("Error restarting recognition:", error);
                                   recognitionActiveRef.current = false;
                               } else {
                                   console.warn("Recognition likely already running, restart aborted.");
                               }
                           }
                        }
                    }, 250);
                }
             };

             speechRecognitionRef.current = recognition;

        } else {
            alert("FATAL: Your browser does not support the Web Speech API. Speech analysis unavailable.");
            console.error("Web Speech API not supported.");
            setApiKeyError(true); // Treat as blocking error for start button
        }

        // Cleanup function
        return () => {
            console.log("Cleaning up component...");
            stopCamera(); // Ensure camera is off
            if (speechRecognitionRef.current) {
                recognitionActiveRef.current = false; // Prevent restart on unmount
                try { speechRecognitionRef.current.abort(); } catch (e) {} // Use abort for immediate stop
                speechRecognitionRef.current = null;
            }
            // Revoke any lingering object URLs from video list (important for memory)
            recordedVideos.forEach(video => URL.revokeObjectURL(video.url));
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [geminiApiKey]); // Rerun effect only if apiKey changes (or on mount)

    // --- Camera/Media Functions (wrapped in useCallback for stability if needed) ---
    const startCamera = useCallback(async (): Promise<boolean> => {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert("getUserMedia is not supported by your browser.");
            return false;
        }
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.muted = true; // Mute local playback
                await videoRef.current.play();
            }
            return true;
        } catch (err: any) {
             let errorMsg = "Could not access camera/microphone.";
             if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') errorMsg = "Camera/microphone access denied! Allow permissions.";
             else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') errorMsg = "No camera/microphone found.";
             else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') errorMsg = "Camera/microphone is busy or unreadable.";
             else errorMsg = `getUserMedia error: ${err.name}`;
             alert(errorMsg);
            console.error("getUserMedia error details:", err);
            return false;
        }
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            console.log("Camera and Mic tracks stopped.");
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
            videoRef.current.pause();
        }
        streamRef.current = null;
    }, []);

    const setupMediaRecorder = useCallback((): boolean => {
        if (!streamRef.current || !streamRef.current.active) {
            console.error("Stream not available for MediaRecorder");
            return false;
        }
         recordedChunksRef.current = []; // Clear previous chunks
         const mimeTypes = [
            'video/webm;codecs=vp9,opus', 'video/webm;codecs=vp8,opus',
            'video/webm;codecs=h264,opus', 'video/mp4;codecs=h264,aac',
            'video/webm', 'video/mp4'
         ];
         let selectedMimeType = mimeTypes.find(type => MediaRecorder.isTypeSupported(type)) || '';

         if (!selectedMimeType) {
            console.error("No suitable MediaRecorder mimeType supported.");
            alert("Video recording format not supported by your browser.");
            return false;
         }
         console.log("Using MediaRecorder mimeType:", selectedMimeType);

        try {
             const recorder = new MediaRecorder(streamRef.current, { mimeType: selectedMimeType });

             recorder.ondataavailable = event => {
                if (event.data && event.data.size > 0) {
                    recordedChunksRef.current.push(event.data);
                }
             };

             recorder.onstop = () => {
                console.log("MediaRecorder stopped.");
                if (recordedChunksRef.current.length === 0) {
                    console.warn("No data recorded.");
                    return;
                }
                const blobType = selectedMimeType.split(';')[0];
                const blob = new Blob(recordedChunksRef.current, { type: blobType });
                const url = URL.createObjectURL(blob);

                // Call function to add video to list state
                addVideoToList(url, blob, blobType);
                recordedChunksRef.current = []; // Clear chunks after processing
             };

             recorder.onerror = (event: Event) => {
                // MediaRecorderErrorEvent is not standard, use Event and access error potentially
                let error = (event as any).error || new Error('Unknown MediaRecorder Error');
                console.error("MediaRecorder error:", error);
                alert(`Recording error: ${error.name || 'Unknown Error'}`);
                recognitionActiveRef.current = false; // Stop recognition attempts on recorder error
                if (speechRecognitionRef.current) {
                    try { speechRecognitionRef.current.stop(); } catch(e){}
                }
                 if (isRecording) handleStopRecording(); // Try to stop gracefully
             };

             mediaRecorderRef.current = recorder;
            return true;
         } catch (error: any) {
             console.error("Failed to create MediaRecorder:", error);
             alert(`Failed to initialize video recorder: ${error.message}`);
             return false;
         }
     }, [isRecording]); // Re-run if isRecording changes (though setup usually only needed once)

    // --- Control Functions ---
    const handleStartRecording = useCallback(async () => {
        if (apiKeyError) {
            alert("Cannot start recording due to API Key issue. Please fix the key in the code and reload.");
            return;
        }
        if (!speechRecognitionRef.current) {
            alert("Speech recognition is not available or not initialized. Cannot start.");
            return;
        }

        setIsRecording(true); // Set recording state, disables start button

        const cameraStarted = await startCamera();
        if (!cameraStarted) {
            setIsRecording(false); // Re-enable start button if camera fails
            return;
        }

        const recorderReady = setupMediaRecorder();
        if (!recorderReady) {
            stopCamera();
            setIsRecording(false); // Re-enable start button if recorder setup fails
            return;
        }

        // Reset state for new recording
        currentTranscriptionRef.current = '';
        setReportData({ original: null, analysis: null, grammar: null, revision: null, error: null });
        setShowReport(false);
        setIsProcessing(false);
        recognitionActiveRef.current = false; // Reset flag

        try {
            mediaRecorderRef.current?.start(1000); // Start recording (timeslice optional)
            console.log("MediaRecorder started:", mediaRecorderRef.current?.state);
        } catch (err: any) {
            console.error("MediaRecorder start failed:", err);
            alert(`Failed to start recording: ${err.message}`);
            stopCamera();
            setIsRecording(false);
            return;
        }

         try {
             currentTranscriptionRef.current = ''; // Ensure clear before starting
             speechRecognitionRef.current.start();
             recognitionActiveRef.current = true; // Set flag AFTER successful start
             console.log("Speech recognition starting.");
         } catch(err: any) {
             recognitionActiveRef.current = false;
             if (err.name === 'InvalidStateError') {
                 console.warn("Speech recognition already active? Assuming OK.");
                 recognitionActiveRef.current = true; // Assume it's ok if already started
             } else {
                 console.error("Could not start speech recognition:", err);
                 alert(`Warning: Speech recognition failed (${err.message}). Analysis may be unavailable.`);
                 // Don't stop recording if only speech fails initially
             }
         }

    }, [apiKeyError, startCamera, setupMediaRecorder, stopCamera]);

    const handleStopRecording = useCallback(() => {
        setIsRecording(false); // Set state immediately to disable stop/enable start
        recognitionActiveRef.current = false; // Signal intentional stop
        console.log("Stopping recording process...");

        if (speechRecognitionRef.current) {
            try {
                speechRecognitionRef.current.stop();
                console.log("Speech recognition stop requested.");
            } catch (err: any) {
                console.warn("Error stopping speech recognition:", err.message);
            }
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
           try {
               mediaRecorderRef.current.stop();
               console.log("MediaRecorder stop requested.");
               // The onstop handler will process the blob
           } catch (err) {
               console.error("Error stopping MediaRecorder:", err);
                // If recorder stop fails, still proceed to analysis if possible
                processTranscriptionAndGenerateReport();
           }
        } else {
             console.warn("MediaRecorder not recording or not found, processing transcript only.");
             // Process transcript even if recorder wasn't running or already stopped
             processTranscriptionAndGenerateReport();
        }
        // IMPORTANT: The actual report generation is now triggered by `processTranscriptionAndGenerateReport`
        // which might be called from recorder.onstop OR directly if recorder wasn't recording.
        // We need a slight delay here OR trigger analysis *after* recorder.onstop finishes.
        // Let's trigger it explicitly after a short delay to ensure final speech results are captured.
        setTimeout(() => {
            processTranscriptionAndGenerateReport();
        }, 400); // Delay to allow final recognition results

    }, []); // Dependencies managed internally


    // --- Report Generation & Display ---
    const processTranscriptionAndGenerateReport = useCallback(() => {
        // This function is called after recording stops (either by button or potentially error)
        const finalTranscript = currentTranscriptionRef.current.trim();
        console.log("Final Transcript for analysis:", finalTranscript);

        setShowReport(true); // Show the report section

        if (finalTranscript.length > 10 && geminiApiKey && geminiApiKey !== "YOUR_GEMINI_API_KEY" && !apiKeyError) {
            setIsProcessing(true); // Show loader
            setReportData({ original: null, analysis: null, grammar: null, revision: null, error: null }); // Clear previous report
            console.log("Transcript sufficient, generating report...");
            generateAndDisplayReport(finalTranscript); // Call async function
        } else {
            let reason = !finalTranscript.length > 10 ? "Transcript too short or no speech detected" : "API Key missing/invalid";
            setIsProcessing(false); // Hide loader
            setReportData({ original: null, analysis: null, grammar: null, revision: null, error: `${reason}. Cannot generate report.` });
            console.warn(`${reason}. Skipping report generation.`);
            stopCamera(); // Stop camera if no report generated
        }
        // Note: generateAndDisplayReport handles camera stop and processing state in its finally block
    }, [geminiApiKey, apiKeyError, stopCamera]); // Dependencies


    const generateAndDisplayReport = useCallback(async (textToAnalyze: string) => {
         const modelName = "gemini-1.5-flash-latest"; // Or your preferred model
         const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
         console.log("Calling Gemini API:", API_URL.replace(geminiApiKey, "YOUR_API_KEY_HIDDEN"));

         const prompt = `
Analyze the following speech transcript professionally. Provide feedback in FOUR distinct parts based *only* on the provided transcript text.

Transcript Provided:
"${textToAnalyze}"

---

Format your response EXACTLY like this, using Markdown bold for labels. Keep each section concise and actionable:

**Original Transcript:**
[Paste the original transcript here exactly as provided above.]

**Detailed Analysis & Feedback:**
[Provide a brief evaluation (2-4 sentences) of the transcript's overall clarity, coherence, flow, and professionalism. Mention any noticeable strengths or weaknesses like run-on sentences, filler words ('um', 'uh', 'like'), repetitiveness, or awkward phrasing.]

**Grammar & Phrasing Issues:**
[List 1-3 specific examples of grammatical errors or awkward phrasing found in the transcript. Quote the phrase briefly and suggest a correction if simple (e.g., "'I has been working' -> 'I have been working'"). If grammar is generally good, state "Grammar and phrasing appear mostly correct." Keep this section very brief and focused on concrete examples.]

**Suggested Revision:**
[Provide a revised version (or a key excerpt if the original is very long) of the transcript that addresses the main issues identified in the analysis and grammar sections. Focus on improving clarity, conciseness, and professionalism. Aim for a natural-sounding improvement.]

---
Do NOT add any introductory/concluding remarks, greetings, or apologies. Just provide the four labeled parts. Ensure the **Original Transcript** section contains the unmodified text provided above.
`;
         let generatedReportData: ReportData = { original: textToAnalyze, analysis: null, grammar: null, revision: null, error: null };

        try {
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                     safetySettings: [ // Example Safety Settings
                        { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_MEDIUM_AND_ABOVE" },
                        { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_MEDIUM_AND_ABOVE" }
                     ],
                     generationConfig: { // Example Generation Config
                         temperature: 0.6,
                         maxOutputTokens: 1024
                      }
                })
            });

            if (!response.ok) {
                 let errorBody = {}; let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
                 try { errorBody = await response.json(); } catch (e) { /* Ignore parsing error */ }
                 errorMessage = (errorBody as any)?.error?.message || errorMessage;
                 throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("Gemini API Response Received:", data);

             const candidate = data?.candidates?.[0];
             if (candidate?.finishReason && !["STOP", "MAX_TOKENS"].includes(candidate.finishReason)) {
                 let reason = candidate.finishReason;
                 if (reason === "SAFETY") reason = `Blocked by safety filter (Reason: ${candidate.safetyRatings?.map((r:any)=>r.category).join(', ') || 'Unknown'})`;
                 generatedReportData.error = `AI generation issue: ${reason}.`;
                 console.warn(`Gemini generation finished unexpectedly: ${reason}`);
             } else if (candidate?.content?.parts?.[0]?.text) {
                 const fullResponseText = candidate.content.parts[0].text;

                 // Robust Parsing Function
                 const parseSection = (label: string, text: string): string | null => {
                     const escapedLabel = label.replace(/\*/g, '\\*').replace(/ /g, '\\s+'); // Handle potential extra spaces
                     // Regex to find the label (bold or not, optional colon), capture everything until the next bold label or end of string
                     const regex = new RegExp(`(?:\\*\\*)?${escapedLabel}(?:\\*\\*)?:?\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i');
                     const match = text.match(regex);
                     return match?.[1]?.trim() ?? null;
                 };

                 generatedReportData.original = parseSection("Original Transcript", fullResponseText) ?? textToAnalyze; // Fallback to original if not found
                 generatedReportData.analysis = parseSection("Detailed Analysis & Feedback", fullResponseText);
                 generatedReportData.grammar = parseSection("Grammar & Phrasing Issues", fullResponseText);
                 generatedReportData.revision = parseSection("Suggested Revision", fullResponseText);

                 // Basic validation
                 if (!generatedReportData.analysis && !generatedReportData.grammar && !generatedReportData.revision) {
                     console.warn("Parsing failed for analysis, grammar, and revision. Check AI response format. Displaying raw response.");
                     if (!generatedReportData.error) { // Avoid overwriting safety/other errors
                         generatedReportData.error = "Could not parse the AI response structure. Raw response shown below.";
                         generatedReportData.analysis = fullResponseText; // Put raw response in analysis
                         generatedReportData.grammar = "(Parsing Error)";
                         generatedReportData.revision = "(Parsing Error)";
                     }
                 } else {
                     console.log("Report content parsed successfully.");
                 }

             } else {
                generatedReportData.error = "Received an empty or unexpected response structure from the API.";
                console.error("Unexpected API response structure:", data);
             }

        } catch (error: any) {
            console.error("Error during report generation:", error);
            generatedReportData.error = `Error generating report:\n${error.message}\n(Check console, API key validity/quota, model: ${modelName})`;
        } finally {
            setReportData(generatedReportData); // Update the state with the result
            setIsProcessing(false); // Hide loader
            stopCamera(); // Ensure camera is stopped after processing
            console.log("Report generation attempt finished.");
        }
    }, [geminiApiKey, stopCamera]); // Dependencies


    // --- Video List Management ---
    const addVideoToList = useCallback((url: string, blob: Blob, mimeType: string) => {
        const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const videoName = `Recording ${timestamp}`;
        const fileExtension = mimeType.includes('mp4') ? 'mp4' : 'webm';
        const downloadFileName = `Recording_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0,15)}.${fileExtension}`;
        const newVideo: RecordedVideo = {
            id: url, // Use URL as unique key for this session
            name: videoName,
            url,
            blob, // Keep blob if needed later, maybe for upload?
            mimeType,
            downloadFileName
        };
        // Add to the beginning of the list
        setRecordedVideos(prevVideos => [newVideo, ...prevVideos]);
        console.log(`Added video to list: ${videoName}`);
    }, []);

    const handleDownloadVideo = useCallback((video: RecordedVideo) => {
        const a = document.createElement("a");
        a.style.display = 'none';
        a.href = video.url;
        a.download = video.downloadFileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }, []);

    const handleDeleteVideo = useCallback((idToDelete: string) => {
        const videoToDelete = recordedVideos.find(v => v.id === idToDelete);
        if (videoToDelete && confirm(`Delete "${videoToDelete.name}"? This cannot be undone.`)) {
            setRecordedVideos(prevVideos => prevVideos.filter(video => video.id !== idToDelete));
            URL.revokeObjectURL(videoToDelete.url); // Important: Release memory
            console.log(`Deleted video: ${videoToDelete.name}`);
        }
    }, [recordedVideos]);

    // --- Download Report Functionality ---
    const handleDownloadReport = useCallback(() => {
        if (!reportData || reportData.error || (!reportData.original && !reportData.analysis && !reportData.grammar && !reportData.revision)) {
            alert("No valid report data available to download.");
            return;
        }

        try {
            const doc = new jsPDF();
            let y = 15;
            const x = 15;
            const lineSpacing = 7;
            const sectionSpacing = 10;
            const pageMaxWidth = doc.internal.pageSize.getWidth() - x * 2;

            const addWrappedText = (text: string | null, isBold = false, fontSize = 11, isHeading = false) => {
                if (y > doc.internal.pageSize.getHeight() - 20) { // Check before adding text
                    doc.addPage(); y = 15;
                }
                doc.setFont('helvetica', isBold ? 'bold' : 'normal');
                doc.setFontSize(fontSize);
                const cleanedText = (text || '(Not available)').replace(/[*_`]/g, '');
                const lines = doc.splitTextToSize(cleanedText, pageMaxWidth);

                lines.forEach((line: string) => {
                    if (y + lineSpacing > doc.internal.pageSize.getHeight() - 15) {
                        doc.addPage(); y = 15;
                        if(isHeading) { // Re-apply heading style on new page if needed
                             doc.setFont('helvetica', 'bold'); doc.setFontSize(fontSize);
                        } else {
                             doc.setFont('helvetica', 'normal'); doc.setFontSize(11); // Reset style
                        }
                    }
                    doc.text(line, x, y);
                    y += lineSpacing;
                });
                 if (!isHeading || lines.length > 1) { y += lineSpacing / 2; }
            };

            // Document Title
            doc.setFontSize(18); doc.setFont('helvetica', 'bold');
            doc.text(`Video & Speech Analysis Report`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += lineSpacing * 2;
            doc.setFontSize(10); doc.setFont('helvetica', 'normal');
            doc.text(`Generated: ${new Date().toLocaleString()}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
            y += sectionSpacing * 1.5;

            // Sections
            if (reportData.original) { addWrappedText("Original Transcript", true, 14, true); y += lineSpacing / 2; addWrappedText(reportData.original); y += sectionSpacing; }
            if (reportData.analysis) { addWrappedText("Detailed Analysis & Feedback", true, 14, true); y += lineSpacing / 2; addWrappedText(reportData.analysis); y += sectionSpacing; }
            if (reportData.grammar) { addWrappedText("Grammar & Phrasing Issues", true, 14, true); y += lineSpacing / 2; addWrappedText(reportData.grammar); y += sectionSpacing; }
            if (reportData.revision) { addWrappedText("Suggested Revision", true, 14, true); y += lineSpacing / 2; addWrappedText(reportData.revision); }

            const pdfFileName = `Analysis_Report_${new Date().toISOString().replace(/[-:T.]/g, "").slice(0,15)}.pdf`;
            doc.save(pdfFileName);
            console.log("PDF report download initiated.");

        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF report. Check the console for details.");
        }
    }, [reportData]);


    // --- Render Logic ---
    const reportButtonDisabled = isProcessing || !!reportData.error || (!reportData.original && !reportData.analysis && !reportData.grammar && !reportData.revision);

    return (
        <>
            {/* Global styles only for reset and body background/font (applied outside component scope) */}
            <style jsx global>{`
                /* Global Reset - Apply cautiously, ensure navbar handles resets */
                * {
                   
                    box-sizing: border-box;
                }

                /* Apply base font and background to body - this WILL affect the entire page.
                   If navbar needs different styles, it must override these. */
                body {
                    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                    background-color: #0d0d0d; /* Dark background for the page */
                    color: white; /* Default text color */
                    line-height: 1.5; /* Base line height */
                }

                /* Optional: Global scrollbar styling for consistency
                   Remove if you don't want this affecting other page elements */
                ::-webkit-scrollbar {
                    width: 8px;
                    height: 8px; /* Add height for horizontal scrollbars */
                }
                ::-webkit-scrollbar-track {
                    background: #1a1a1a;
                    border-radius: 10px;
                }
                ::-webkit-scrollbar-thumb {
                    background-color: #444;
                    border-radius: 10px;
                    border: 2px solid #1a1a1a;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background-color: #555;
                }
            `}</style>

            {/* Component-specific styles */}
            <style jsx>{`
                /* Container for the entire component - Controls layout and isolation */
                .analyzer-container {
                    display: flex;
                    flex-direction: row; /* Default: side-by-side */
                    min-height: calc(100vh - 40px); /* Adjust based on potential header/footer outside component */
                    padding: 20px;
                    gap: 20px;
                    width: 100%; /* Ensure it takes full width available */
                    max-width: 1600px; /* Optional: Max width for very large screens */
                    margin: 0 auto; /* Center container if max-width is applied */
                    /* background-color: #0d0d0d; Moved to global body */
                    /* color: white; Moved to global body */
                }

                .main-content {
                    flex: 3; /* Takes more space */
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                    min-width: 0; /* Allow shrinking */
                    /* max-height: calc(100vh - 40px); Removed fixed height calculation */
                    /* overflow-y: auto; Allow natural flow or add if needed */
                }

                .video-list-sidebar {
                    flex: 1; /* Takes less space */
                    display: flex;
                    flex-direction: column;
                    gap: 15px; /* Gap for items inside */
                    background: #111;
                    padding: 15px; /* Adjusted padding */
                    border-radius: 10px;
                    /* height: calc(100vh - 40px); Removed fixed height calculation */
                    min-width: 280px; /* Min width for sidebar */
                    max-width: 350px; /* Max width for sidebar */
                    border: 1px solid #222;
                    overflow-y: auto; /* Enable scroll ONLY for the list container */
                    max-height: calc(95vh - 40px); /* Limit height and enable scroll */
                }

                .recording-section {
                    background: #111;
                    padding: 20px;
                    border-radius: 10px;
                    text-align: center;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    border: 1px solid #222;
                }

                .recording-section h2 {
                     margin-bottom: 15px;
                     color: #eee;
                     font-weight: 500;
                     font-size: 1.5em; /* Slightly larger heading */
                 }

                /* Video player styling */
                .video-player {
                    width: 100%; /* Take full width of its container */
                    max-width: 720px; /* Increased max-width */
                    height: auto;
                    aspect-ratio: 16 / 9;
                    border-radius: 10px;
                    background: black;
                    margin-bottom: 15px;
                    border: 1px solid #333;
                    display: block; /* Ensure it behaves like a block element */
                    margin-left: auto; /* Center the video element */
                    margin-right: auto;
                }

                .controls {
                    margin-top: 10px;
                    display: flex;
                    flex-wrap: wrap; /* Allow buttons to wrap on small screens */
                    justify-content: center; /* Center buttons */
                    gap: 10px; /* Space between buttons */
                }

                /* Base button styles (Scoped to component) */
                button {
                    background: #e53935; /* Red for start/stop */
                    border: none;
                    color: white;
                    padding: 10px 18px;
                    cursor: pointer;
                    border-radius: 5px;
                    /* margin: 5px; Replaced by gap in flex container */
                    transition: background-color 0.2s ease, transform 0.1s ease, opacity 0.2s ease;
                    font-size: 1rem;
                    font-weight: 500;
                    line-height: 1.2; /* Ensure text vertical alignment */
                }

                button:hover:not(:disabled) {
                    background: #f44336;
                    transform: translateY(-1px);
                }

                button:active:not(:disabled) {
                    transform: translateY(0px);
                }

                button:disabled {
                    background: #555;
                    cursor: not-allowed;
                    opacity: 0.7;
                }

                 /* --- Report Section Styles --- */
                .report-section {
                    background: #1a1a1a;
                    padding: 20px;
                    border-radius: 10px;
                    border: 1px solid #2a2a2a;
                    /* margin-top: 20px; /* Handled by gap in main-content */
                 }

                 .report-section h3 {
                    text-align: center;
                    margin-bottom: 20px;
                    color: #eee;
                    font-weight: 600;
                    font-size: 1.4em;
                    border-bottom: 1px solid #333;
                    padding-bottom: 10px;
                }

                 .reportLoader {
                    text-align: center;
                    padding: 30px 20px;
                    font-style: italic;
                    color: #aaa;
                    font-size: 1.1em;
                }

                 .report-content {
                     /* No specific styles needed, parent handles display */
                 }

                .report-part {
                    margin-bottom: 25px;
                    background: #222;
                    padding: 18px;
                    border-radius: 8px;
                    border-left: 4px solid #e53935; /* Default accent border */
                    box-shadow: 0 2px 5px rgba(0,0,0,0.2);
                }
                /* Remove margin from last part */
                .report-part:last-child {
                    margin-bottom: 0;
                }

                .report-part h4 {
                    color: #ff7a7a; /* Default heading color */
                    margin-bottom: 12px;
                    font-size: 1.15em;
                    font-weight: 600;
                    border-bottom: none;
                    padding-bottom: 0;
                }

                .report-part pre {
                    white-space: pre-wrap; /* Allows wrapping */
                    word-wrap: break-word; /* Breaks long words */
                    font-family: 'Consolas', 'Menlo', 'Monaco', monospace;
                    font-size: 0.95em;
                    color: #ddd;
                    line-height: 1.65;
                    background-color: #282828;
                    padding: 10px;
                    border-radius: 5px;
                    margin-top: 5px;
                    overflow-x: auto; /* Add horizontal scroll for rare cases if needed */
                }

                 /* Specific styling for different report parts using :global and nth-of-type */
                 /* NOTE: Using :global() as nth-of-type can be tricky with conditional rendering in React/Styled JSX */
                 :global(.report-content > .report-part:nth-of-type(1)) { border-left-color: #4CAF50; } /* Original - Green */
                 :global(.report-content > .report-part:nth-of-type(2)) { border-left-color: #FFC107; } /* Analysis - Yellow */
                 :global(.report-content > .report-part:nth-of-type(3)) { border-left-color: #2196F3; } /* Grammar - Blue */
                 :global(.report-content > .report-part:nth-of-type(4)) { border-left-color: #9C27B0; } /* Revision - Purple */
                 /* Error styling */
                 :global(.report-content > .report-part.error-part) { border-left-color: #f44336 !important; } /* Red for errors (important to override nth-type) */


                 :global(.report-content > .report-part:nth-of-type(1) h4) { color: #81C784; }
                 :global(.report-content > .report-part:nth-of-type(2) h4) { color: #FFD54F; }
                 :global(.report-content > .report-part:nth-of-type(3) h4) { color: #64B5F6; }
                 :global(.report-content > .report-part:nth-of-type(4) h4) { color: #BA68C8; }
                 /* Error heading styling */
                 :global(.report-content > .report-part.error-part h4) { color: #e57373 !important; }

                 .downloadReportBtn {
                    background-color: #007bff; /* Blue for download */
                    display: block;
                    margin: 25px auto 0; /* Center button */
                    width: fit-content;
                 }
                .downloadReportBtn:hover:not(:disabled) {
                    background-color: #0056b3;
                    transform: translateY(-1px);
                }
                 /* --- End Report Section Styles --- */


                 /* --- Video List Sidebar Styles --- */
                 .video-list-sidebar h3 {
                    text-align: center;
                    margin-bottom: 15px;
                    color: #eee;
                    font-weight: 500;
                    font-size: 1.3em;
                    padding-bottom: 10px;
                    border-bottom: 1px solid #333;
                 }

                 #videosContainer {
                    /* Container for the list items */
                 }

                 .video-item {
                    padding: 10px 15px;
                    background: #2a2a2a;
                    border-radius: 5px;
                    margin-bottom: 10px; /* Use gap on parent instead if preferred */
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: background-color 0.2s ease;
                    gap: 10px; /* Space between link and controls */
                }
                 .video-item:last-child {
                    margin-bottom: 0; /* Remove margin from last item */
                 }
                 .video-item:hover {
                     background-color: #333;
                 }

                 .video-item a {
                     color: #ffabab;
                     text-decoration: none;
                     flex-grow: 1; /* Allow link to take available space */
                     /* margin-right: 10px; Replaced by gap */
                     overflow: hidden;
                     text-overflow: ellipsis;
                     white-space: nowrap;
                     font-size: 0.95em;
                     display: block; /* Ensure it takes block space */
                 }
                  .video-item a:hover {
                      text-decoration: underline;
                  }

                 .video-controls {
                    display: flex;
                    gap: 5px; /* Reduced gap for smaller buttons */
                    flex-shrink: 0; /* Prevent controls from shrinking */
                 }

                 /* Specific small control buttons */
                 .control-btn {
                     background: rgba(255, 255, 255, 0.1);
                     padding: 5px 8px; /* Adjusted padding */
                     font-size: 12px;
                     cursor: pointer;
                     border-radius: 4px;
                     color: #ccc;
                     border: 1px solid rgba(255, 255, 255, 0.2);
                     white-space: nowrap;
                     transition: background-color 0.2s ease, color 0.2s ease, transform 0.1s ease, opacity 0.2s ease;
                     /* Reset base button styles */
                     margin: 0;
                     font-weight: normal;
                     line-height: 1;
                 }
                 .control-btn.view { background: #4caf50; border-color: #4caf50; color: white; }
                 .control-btn.download { background: #007bff; border-color: #007bff; color: white; }
                 .control-btn.delete { background: #e53935; border-color: #e53935; color: white; }

                 .control-btn:hover:not(:disabled) {
                     opacity: 0.85;
                     /* Remove base button transform, use subtle brightness/opacity */
                     filter: brightness(1.1);
                     transform: none; /* Override base button hover transform */
                     background: inherit; /* Keep specific background */
                 }
                 /* Apply specific hover colors */
                 .control-btn.view:hover:not(:disabled) { background: #5cbf60; border-color: #5cbf60; }
                 .control-btn.download:hover:not(:disabled) { background: #288fff; border-color: #288fff; }
                 .control-btn.delete:hover:not(:disabled) { background: #f65a56; border-color: #f65a56; }

                 .control-btn:disabled {
                     background: #444 !important; /* Ensure disabled style overrides */
                     border-color: #444 !important;
                     color: #888 !important;
                     opacity: 0.5;
                     cursor: not-allowed;
                 }

                 /* --- Responsive Design --- */

                 /* Tablet and Smaller Desktop */
                 @media (max-width: 992px) {
                    .analyzer-container {
                        flex-direction: column; /* Stack main content and sidebar */
                        min-height: 100vh; /* Ensure it takes full viewport height */
                        height: auto; /* Allow content to determine height */
                        padding: 15px; /* Reduce padding */
                        gap: 15px; /* Reduce gap */
                    }
                    .main-content {
                        flex: 1; /* Reset flex grow */
                        width: 100%; /* Take full width */
                        order: 1; /* Show main content first */
                    }
                    .video-list-sidebar {
                        flex: 1; /* Reset flex grow */
                        width: 100%; /* Take full width */
                        max-width: none; /* Remove max-width */
                        min-width: 0; /* Remove min-width */
                        order: 2; /* Show sidebar below */
                        max-height: 40vh; /* Limit height when stacked, enable scroll */
                        padding: 15px;
                    }
                    .video-player {
                        max-width: 600px; /* Adjust max width */
                    }
                 }

                 /* Mobile Devices */
                 @media (max-width: 600px) {
                    .analyzer-container {
                        padding: 10px;
                        gap: 10px;
                    }
                    .recording-section, .report-section, .video-list-sidebar {
                        padding: 15px; /* Further reduce padding */
                    }
                    .recording-section h2, .report-section h3, .video-list-sidebar h3 {
                        font-size: 1.3em; /* Adjust heading sizes */
                    }
                    .report-part {
                        padding: 15px;
                    }
                    button { /* Adjust base button padding */
                        padding: 8px 15px;
                        font-size: 0.95rem;
                    }
                    .control-btn { /* Adjust small button padding */
                         padding: 4px 7px;
                         font-size: 11px;
                    }
                    .video-item {
                         padding: 8px 12px;
                         flex-direction: column; /* Stack link and controls vertically */
                         align-items: flex-start; /* Align items left */
                    }
                    .video-item a {
                         margin-bottom: 8px; /* Space between link and controls */
                         white-space: normal; /* Allow wrapping for long names */
                    }
                    .video-controls {
                         width: 100%; /* Make controls take full width */
                         justify-content: flex-start; /* Align buttons left */
                         gap: 8px;
                    }

                    .report-part pre {
                        font-size: 0.9em; /* Slightly smaller code font */
                        line-height: 1.6;
                    }
                 }
            `}</style>

            {/* Added a wrapper div for easier top-level styling/targeting if needed */}
            <div className="analyzer-container">
                {/* Main Content Area */}
                <div className="main-content">
                    {/* Video Recording Section */}
                    <div className="recording-section">
                        <h2>Video & Speech Analyzer</h2>
                        {/* Video Element */}
                        {/* Added class for easier targeting */}
                        <video ref={videoRef} className="video-player" playsInline autoPlay muted></video>
                        <div className="controls">
                            <button
                                id="startBtn"
                                onClick={handleStartRecording}
                                disabled={isRecording || apiKeyError}
                                title={apiKeyError ? "API Key is missing or invalid" : "Start Recording"}
                                style={apiKeyError ? { backgroundColor: '#800' } : {}}
                            >
                                Start Recording
                            </button>
                            <button
                                id="stopBtn"
                                onClick={handleStopRecording}
                                disabled={!isRecording}
                            >
                                Stop Recording
                            </button>
                        </div>
                         {apiKeyError && (
                            <p style={{ color: '#f44336', marginTop: '10px', fontSize: '0.9em' }}>
                                Error: API Key missing or invalid. Cannot start recording.
                            </p>
                         )}
                    </div>

                    {/* Report Section - Conditionally Rendered */}
                    {showReport && (
                        <div className="report-section">
                            <h3>Analysis Report</h3>

                            {/* Loader - Conditionally Rendered */}
                            {isProcessing && (
                                <div className="reportLoader">Generating Report... Please wait. This may take a moment.</div>
                            )}

                            {/* Report Content - Rendered when not processing */}
                            {!isProcessing && (
                                <div className="report-content">
                                    {/* Error Display */}
                                    {reportData.error && (
                                        // Added class for specific error styling via :global()
                                        <div className="report-part error-part">
                                            <h4>Error Generating Report</h4>
                                            <pre>{reportData.error}</pre>
                                        </div>
                                    )}

                                    {/* Report Parts (only if no error or showing raw response) */}
                                    {!reportData.error || reportData.error.includes("Raw response shown below") ? (
                                        <>
                                            {reportData.original && (
                                                <div className="report-part">
                                                    <h4>Original Transcript</h4>
                                                    <pre>{reportData.original}</pre>
                                                </div>
                                            )}
                                            {reportData.analysis && (
                                                <div className="report-part">
                                                    <h4>Detailed Analysis & Feedback</h4>
                                                    <pre>{reportData.analysis}</pre>
                                                </div>
                                            )}
                                            {reportData.grammar && (
                                                <div className="report-part">
                                                    <h4>Grammar & Phrasing Issues</h4>
                                                    <pre>{reportData.grammar}</pre>
                                                </div>
                                            )}
                                            {reportData.revision && (
                                                <div className="report-part">
                                                    <h4>Suggested Revision</h4>
                                                    <pre>{reportData.revision}</pre>
                                                </div>
                                            )}
                                        </>
                                    ) : null /* Don't show other parts if there's a fatal error */ }
                                </div>
                            )}

                            {/* Download Button - Rendered when not processing */}
                            {!isProcessing && (
                                <button
                                    className="downloadReportBtn"
                                    onClick={handleDownloadReport}
                                    disabled={reportButtonDisabled}
                                    title={reportButtonDisabled ? "Report not available or contains errors" : "Download Report as PDF"}
                                >
                                    Download Report as PDF
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Previous Videos Section (Sidebar) */}
                {/* Added class for easier targeting */}
                <div className="video-list-sidebar">
                    <h3>Previous Videos</h3>
                    {/* Container ID kept as is */}
                    <div id="videosContainer">
                        {/* Render video items from state */}
                        {recordedVideos.length === 0 && (
                            <p style={{ textAlign: 'center', color: '#aaa', marginTop: '20px' }}>No recordings yet.</p>
                        )}
                        {recordedVideos.map((video) => (
                            <div key={video.id} className="video-item">
                                <a href={video.url} title={`View ${video.name}`} target="_blank" rel="noopener noreferrer">
                                    {video.name}
                                </a>
                                <div className="video-controls">
                                    {/* Added specific classes for easier styling */}
                                    <button className="control-btn view" title={`View ${video.name}`} onClick={() => window.open(video.url, "_blank")}>View</button>
                                    <button className="control-btn download" title={`Download ${video.name}`} onClick={() => handleDownloadVideo(video)}>Download</button>
                                    <button className="control-btn delete" title={`Delete ${video.name}`} onClick={() => handleDeleteVideo(video.id)}>Delete</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </>
    );
}