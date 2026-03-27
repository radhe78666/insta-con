import { GoogleGenerativeAI } from "@google/generative-ai";
import { createClient } from "@supabase/supabase-js";

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // --- STRICT AUTHENTICATION CHECK ---
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }
  const token = authHeader.split(' ')[1];
  
  const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://lcqeztfevcierlmeecjh.supabase.co';
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxjcWV6dGZldmNpZXJsbWVlY2poIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMyMjM0MzEsImV4cCI6MjA4ODc5OTQzMX0.j8YDRU9zl96k4j6Ba_dFgXQoHsMFSud5aaPg9-fMR-M';
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token session' });
  }
  // -----------------------------------

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
