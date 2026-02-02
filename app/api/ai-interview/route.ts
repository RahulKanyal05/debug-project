import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

// 1. Define your model hierarchy (Best -> Backup)
const MODELS = [
  "gemini-3-flash-preview", // Try the newest first
  "gemini-2.5-flash-latest", // Fallback to what you know works
  "gemini-1.5-flash"        // Last resort
];

async function generateWithFallback(prompt: string) {
  let lastError;

  for (const modelName of MODELS) {
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text(); // If success, return immediately
    } catch (error) {
      console.warn(`Model ${modelName} failed. Trying next...`);
      lastError = error;
      // Continue to next model in loop
    }
  }
  throw lastError; // If all fail, crash.
}

export async function POST(req: Request) {
  try {
    const { action, data } = await req.json();

    // --- CASE 1: GENERATE QUESTIONS ---
    if (action === "generate_questions") {
      const prompt = `
        You are an expert technical interviewer. 
        Generate 3 challenging interview questions for a "${data.role}" role. 
        Focus on: ${data.topic || "General Technical Skills"}.
        
        IMPORTANT: Return ONLY a raw JSON array of strings. 
        Do not add any markdown, no code blocks, no introductory text.
        Example: ["Question 1", "Question 2", "Question 3"]
      `;
      
      const text = await generateWithFallback(prompt);
      
      // Clean up markdown just in case
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) throw new Error("AI did not return a valid JSON array");
      
      return NextResponse.json({ questions: JSON.parse(jsonMatch[0]) });
    }

    // --- CASE 2: ANALYZE ANSWER ---
    if (action === "analyze_answer") {
      const prompt = `
        You are an interview coach.
        Question: "${data.question}"
        Candidate Answer: "${data.answer}"

        Analyze this answer. Return a JSON object with:
        1. "grammarFix": Correct the grammar (string).
        2. "betterAnswer": A better version using STAR method (string).
        3. "score": A score out of 100 based on relevance and depth (number).
        
        Return ONLY raw JSON.
      `;

      const text = await generateWithFallback(prompt);

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) throw new Error("AI did not return a valid JSON object");

      return NextResponse.json({ feedback: JSON.parse(jsonMatch[0]) });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  } catch (error) {
    console.error("AI Error:", error);
    return NextResponse.json({ 
      error: "Failed to process request", 
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 });
  }
}