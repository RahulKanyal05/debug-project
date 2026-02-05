import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    // Try JSON first, fallback to FormData
    let action, data;
    const contentType = req.headers.get("content-type");

    if (contentType?.includes("application/json")) {
      data = await req.json();
      action = data.action;
    } else {
      const formData = await req.formData();
      action = formData.get("action");
      data = formData;
    }

    // --- CASE 1: GENERATE QUESTIONS (Unchanged) ---
    if (action === "generate_questions") {
      const file = data.get("file") as File;
      const role = data.get("role") as string;
      const difficulty = data.get("difficulty") as string;

      if (!file) return NextResponse.json({ error: "No resume provided" }, { status: 400 });

      let resumeText = "";
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        // @ts-ignore
        const PDFParser = require("pdf2json");
        const parser = new PDFParser(null, 1);

        resumeText = await new Promise((resolve, reject) => {
          parser.on("pdfParser_dataError", (errData: any) => reject(errData.parserError));
          parser.on("pdfParser_dataReady", () => resolve(parser.getRawTextContent()));
          parser.parseBuffer(buffer);
        }) as string;
        resumeText = resumeText.slice(0, 6000);
      } catch (e) {
        console.error("PDF Parsing Failed:", e);
        resumeText = `(Parsing failed). Role: ${role}`;
      }

      const prompt = `
        You are a technical interviewer. 
        Role: ${role}
        Difficulty: ${difficulty || "Mid-Level"}
        Resume Context: "${resumeText}"
        
        Generate exactly 3 Technical Interview Questions.
        
        STRUCTURE:
        1. Questions 1-2: DIRECT DEFINITIONS (Short).
        2. Questions 3: TECHNICAL DEEP DIVE based on resume(short).

        IMPORTANT: Return a JSON Object with a "questions" key containing an array of strings.
        Example: { "questions": ["Define X", "What is Y", ...] }
      `;

      // Enable JSON Mode
      const completion = await groq.chat.completions.create({
        messages: [
          { role: "system", content: "You are an API that outputs strict JSON." },
          { role: "user", content: prompt }
        ],
        model: "qwen/qwen3-32b",
        response_format: { type: "json_object" },
      });

      const text = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(text);

      return NextResponse.json({ questions: parsed.questions || [] });
    }

    // --- CASE 2: ANALYZE ANSWER (Unchanged) ---
    if (action === "analyze_answer") {
      const question = data.get("question") as string;
      const answer = data.get("answer") as string;

      const prompt = `
        You are an interview coach.
        Question: "${question}"
        Candidate Answer: "${answer || "No answer provided."}"

        Analyze this answer.
        Return a JSON object with exactly these keys:
        {
          "grammarFix": "Correct the grammar (string).",
          "betterAnswer": "A better version using STAR method (string).",
          "score": 50 (number)
        }
      `;

      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are an API that outputs strict JSON." },
            { role: "user", content: prompt }
          ],
          model: "qwen/qwen3-32b",
          response_format: { type: "json_object" },
        });

        const text = completion.choices[0]?.message?.content || "{}";
        const feedbackData = JSON.parse(text);

        // Robust Key Checking (Handles synonyms)
        const finalFeedback = {
          grammarFix: feedbackData.grammarFix || feedbackData.grammar_fix || "No grammar issues found.",
          betterAnswer: feedbackData.betterAnswer || feedbackData.better_answer || feedbackData.improved_answer || "No improved answer generated.",
          score: feedbackData.score || 0
        };

        return NextResponse.json({ feedback: finalFeedback });

      } catch (error) {
        console.error("Analysis Error:", error);
        return NextResponse.json({
          feedback: {
            grammarFix: "Error analyzing answer.",
            betterAnswer: "Could not connect to AI.",
            score: 0
          }
        });
      }
    }

    // --- CASE 3: ANALYZE INTRODUCTION (NEW) ---
    if (action === "analyze_intro") {
      const transcript = contentType?.includes("application/json")
        ? data.transcript
        : data.get("transcript") as string;

      if (!transcript || transcript.trim().length < 5) {
        return NextResponse.json(
          { error: "Transcript is required and must be at least 5 characters" },
          { status: 400 }
        );
      }

      const prompt = `
        You are a professional interview coach analyzing a self-introduction.
        
        Candidate's Introduction: "${transcript}"
        
        Analyze this introduction and provide feedback.
        Return a JSON object with exactly these keys:
        {
          "analysis": "Detailed feedback on content, structure, confidence, and delivery (2-3 sentences)",
          "grammarFix": "Grammar corrections and tips on filler words (1-2 sentences)",
          "revision": "An improved version of the introduction following best practices (2-3 sentences)",
          "score": 75 (number from 0-100)
        }
        
        Consider:
        - Does it include a greeting, name, role/background, and key skills?
        - Are there filler words (um, uh, like, you know)?
        - Is the length appropriate (30-60 seconds when spoken)?
        - Does it show confidence and clarity?
        - Does it end with a value proposition or goal?
        
        Be constructive and encouraging in your feedback.
      `;

      try {
        const completion = await groq.chat.completions.create({
          messages: [
            { role: "system", content: "You are an API that outputs strict JSON. Be encouraging and constructive." },
            { role: "user", content: prompt }
          ],
          model: "qwen/qwen3-32b",
          response_format: { type: "json_object" },
          temperature: 0.7,
        });

        const text = completion.choices[0]?.message?.content || "{}";
        const feedbackData = JSON.parse(text);

        // Calculate basic metrics for additional context
        const wordCount = transcript.split(/\s+/).length;
        const hasFillerWords = /\b(um|uh|like|you know|actually|basically)\b/gi;
        const fillerMatches = transcript.match(hasFillerWords) || [];

        // Robust Key Checking
        const finalFeedback = {
          analysis: feedbackData.analysis || feedbackData.feedback || "Your introduction was recorded successfully.",
          grammarFix: feedbackData.grammarFix || feedbackData.grammar_fix || feedbackData.grammar || "No major grammar issues found.",
          revision: feedbackData.revision || feedbackData.improved_version || feedbackData.betterAnswer || transcript,
          score: feedbackData.score || 75,
          metrics: {
            wordCount,
            fillerWordCount: fillerMatches.length,
            estimatedDuration: Math.round(wordCount / 2.5) + " seconds"
          }
        };

        return NextResponse.json({
          success: true,
          feedback: finalFeedback
        });

      } catch (error) {
        console.error("Introduction Analysis Error:", error);

        // Fallback analysis if AI fails
        const wordCount = transcript.split(/\s+/).length;
        const hasFillerWords = /\b(um|uh|like|you know|actually)\b/gi;
        const fillerMatches = transcript.match(hasFillerWords) || [];

        let fallbackAnalysis = "";
        if (wordCount < 20) {
          fallbackAnalysis = "Your introduction is brief. Consider expanding on your background and skills.";
        } else if (wordCount > 120) {
          fallbackAnalysis = "Your introduction is comprehensive. Consider condensing to key points.";
        } else {
          fallbackAnalysis = "Good length! Make sure you covered who you are, your skills, and your goals.";
        }

        if (fillerMatches.length > 3) {
          fallbackAnalysis += ` Try to reduce filler words - you used ${fillerMatches.length}.`;
        }

        return NextResponse.json({
          success: true,
          feedback: {
            analysis: fallbackAnalysis,
            grammarFix: fillerMatches.length > 0
              ? `Tip: Try pausing instead of using filler words like ${fillerMatches.slice(0, 3).join(', ')}.`
              : "No obvious grammar issues detected.",
            revision: `Structure suggestion: "Hello, I'm [Name]. I'm a [Role] with experience in [Field]. I specialize in [Skills]. I'm passionate about [Interest] and looking to [Goal]."`,
            score: Math.max(50, 100 - (fillerMatches.length * 5) - (wordCount < 20 ? 20 : 0)),
            metrics: {
              wordCount,
              fillerWordCount: fillerMatches.length,
              estimatedDuration: Math.round(wordCount / 2.5) + " seconds"
            }
          }
        });
      }
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({
      error: "Server Error",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}