import { GoogleGenerativeAI } from "@google/generative-ai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export interface AIAnalysis {
  summary: string;
  hooks: {
    formula: string;
    text: string;
    analysis: string;
  }[];
  idea_analysis: {
    topic: string;
    idea_seed: string;
    unique_angle: string;
    common_belief_to_challenge: string;
    contrarian_reality: string;
  };
  storytelling: {
    category: string;
    description: string;
    analysis: string;
  };
  visual_layout: {
    category: string;
    sub_category: string;
    visual_elements: string[];
  };
}

export const analyzeTranscript = async (transcript: string): Promise<AIAnalysis> => {
  if (!GEMINI_API_KEY) {
    throw new Error('Gemini API key is missing');
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    Analyze the following video transcript and provide a structured JSON response in English ONLY. 
    The response must strictly follow this JSON structure:
    {
      "summary": "Full summary of the video content",
      "hooks": [{"formula": "The pattern used", "text": "The actual hook used", "analysis": "Why it works"}],
      "idea_analysis": {
        "topic": "Main subject",
        "idea_seed": "The core idea",
        "unique_angle": "What makes it different",
        "common_belief_to_challenge": "What people usually think",
        "contrarian_reality": "The truth exposed in the video"
      },
      "storytelling": {
        "category": "e.g. Case Study, Personal Story, Tutorial",
        "description": "How the story is told",
        "analysis": "Effectiveness of this style"
      },
      "visual_layout": {
        "category": "e.g. Studio, Outdoor, Screen Share",
        "sub_category": "e.g. Podcast, Vlog, Documentary",
        "visual_elements": ["List of key visual components"]
      }
    }

    Transcript: "${transcript.replace(/"/g, '\\"')}"
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Clean JSON from potential markdown markers
    const jsonString = text.replace(/```json|```/g, "").trim();
    return JSON.parse(jsonString) as AIAnalysis;
  } catch (error) {
    console.error('AI Analysis Error:', error);
    throw error;
  }
};
