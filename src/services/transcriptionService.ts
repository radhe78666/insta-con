const DEEPGRAM_API_KEY = import.meta.env.VITE_DEEPGRAM_API_KEY;

export interface TranscriptionResponse {
  transcript: string;
  language: string;
  confidence: number;
  words: any[];
}

export const transcribeVideo = async (videoUrl: string): Promise<TranscriptionResponse> => {
  if (!DEEPGRAM_API_KEY) {
    throw new Error('Deepgram API key is missing');
  }

  // We use our proxy to avoid CORS issues with Instagram
  const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(videoUrl)}`;

  try {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&language=en&detect_language=true&filler_words=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: `https://insta-con.vercel.app${proxyUrl}` }), // Deepgram can fetch from our proxy if it's public
      }
    );

    // If Deepgram can't fetch directly, we fetch and send as blob
    if (!response.ok) {
      const mediaResponse = await fetch(proxyUrl);
      const blob = await mediaResponse.blob();
      
      const uploadResponse = await fetch(
        'https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&detect_language=true&filler_words=true',
        {
          method: 'POST',
          headers: {
            'Authorization': `Token ${DEEPGRAM_API_KEY}`,
            'Content-Type': blob.type || 'video/mp4',
          },
          body: blob,
        }
      );

      if (!uploadResponse.ok) {
        const error = await uploadResponse.json();
        throw new Error(error.err_msg || 'Transcription failed');
      }

      const data = await uploadResponse.json();
      return {
        transcript: data.results.channels[0].alternatives[0].transcript,
        language: data.results.channels[0].detected_language || 'en',
        confidence: data.results.channels[0].alternatives[0].confidence,
        words: data.results.channels[0].alternatives[0].words,
      };
    }

    const data = await response.json();
    return {
      transcript: data.results.channels[0].alternatives[0].transcript,
      language: data.results.channels[0].detected_language || 'en',
      confidence: data.results.channels[0].alternatives[0].confidence,
      words: data.results.channels[0].alternatives[0].words,
    };
  } catch (error) {
    console.error('Transcription Error:', error);
    throw error;
  }
};
