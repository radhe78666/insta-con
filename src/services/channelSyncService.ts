import { supabase } from '../lib/supabase';
import { fetchInstagramPostsPage } from './instagramService';

export interface SyncProgress {
  username: string;
  fetched: number;
  target: number;
  status: 'pending' | 'syncing' | 'completed' | 'failed';
  last_synced_at?: string;
}

const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

/**
 * Delay utility
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Fetch a single page with retry logic
 */
async function fetchPageWithRetry(username: string, cursor: string, retries = MAX_RETRIES): Promise<{ videos: any[]; nextCursor?: string }> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const result = await fetchInstagramPostsPage(username, cursor);
      return result;
    } catch (error: any) {
      console.warn(`[Sync] Page fetch attempt ${attempt}/${retries} failed for ${username}:`, error.message);
      if (attempt < retries) {
        await delay(RETRY_DELAY_MS * attempt); // Exponential backoff
      } else {
        throw error;
      }
    }
  }
  throw new Error('All retries exhausted');
}

/**
 * Upsert a batch of videos into channel_videos table
 */
async function upsertVideos(username: string, videos: any[]) {
  const rows = videos.map(v => ({
    username,
    shortcode: v.shortcode || extractShortcode(v.videoUrl, v.id),
    instagram_id: v.id,
    caption: v.caption || '',
    like_count: v.likeCount || Math.round((v.engagement || 0) * (v.views || 0)),
    comment_count: v.commentCount || 0,
    view_count: v.views || 0,
    thumbnail_url: v.thumbnailUrl || '',
    video_url: v.videoUrl || '',
    media_type: v.mediaType || 2,
    posted_at: v.postedAt || new Date().toISOString(),
  }));

  const { error } = await supabase
    .from('channel_videos')
    .upsert(rows, { onConflict: 'shortcode', ignoreDuplicates: true });

  if (error) {
    console.error('[Sync] Upsert error:', error);
    throw error;
  }
}

/**
 * Extract shortcode from video URL or generate from ID
 */
function extractShortcode(videoUrl: string, id: string): string {
  // Try to extract from Instagram URL
  const match = videoUrl?.match(/instagram\.com\/(?:p|reel|tv)\/([A-Za-z0-9_-]+)/);
  if (match) return match[1];
  
  // Try to extract from code in the video URL
  const codeMatch = videoUrl?.match(/\/([A-Za-z0-9_-]{11})\//);
  if (codeMatch) return codeMatch[1];
  
  // Fallback: use the ID
  return `id_${id}`;
}

/**
 * Update sync status in Supabase
 */
async function updateSyncStatus(
  username: string, 
  fetched: number, 
  status: string, 
  cursor: string = '',
  target: number = 100
) {
  await supabase
    .from('channel_sync_status')
    .upsert({
      username,
      total_fetched: fetched,
      target_count: target,
      next_cursor: cursor,
      status,
      last_synced_at: new Date().toISOString(),
    }, { onConflict: 'username' });
}

/**
 * Check if a channel is already synced
 */
export async function getChannelSyncStatus(username: string): Promise<SyncProgress | null> {
  const { data } = await supabase
    .from('channel_sync_status')
    .select('*')
    .eq('username', username)
    .single();
  
  if (!data) return null;
  
  return {
    username: data.username,
    fetched: data.total_fetched,
    target: data.target_count,
    status: data.status,
  };
}

/**
 * Main sync function: Fetches up to 200 latest videos for a channel
 * - Sequential pagination (cursor-based)
 * - Retry on failure
 * - Progress callback for UI updates
 * - Stores everything in Supabase
 */
export async function syncChannelVideos(
  username: string,
  targetCount: number = 100,
  onProgress?: (progress: SyncProgress) => void
): Promise<SyncProgress> {
  // Check if already synced and completed
  const existing = await getChannelSyncStatus(username);
  if (existing && existing.status === 'completed' && existing.fetched >= targetCount) {
    onProgress?.(existing);
    return existing;
  }

  // Resume from where we left off if previously interrupted
  let cursor = '';
  let totalFetched = 0;
  
  if (existing && existing.status === 'syncing') {
    // Resume interrupted sync
    const { data: statusData } = await supabase
      .from('channel_sync_status')
      .select('next_cursor, total_fetched')
      .eq('username', username)
      .single();
    
    if (statusData) {
      cursor = statusData.next_cursor || '';
      totalFetched = statusData.total_fetched || 0;
    }
  }

  // Mark as syncing
  await updateSyncStatus(username, totalFetched, 'syncing', cursor, targetCount);
  
  const progress: SyncProgress = {
    username,
    fetched: totalFetched,
    target: targetCount,
    status: 'syncing',
  };
  onProgress?.(progress);

  try {
    let consecutiveEmptyPages = 0;

    while (totalFetched < targetCount) {
      // Fetch one page with retry
      const result = await fetchPageWithRetry(username, cursor);
      
      if (!result.videos || result.videos.length === 0) {
        consecutiveEmptyPages++;
        if (consecutiveEmptyPages >= 2) {
          // Channel has no more videos
          console.log(`[Sync] ${username}: No more videos available. Total: ${totalFetched}`);
          break;
        }
        continue;
      }

      consecutiveEmptyPages = 0;

      // Upsert this batch
      await upsertVideos(username, result.videos);
      
      totalFetched += result.videos.length;
      cursor = result.nextCursor || '';

      // Update progress
      progress.fetched = totalFetched;
      await updateSyncStatus(username, totalFetched, 'syncing', cursor, targetCount);
      onProgress?.(progress);

      // No more pages
      if (!result.nextCursor) {
        console.log(`[Sync] ${username}: Reached end of feed. Total: ${totalFetched}`);
        break;
      }
    }

    // Mark as completed
    progress.status = 'completed';
    progress.fetched = totalFetched;
    await updateSyncStatus(username, totalFetched, 'completed', '', targetCount);
    onProgress?.(progress);
    
    console.log(`[Sync] ✅ ${username}: Sync complete. ${totalFetched} videos cached.`);
    return progress;

  } catch (error: any) {
    console.error(`[Sync] ❌ ${username}: Sync failed at ${totalFetched} videos:`, error.message);
    
    // Save progress so we can resume later
    progress.status = 'failed';
    await updateSyncStatus(username, totalFetched, 'failed', cursor, targetCount);
    onProgress?.(progress);
    
    throw error;
  }
}

/**
 * Get all cached videos for a channel from Supabase
 */
export async function getCachedVideos(username: string) {
  const { data, error } = await supabase
    .from('channel_videos')
    .select('*')
    .eq('username', username)
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('[Cache] Error fetching cached videos:', error);
    return [];
  }
  return data || [];
}

/**
 * Get cached videos for multiple channels
 */
export async function getCachedVideosForChannels(usernames: string[]) {
  if (usernames.length === 0) return [];
  
  const { data, error } = await supabase
    .from('channel_videos')
    .select('*')
    .in('username', usernames)
    .order('posted_at', { ascending: false });

  if (error) {
    console.error('[Cache] Error fetching cached videos:', error);
    return [];
  }
  return data || [];
}
