import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function generateTranscript(videoUrl: string) {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a realistic transcript and analysis for an Instagram Reel with this URL: ${videoUrl}. 
      The analysis should include:
      1. Hook analysis
      2. Content summary
      3. Viral potential score (1-10)
      4. Key keywords used.
      Format the output as JSON with fields: transcript, hookAnalysis, summary, viralScore, keywords.`,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Error generating transcript:", error);
    return {
      transcript: "Error generating transcript. Please try again.",
      hookAnalysis: "N/A",
      summary: "N/A",
      viralScore: 0,
      keywords: []
    };
  }
}
