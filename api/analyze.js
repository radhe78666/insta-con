import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const GEMINI_API_KEY = process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    console.error('Missing GEMINI_API_KEY in environment variables');
    return res.status(500).json({ error: 'Gemini Configuration Error' });
  }

  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript parameter' });
  }

  try {
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
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
    
    TRANSCRIPT:
    "${transcript.replace(/"/g, '\\"')}"
    `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    const cleanJsonString = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const jsonResult = JSON.parse(cleanJsonString);

    return res.status(200).json(jsonResult);
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    return res.status(500).json({ error: 'Failed to analyze transcript' });
  }
}
