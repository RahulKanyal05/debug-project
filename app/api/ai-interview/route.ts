import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const action = formData.get("action");

    // --- CASE 1: GENERATE QUESTIONS (Unchanged) ---
    if (action === "generate_questions") {
      const file = formData.get("file") as File;
      const role = formData.get("role") as string;
      const difficulty = formData.get("difficulty") as string;

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
        response_format: { type: "json_object" }, // <--- FORCE JSON
      });

      const text = completion.choices[0]?.message?.content || "{}";
      const parsed = JSON.parse(text);

      return NextResponse.json({ questions: parsed.questions || [] });
    }

    // --- CASE 2: ANALYZE ANSWER (The Fix) ---
    if (action === "analyze_answer") {
      const question = formData.get("question") as string;
      const answer = formData.get("answer") as string;

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
          response_format: { type: "json_object" }, // <--- FORCE JSON
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

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return NextResponse.json({ error: "Server Error", details: String(error) }, { status: 500 });
  }
}