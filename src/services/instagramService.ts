import { InstagramVideo, InstagramChannel } from '../types';

const APIFY_TOKEN = import.meta.env.VITE_APIFY_TOKEN;

export const fetchInstagramPosts = async (profileUrl: string): Promise<InstagramVideo[]> => {
  try {
    const input = {
      directUrls: [profileUrl],
      resultsType: "posts",
      resultsLimit: 20,
      searchType: "hashtag",
      searchLimit: 1,
      addParentData: false
    };

    console.log('Starting Apify Actor for:', profileUrl);
    
    // 1. Run the actor
    const runRes = await fetch(`https://api.apify.com/v2/acts/shu8hvrXbJbY3Eb9W/runs?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    
    if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.statusText}`);
    
    const runData = await runRes.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    console.log('Fetching results from dataset...', datasetId);
    
    // 2. Poll for completion
    let status = runData.data.status;
    let attempts = 0;
    while (status !== 'SUCCEEDED' && attempts < 20) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      const statusData = await statusRes.json();
      status = statusData.data.status;
      if (status === 'FAILED' || status === 'ABORTED') {
        throw new Error(`Actor run failed with status: ${status}`);
      }
      attempts++;
    }

    // 3. Fetch dataset items
    const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
    const items = await datasetRes.json();

    const formattedVideos: InstagramVideo[] = items.map((item: any) => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      channelId: item.ownerUsername || 'unknown',
      thumbnailUrl: item.displayUrl || item.thumbnailSrc || 'https://via.placeholder.com/400x800',
      caption: item.caption || '',
      views: item.viewCount || Math.floor(Math.random() * 50000),
      engagement: ((item.likesCount || 0) + (item.commentsCount || 0)) / (item.viewCount || 1000),
      outlierScore: Math.round((Math.random() * 5 + 1) * 10) / 10,
      postedAt: item.timestamp || new Date().toISOString(),
      platform: 'Instagram',
      videoUrl: item.videoUrl || item.url || profileUrl,
    }));

    return formattedVideos;
  } catch (error) {
    console.error('Error fetching from Apify:', error);
    return [];
  }
};

export const searchInstagramProfile = async (query: string): Promise<InstagramChannel[]> => {
  try {
    let cleanUsername = query.trim();
    if (cleanUsername.includes('instagram.com/')) {
      const parts = cleanUsername.split('instagram.com/');
      cleanUsername = parts[1].split('/')[0];
    } else {
      cleanUsername = cleanUsername.replace('@', '').toLowerCase().replace(/\s+/g, '');
    }

    const profileUrl = `https://www.instagram.com/${cleanUsername}/`;
    
    let input: any = {
      directUrls: [profileUrl],
      resultsType: "details",
      resultsLimit: 1,
      addParentData: false
    };

    console.log('Starting Apify Actor for profile details:', profileUrl);
    
    const runRes = await fetch(`https://api.apify.com/v2/acts/shu8hvrXbJbY3Eb9W/runs?token=${APIFY_TOKEN}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input)
    });
    
    if (!runRes.ok) throw new Error(`Apify run failed: ${runRes.statusText}`);
    
    const runData = await runRes.json();
    const runId = runData.data.id;
    const datasetId = runData.data.defaultDatasetId;

    let status = runData.data.status;
    let attempts = 0;
    while (status !== 'SUCCEEDED' && attempts < 25) {
      await new Promise(resolve => setTimeout(resolve, 3000));
      const statusRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${APIFY_TOKEN}`);
      const statusData = await statusRes.json();
      status = statusData.data.status;
      if (status === 'FAILED' || status === 'ABORTED') {
        throw new Error(`Actor run failed with status: ${status}`);
      }
      attempts++;
    }

    const datasetRes = await fetch(`https://api.apify.com/v2/datasets/${datasetId}/items?token=${APIFY_TOKEN}`);
    const items = await datasetRes.json();

    if (!items || items.length === 0) return [];

    return items.slice(0, 5).map((item: any) => ({
      id: item.id || item.username || Math.random().toString(),
      username: item.username || 'unknown',
      fullName: item.fullName || item.username || 'Unknown',
      avatarUrl: item.profilePicUrl || item.profilePicUrlHD || 'https://via.placeholder.com/100',
      followers: item.followersCount || 0,
      totalViews: 0,
      description: item.biography || '',
      niche: 'Instagram User',
      platform: 'Instagram'
    }));
  } catch (error) {
    console.error('Error fetching profile from Apify:', error);
    return [];
  }
};
