import { supabase } from '../lib/supabase';

export interface TranscriptionResponse {
  transcript: string;
  language: string;
  confidence: number;
  words: any[];
}

export const transcribeVideo = async (videoUrl: string): Promise<TranscriptionResponse> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

    const response = await fetch('/api/transcribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      },

      body: JSON.stringify({ videoUrl }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Transcription API failed: ${errorText}`);
    }

    const data = await response.json();
    return {
      transcript: data.results?.channels[0]?.alternatives[0]?.transcript || '',
      language: data.results?.channels[0]?.detected_language || 'en',
      confidence: data.results?.channels[0]?.alternatives[0]?.confidence || 0,
      words: data.results?.channels[0]?.alternatives[0]?.words || [],
    };
  } catch (error) {
    console.error('Transcription Error:', error);
    throw error;
  }
};

