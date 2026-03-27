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

  const GEMINI_API_KEY = (process.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || 'AIzaSyAPSKmpr2TRnFok2ySBS1EzPZc4kEZPFEI').trim();

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
    Analyze the following video transcript and extract the key elements. You MUST MUST MUST respond with a valid JSON block, and absolutely NOTHING ELSE. Do not include markdown formatting or backticks around the json. The output must strictly follow this JSON structure in English:
    
    {
      "hook": {
        "formula": "Brief formula string (e.g., Question + Benefit)",
        "explanation": "Why this specific hook works to retain the viewer.",
        "text": "The exact hook sentence from the transcript."
      },
      "idea": {
        "topic": "The main overarching topic of the video.",
        "seeds": ["Idea variation 1", "Idea variation 2"],
        "summary": "A 1-2 sentence summary of the core premise."
      },
      "storytelling": {
        "category": "One of: Educational, Entertainment, Storytime, Rant, Listicle",
        "analysis": "How the creator structures the narrative."
      },
      "layout": {
        "scene": "What kind of footage is shown (e.g., Talking Head, B-roll overlay)",
        "visuals": ["Visual element 1", "Visual element 2"]
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
