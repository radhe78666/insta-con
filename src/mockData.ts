import { InstagramChannel, InstagramVideo } from './types';

export const MOCK_CHANNELS: InstagramChannel[] = [
  {
    id: '1',
    username: 'aiadvantage',
    fullName: 'AI Advantage',
    avatarUrl: 'https://picsum.photos/seed/aiadvantage/100/100',
    followers: 415000,
    totalViews: 5200000,
    description: 'AI tutorials and reviews for young professionals seeking to leverage cutting-edge tools for productivity and creative endeavors.',
    niche: 'AI',
    platform: 'YouTube'
  },
  {
    id: '2',
    username: 'aicenturyclips',
    fullName: 'AI Century Clips',
    avatarUrl: 'https://picsum.photos/seed/aicentury/100/100',
    followers: 416000,
    totalViews: 82000000,
    description: 'AI video creation tutorials for creators and entrepreneurs seeking to generate content quickly and efficiently.',
    niche: 'AI',
    platform: 'TikTok'
  },
  {
    id: '3',
    username: 'airesearches',
    fullName: 'AI Researches',
    avatarUrl: 'https://picsum.photos/seed/airesearch/100/100',
    followers: 1100000,
    totalViews: 504000000,
    description: 'AI news and insights for young professionals and tech enthusiasts seeking to stay informed on the latest developments and tools.',
    niche: 'AI',
    platform: 'Instagram'
  },
  {
    id: '4',
    username: 'artificialintelligence.co',
    fullName: 'Artificial Intelligence Co',
    avatarUrl: 'https://picsum.photos/seed/aico/100/100',
    followers: 293000,
    totalViews: 91000000,
    description: 'Tech news and AI insights for millennials and young professionals seeking to understand technological advancements and their impact.',
    niche: 'AI',
    platform: 'Instagram'
  },
  {
    id: '5',
    username: 'davidondrej',
    fullName: 'David Ondrej',
    avatarUrl: 'https://picsum.photos/seed/david/100/100',
    followers: 349000,
    totalViews: 1300000,
    description: 'AI tutorials and analysis for entrepreneurs and young professionals seeking to implement AI tools for competitive advantage.',
    niche: 'AI',
    platform: 'YouTube'
  },
  {
    id: '6',
    username: 'digitaljeff',
    fullName: 'Digital Jeff',
    avatarUrl: 'https://picsum.photos/seed/jeff/100/100',
    followers: 381000,
    totalViews: 79000000,
    description: 'AI and tech tutorials, helping them leverage AI tools to boost productivity and content creation.',
    niche: 'AI',
    platform: 'Instagram'
  },
  {
    id: '7',
    username: 'drk_talks',
    fullName: 'DRK Talks',
    avatarUrl: 'https://picsum.photos/seed/drk/100/100',
    followers: 392000,
    totalViews: 211000000,
    description: 'AI-powered video creation and social media strategy tutorials helping content creators achieve faster growth and engagement.',
    niche: 'AI',
    platform: 'Instagram'
  },
  {
    id: '8',
    username: 'heysirio',
    fullName: 'Hey Sirio',
    avatarUrl: 'https://picsum.photos/seed/sirio/100/100',
    followers: 306000,
    totalViews: 107000000,
    description: 'AI tool tutorials and reviews for creatives and entrepreneurs seeking to leverage AI for content creation and project development.',
    niche: 'AI',
    platform: 'Instagram'
  },
  {
    id: '9',
    username: 'higgsfield.ai',
    fullName: 'Higgsfield AI',
    avatarUrl: 'https://picsum.photos/seed/higgs/100/100',
    followers: 614000,
    totalViews: 39000000,
    description: 'AI-powered content creation tutorials helping entrepreneurs create engaging visuals and videos for marketing.',
    niche: 'AI',
    platform: 'Instagram'
  }
];

export const MOCK_VIDEOS: InstagramVideo[] = [
  {
    id: 'v1',
    channelId: '1',
    thumbnailUrl: 'https://picsum.photos/seed/v1/400/700',
    caption: 'This AI creates and edits videos automatically in seconds! 🚀 It uses advanced neural networks to understand your content and apply the perfect transitions, music, and effects. Whether you are a beginner or a pro, this tool will save you hours of work every single day. Check out the link in bio to try it for free and start creating viral content today! #AI #VideoEditing #ContentCreator #TechTrends',
    views: 102000,
    engagement: 0.02,
    outlierScore: 1.2,
    postedAt: '2026-03-10T10:00:00Z',
    platform: 'Instagram',
    videoUrl: 'https://www.instagram.com/reels/C4fX_y_S_f_/'
  },
  {
    id: 'v2',
    channelId: '2',
    thumbnailUrl: 'https://picsum.photos/seed/v2/400/700',
    caption: 'If you need to translate your videos into 50+ languages with perfect lip-sync, this is the tool for you! 🌍 Gone are the days of expensive dubbing studios. Now you can reach a global audience with just one click. The AI matches your voice and mouth movements perfectly. It is truly mind-blowing how far technology has come in just a few months. Don\'t miss out on the global reach! #LipSync #AI #GlobalContent #Translation #Innovation',
    views: 17000,
    engagement: 0.05,
    outlierScore: 2.4,
    postedAt: '2026-03-10T12:00:00Z',
    platform: 'Instagram',
    videoUrl: 'https://www.tiktok.com/'
  },
  {
    id: 'v3',
    channelId: '3',
    thumbnailUrl: 'https://picsum.photos/seed/v3/400/700',
    caption: 'These AI-generated influencers are taking over social media! 🤖 Can you even tell they aren\'t real? They post daily, engage with fans, and even land massive brand deals. This is the future of marketing and digital identity. We are entering an era where the line between virtual and reality is completely blurred. What do you think about this trend? Is it exciting or scary? Let us know in the comments! #VirtualInfluencer #AI #DigitalFuture #SocialMediaMarketing',
    views: 33000,
    engagement: 0.01,
    outlierScore: 1.1,
    postedAt: '2026-03-10T14:00:00Z',
    platform: 'Instagram',
    videoUrl: 'https://www.instagram.com/reels/C4fX_y_S_f_/'
  },
  {
    id: 'v4',
    channelId: '4',
    thumbnailUrl: 'https://picsum.photos/seed/v4/400/700',
    caption: 'Comment "epoxy" for the full tutorial on how to use AI to design custom furniture! 🛠️ This process combines generative design with traditional craftsmanship to create pieces that were previously impossible to build. We show you exactly which prompts to use and how to export the files for CNC machining. Transform your workshop into a high-tech studio with these simple steps. Join our community of makers today! #DIY #AI #FurnitureDesign #MakerMovement #Woodworking',
    views: 300000,
    engagement: 0.04,
    outlierScore: 3.0,
    postedAt: '2026-03-09T08:00:00Z',
    platform: 'Instagram',
    videoUrl: 'https://www.instagram.com/reels/C4fX_y_S_f_/'
  }
];
