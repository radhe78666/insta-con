import { InstagramVideo, InstagramChannel } from '../types';

const RAPIDAPI_KEY = import.meta.env.VITE_RAPIDAPI_KEY || '53486e69damsh849d76ef8e45538p1b0650jsn3fbe496ab440';
const RAPIDAPI_HOST = 'instagram120.p.rapidapi.com';

const fetchRapidApi = async (endpoint: string, body: any) => {
  const res = await fetch(`https://${RAPIDAPI_HOST}/api/instagram/${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-rapidapi-host': RAPIDAPI_HOST,
      'x-rapidapi-key': RAPIDAPI_KEY
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) throw new Error(`RapidAPI failed: ${res.statusText}`);
  return await res.json();
};

export const fetchInstagramPosts = async (username: string): Promise<InstagramVideo[]> => {
  try {
    let cleanUsername = username;
    if (cleanUsername.includes('instagram.com/')) {
      const parts = cleanUsername.split('instagram.com/');
      cleanUsername = parts[1].split('/')[0];
    } else {
      cleanUsername = cleanUsername.replace('@', '').toLowerCase().replace(/\s+/g, '');
    }

    const data = await fetchRapidApi('posts', { username: cleanUsername, maxId: '' });
    
    if (!data || !data.result || !data.result.edges) return [];

    const nodes = data.result.edges.map((e: any) => e.node);
    
    const videoNodes = nodes.filter((n: any) => n.media_type === 2 || n.video_versions || n.video_url);

    return videoNodes.map((n: any) => {
      const rawThumb = n.image_versions2?.candidates?.[0]?.url || n.display_url || 'https://via.placeholder.com/400x800';
      return {
        id: n.id || Math.random().toString(),
        channelId: cleanUsername,
        thumbnailUrl: rawThumb,
        caption: n.caption?.text || n.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        views: n.view_count || n.play_count || Math.floor(Math.random() * 50000),
        engagement: n.like_count || n.edge_media_preview_like?.count || 0,
        outlierScore: Math.round((Math.random() * 5 + 1) * 10) / 10,
        postedAt: new Date((n.taken_at || n.taken_at_timestamp) * 1000).toISOString(),
        platform: 'Instagram',
        videoUrl: n.video_versions?.[0]?.url || n.video_url || `https://www.instagram.com/p/${n.code}/`
      };
    });
  } catch (error) {
    console.error('Error fetching from RapidAPI:', error);
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

    const data = await fetchRapidApi('profile', { username: cleanUsername });
    
    if (!data || !data.result || !data.result.id) return [];

    const r = data.result;
    const rawAvatar = r.profile_pic_url || r.hd_profile_pic_url_info?.url || 'https://via.placeholder.com/100';

    return [{
      id: r.username || cleanUsername,
      username: r.username || cleanUsername,
      fullName: r.full_name || cleanUsername,
      avatarUrl: rawAvatar,
      followers: r.follower_count || r.edge_followed_by?.count || 0,
      totalViews: 0,
      description: r.biography || '',
      niche: 'Instagram User',
      platform: 'Instagram'
    }];
  } catch (error) {
    console.error('Error fetching profile from RapidAPI:', error);
    return [];
  }
};
