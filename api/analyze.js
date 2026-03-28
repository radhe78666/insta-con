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
    return res.status(500).json({ error: 'Gemini Configuration Error: No API key found' });
  }

  const { transcript } = req.body;

  if (!transcript) {
    return res.status(400).json({ error: 'Missing transcript parameter' });
  }

  const prompt = `Analyze the following video transcript and extract the key elements. You MUST respond with a valid JSON block, and absolutely NOTHING ELSE. Do not include markdown formatting or backticks around the json. The output must strictly follow this JSON structure in English:
    
{
  "summary": "Full summary of the video content",
  "hooks": [
    {
      "formula": "The pattern used (e.g. Question + Benefit)",
      "text": "The actual hook used",
      "analysis": "Why it works"
    }
  ],
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
${transcript}`;

  // Use direct REST API instead of SDK to avoid v1beta endpoint issues
  // Try newer models first (v1 endpoint), then fall back to older models (v1beta)
  const modelsToTry = [
    { model: 'gemini-2.0-flash', apiVersion: 'v1' },
    { model: 'gemini-2.0-flash-001', apiVersion: 'v1' },
    { model: 'gemini-1.5-flash', apiVersion: 'v1beta' },
    { model: 'gemini-1.5-flash-latest', apiVersion: 'v1beta' },
  ];

  let lastError = null;

  for (const { model, apiVersion } of modelsToTry) {
    try {
      console.log(`Trying model: ${model} (${apiVersion})`);
      
      const apiUrl = `https://generativelanguage.googleapis.com/${apiVersion}/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 2048 }
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        console.warn(`Model ${model} failed with ${response.status}:`, errText.substring(0, 100));
        lastError = new Error(`${model}: ${response.status} ${response.statusText}`);
        continue;
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!text) {
        console.warn(`Model ${model} returned empty response`);
        lastError = new Error(`${model}: empty response`);
        continue;
      }

      console.log(`Success with model: ${model}`);
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const jsonResult = JSON.parse(cleanJson);
      return res.status(200).json(jsonResult);

    } catch (err) {
      console.warn(`Model ${model} threw error:`, err.message);
      lastError = err;
    }
  }

  console.error('All Gemini models failed. Last error:', lastError?.message);
  return res.status(500).json({ error: lastError?.message || 'All AI models failed' });
}
