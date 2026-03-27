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

  const RAPIDAPI_KEY = process.env.VITE_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY;
  const RAPIDAPI_HOST = 'instagram120.p.rapidapi.com';

  if (!RAPIDAPI_KEY) {
    console.error('Missing RAPIDAPI_KEY in environment variables');
    return res.status(500).json({ error: 'API Configuration Error' });
  }

  const { action, payload } = req.body;

  if (!action || !payload) {
    return res.status(400).json({ error: 'Missing action or payload' });
  }

  try {
    const response = await fetch(`https://${RAPIDAPI_HOST}/api/instagram/${action}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-rapidapi-host': RAPIDAPI_HOST,
        'x-rapidapi-key': RAPIDAPI_KEY
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`RapidAPI failed: ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Instagram Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to fetch Instagram data' });
  }
}
