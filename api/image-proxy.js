export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'Missing url parameter' });
  }

  // SSRF Protection: Only allow Instagram/Facebook CDNs
  try {
    const targetUrl = new URL(url);
    const validDomains = ['instagram.com', 'cdninstagram.com', 'fbcdn.net'];
    const isAllowed = validDomains.some(domain => targetUrl.hostname.endsWith(domain));
    
    if (!isAllowed) {
      return res.status(403).json({ error: 'Proxy access denied for this domain' });
    }
  } catch (e) {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  // Set strict CORS based on request origin
  const origin = req.headers.origin || '';
  const allowedOrigins = ['http://localhost:5173', 'https://insta-con.vercel.app'];
  
  // If no origin (Server-to-Server like Deepgram) or matching origin, allow it
  if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
    res.setHeader('Access-Control-Allow-Origin', origin || '*');
  } else {
    return res.status(403).json({ error: 'CORS policy violation' });
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Sec-Fetch-Site': 'cross-site',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Dest': 'video'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: `Failed to fetch media: ${response.statusText}` });
    }

    const contentType = response.headers.get('content-type');
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    res.setHeader('Content-Type', contentType || 'application/octet-stream');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    
    return res.send(buffer);
  } catch (error) {
    console.error('Proxy Error:', error);
    return res.status(500).json({ error: 'Internal Server Error fetching media' });
  }
}
