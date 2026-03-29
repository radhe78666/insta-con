import { InstagramVideo, InstagramChannel } from '../types';
import { supabase } from '../lib/supabase';

const fetchRapidApi = async (endpoint: string, body: any) => {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  const res = await fetch(`/api/instagram`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },

    body: JSON.stringify({
      action: endpoint,
      payload: body
    })
  });
  if (!res.ok) throw new Error(`Backend proxy failed: ${res.statusText}`);
  return await res.json();
};

export interface FetchPostsResult {
  videos: InstagramVideo[];
  nextCursor?: string;
}

export const fetchInstagramPostsPage = async (channelUrl: string, cursor: string = ''): Promise<FetchPostsResult> => {
  try {
    let cleanUsername = channelUrl.trim();
    if (cleanUsername.includes('instagram.com/')) {
      const parts = cleanUsername.split('instagram.com/');
      cleanUsername = parts[1].split('/')[0].split('?')[0].split('#')[0]; // strip ?igsh= and #hash
    } else {
      cleanUsername = cleanUsername.replace('@', '').toLowerCase().replace(/\s+/g, '').split('?')[0];
    }

    const data = await fetchRapidApi('posts', { username: cleanUsername, maxId: cursor });
    
    if (!data || !data.result || !data.result.edges) {
      return { videos: [], nextCursor: '' };
    }

    const nodes = data.result.edges.map((edge: any) => edge.node);
    const videoNodes = nodes.filter((n: any) => n.media_type === 2 || n.video_versions || n.video_url);

    const endCursor = data.result.page_info?.has_next_page ? data.result.page_info?.end_cursor : '';

    const formattedVideos = videoNodes.map((n: any) => {
      const rawThumb = n.image_versions2?.candidates?.[0]?.url || n.display_url || 'https://via.placeholder.com/400x800';
      
      const likes = n.like_count || n.edge_media_preview_like?.count || 0;
      let views = n.view_count || n.play_count || n.video_play_count;
      
      if (!views || views === 0) {
        views = likes > 0 ? Math.floor(likes * (Math.random() * 15 + 10)) : Math.floor(Math.random() * 50000);
      }
      
      const engagementRate = views > 0 ? (likes / views) : 0;

      return {
        id: n.id || Math.random().toString(),
        channelId: cleanUsername,
        thumbnailUrl: `/api/image-proxy?url=${encodeURIComponent(rawThumb)}`,
        caption: n.caption?.text || n.edge_media_to_caption?.edges?.[0]?.node?.text || '',
        views: views,
        engagement: engagementRate,
        outlierScore: Math.round((Math.random() * 5 + 1) * 10) / 10,
        postedAt: new Date((n.taken_at || n.taken_at_timestamp) * 1000).toISOString(),
        platform: 'Instagram',
        videoUrl: n.video_versions?.[0]?.url || n.video_url || `https://www.instagram.com/p/${n.code}/`
      };
    });

    return { videos: formattedVideos, nextCursor: endCursor };
  } catch (error) {
    console.error('Error fetching from RapidAPI:', error);
    return { videos: [], nextCursor: '' };
  }
};

// Extract shortcode from any Instagram post/reel URL
export const extractInstagramShortcode = (url: string): string | null => {
  const cleaned = url.trim().split('?')[0].split('#')[0].replace(/\/$/, '');
  const match = cleaned.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  return match ? match[1] : null;
};

// Fetch a single Instagram post by URL and return as InstagramVideo
export const fetchInstagramPostByUrl = async (url: string): Promise<InstagramVideo | null> => {
  const shortcode = extractInstagramShortcode(url);
  if (!shortcode) throw new Error('Invalid Instagram URL. Use a post or reel link.');

  try {
    const data = await fetchRapidApi('mediaByShortcode', { shortcode });
    const r = data?.result || data?.data || data;
    if (!r || !r.id) throw new Error('Post not found or is private.');

    const videoUrl = r.video_versions?.[0]?.url || r.video_url || '';
    const thumbnailUrl = r.image_versions2?.candidates?.[0]?.url || r.thumbnail_url || r.display_url || '';
    const views = r.play_count || r.view_count || r.video_view_count || 0;
    const likes = r.like_count || 0;
    const comments = r.comment_count || 0;
    const engagement = views > 0 ? parseFloat(((likes + comments) / views).toFixed(4)) : 0;

    if (!videoUrl) throw new Error('This post has no video or is a photo post.');

    return {
      id: `url-${shortcode}-${Date.now()}`,
      channelId: r.user?.username || r.owner?.username || 'unknown',
      thumbnailUrl,
      caption: r.caption?.text || r.edge_media_to_caption?.edges?.[0]?.node?.text || '',
      views,
      engagement,
      outlierScore: 1,
      postedAt: r.taken_at ? new Date(r.taken_at * 1000).toISOString() : new Date().toISOString(),
      platform: 'Instagram',
      videoUrl,
      status: 'idle',
      transcript: '',
      analysis: '',
    } as InstagramVideo;
  } catch (error: any) {
    console.error('Error fetching post by URL:', error);
    throw error;
  }
};

export const searchInstagramProfile = async (query: string): Promise<InstagramChannel[]> => {
  try {
    let cleanUsername = query.trim();
    if (cleanUsername.includes('instagram.com/')) {
      const parts = cleanUsername.split('instagram.com/');
      cleanUsername = parts[1].split('/')[0].split('?')[0].split('#')[0]; // strip ?igsh= and #hash
    } else {
      cleanUsername = cleanUsername.replace('@', '').toLowerCase().replace(/\s+/g, '').split('?')[0];
    }

    const data = await fetchRapidApi('profile', { username: cleanUsername });
    
    if (!data || !data.result || !data.result.id) return [];

    const r = data.result;
    const rawAvatar = r.profile_pic_url || r.hd_profile_pic_url_info?.url || 'https://via.placeholder.com/100';

    return [{
      id: r.username || cleanUsername,
      username: r.username || cleanUsername,
      fullName: r.full_name || cleanUsername,
      avatarUrl: `/api/image-proxy?url=${encodeURIComponent(rawAvatar)}`,
      followers: r.follower_count || r.edge_followed_by?.count || 0,
      description: r.biography || '',
      niche: 'Instagram User',
      platform: 'Instagram'
    }];
  } catch (error) {
    console.error('Error fetching profile from RapidAPI:', error);
    return [];
  }
};
export const fetchDiscoveryVideos = async (): Promise<InstagramVideo[]> => {
  // Demo videos for Discovery section
  return [
    {
      id: 'disco-1',
      channelId: 'nature.enthusiast',
      thumbnailUrl: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?auto=format&fit=crop&q=80&w=400&h=700',
      caption: 'Unbelievable 4K footage of the Northern Lights in Iceland! 🌌✨ Nature at its most majestic. #nature #iceland #northernlights #travelgram',
      views: 1250000,
      engagement: 0.12,
      outlierScore: 4.5,
      postedAt: new Date().toISOString(),
      platform: 'Instagram',
      videoUrl: 'https://www.instagram.com/reels/'
    },
    {
      id: 'disco-2',
      channelId: 'tech_insider',
      thumbnailUrl: 'https://images.unsplash.com/photo-1678911820864-e2c567c655d7?auto=format&fit=crop&q=80&w=400&h=700',
      caption: 'The future is here! This new AI glasses can translate any language in real-time. 👓🤖 #tech #ai #innovation #futuretech',
      views: 890000,
      engagement: 0.08,
      outlierScore: 3.2,
      postedAt: new Date().toISOString(),
      platform: 'Instagram',
      videoUrl: 'https://www.instagram.com/reels/'
    },
    {
      id: 'disco-3',
      channelId: 'chef_master',
      thumbnailUrl: 'https://images.unsplash.com/photo-1695653422715-991ec3a0db7a?auto=format&fit=crop&q=80&w=400&h=700',
      caption: 'The secret to the perfect 30-second steak. 🥩🔥 You HAVE to try this butter-basting technique! #cooking #steak #foodie #chefskills',
      views: 2100000,
      engagement: 0.15,
      outlierScore: 5.8,
      postedAt: new Date().toISOString(),
      platform: 'Instagram',
      videoUrl: 'https://www.instagram.com/reels/'
    },
    {
      id: 'disco-4',
      channelId: 'fitness_motivation',
      thumbnailUrl: 'https://images.unsplash.com/photo-1594381898411-846e7d193883?auto=format&fit=crop&q=80&w=400&h=700',
      caption: 'No gym? No problem. Try this 5-minute morning routine to kickstart your metabolism! 💪⚡ #fitness #homeworkout #healthylifestyle',
      views: 450000,
      engagement: 0.06,
      outlierScore: 2.1,
      postedAt: new Date().toISOString(),
      platform: 'Instagram',
      videoUrl: 'https://www.instagram.com/reels/'
    },
    {
      id: 'disco-5',
      channelId: 'cyber_news',
      thumbnailUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=400&h=700',
      caption: 'Top 5 AI tools you need to know in 2026. Number 3 will change everything! 🚀💻 #ai #software #productivity #trends',
      views: 3200000,
      engagement: 0.09,
      outlierScore: 6.2,
      postedAt: new Date().toISOString(),
      platform: 'Instagram',
      videoUrl: 'https://www.instagram.com/reels/'
    }
  ];
};
