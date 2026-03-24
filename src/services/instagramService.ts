import { ApifyClient } from 'apify-client';
import { InstagramVideo } from '../types';

const APIFY_TOKEN = import.meta.env.VITE_APIFY_TOKEN;

export const fetchInstagramPosts = async (profileUrl: string): Promise<InstagramVideo[]> => {
  try {
    const client = new ApifyClient({ token: APIFY_TOKEN });
    
    const input = {
      directUrls: [profileUrl],
      resultsType: "posts",
      resultsLimit: 20, // Keep limit small to run faster
      searchType: "hashtag",
      searchLimit: 1,
      addParentData: false
    };

    console.log('Starting Apify Actor for:', profileUrl);
    // Run the Actor and wait for it to finish
    const run = await client.actor("shu8hvrXbJbY3Eb9W").call(input);

    console.log('Fetching results from dataset...', run.defaultDatasetId);
    const { items } = await client.dataset(run.defaultDatasetId).listItems();

    // Map Apify output to InstagramVideo types
    const formattedVideos: InstagramVideo[] = items.map((item: any) => ({
      id: item.id || Math.random().toString(36).substr(2, 9),
      channelId: item.ownerUsername || 'unknown',
      thumbnailUrl: item.displayUrl || item.thumbnailSrc || 'https://via.placeholder.com/400x800',
      caption: item.caption || '',
      views: item.viewCount || Math.floor(Math.random() * 50000),
      engagement: ((item.likesCount || 0) + (item.commentsCount || 0)) / (item.viewCount || 1000),
      outlierScore: Math.round((Math.random() * 5 + 1) * 10) / 10, // Mock outlier score for now
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
