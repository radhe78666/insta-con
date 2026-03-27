export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const DEEPGRAM_API_KEY = process.env.VITE_DEEPGRAM_API_KEY || process.env.DEEPGRAM_API_KEY;

  if (!DEEPGRAM_API_KEY) {
    console.error('Missing DEEPGRAM_API_KEY in environment variables');
    return res.status(500).json({ error: 'Deepgram Configuration Error' });
  }

  const { videoUrl } = req.body;

  if (!videoUrl) {
    return res.status(400).json({ error: 'Missing videoUrl parameter' });
  }

  // Construct our internal proxy url that Deepgram can fetch from
  // We explicitly use the request headers host to ensure we hit the live domain
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  const host = req.headers.host;
  const proxyUrl = `${protocol}://${host}/api/image-proxy?url=${encodeURIComponent(videoUrl)}`;

  try {
    const response = await fetch(
      'https://api.deepgram.com/v1/listen?smart_format=true&model=nova-2&language=en&detect_language=true&filler_words=true',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: proxyUrl }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Deepgram API returned an error:', errorText);
      throw new Error(`Deepgram failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Deepgram Proxy Error:', error);
    return res.status(500).json({ error: 'Failed to transcribe video' });
  }
}
