import { supabase } from '../lib/supabase';

export interface AIAnalysis {
  hook: {
    formula: string;
    explanation: string;
    text: string;
  };
  idea: {
    topic: string;
    seeds: string[];
    summary: string;
  };
  storytelling: {
    category: string;
    analysis: string;
  };
  layout: {
    scene: string;
    visuals: string[];
  };
}

export const analyzeContent = async (transcript: string): Promise<AIAnalysis> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },

      body: JSON.stringify({ transcript }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`AI Analysis API failed: ${errorText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Gemini Analysis Error:', error);
    throw error;
  }
};
