/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type PlanType = 'Free' | 'Pro' | 'Enterprise';

export interface User {
  id: string;
  email: string;
  name: string;
  plan: PlanType;
  usage: {
    videosAnalyzed: number;
    limit: number;
  };
}

export interface InstagramChannel {
  id: string;
  username: string;
  fullName: string;
  avatarUrl: string;
  followers: number;
  description: string;
  niche: string;
  platform: 'Instagram' | 'YouTube' | 'TikTok';
}

export interface InstagramVideo {
  id: string;
  channelId: string;
  thumbnailUrl: string;
  caption: string;
  views: number;
  engagement: number;
  outlierScore: number;
  postedAt: string;
  platform: 'Instagram';
  videoUrl: string;
  transcript?: string;
  analysis?: string; // We'll store stringified JSON here
  status?: 'idle' | 'transcribing' | 'analyzing' | 'completed' | 'failed';
  error?: string;
}

export interface FilterConfig {
  channels: string[];
  outlierScore: [number, number];
  views: [number, number];
  engagement: [number, number];
  postedInLast: number;
  postedInLastUnit: 'Days' | 'Weeks' | 'Months' | 'Years';
  platform: 'All' | 'Instagram' | 'TikTok';
  keywords: string;
}
