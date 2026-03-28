import { supabase } from '../lib/supabase';

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
