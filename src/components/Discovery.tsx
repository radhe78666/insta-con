import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, 
  Filter, 
  ChevronDown, 
  Plus, 
  Users,
  Settings2, 
  ArrowUpDown, 
  Bookmark,
  BookmarkCheck,
  ExternalLink,
  Play,
  Clock,
  Eye,
  Zap,
  TrendingUp,
  Library as LibraryIcon,
  X,
  Check,
  Instagram
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InstagramVideo, InstagramChannel, FilterConfig } from '../types';
import { MOCK_VIDEOS } from '../mockData';
import { fetchInstagramPostsPage, fetchDiscoveryVideos } from '../services/instagramService';

interface FlyingVideo {
  id: string;
  thumbnail: string;
  startX: number;
  startY: number;
}

interface DiscoveryProps {
  onAddToLibrary: (video: InstagramVideo) => void;
  onRemoveFromLibrary?: (id: string) => void;
  onViewAnalysis?: (video: InstagramVideo) => void;
  savedVideos: InstagramVideo[];
  initialView: 'Feed' | 'Videos' | 'Library';
  setActiveTab: (tab: string) => void;
  isFilterOpen: boolean;
  setIsFilterOpen: (isOpen: boolean) => void;
  trackedChannels: InstagramChannel[];
  onOpenConfigure: () => void;
  selectedVideoDetails: InstagramVideo | null;
  setSelectedVideoDetails: (video: InstagramVideo | null) => void;
  // Shared state for caching
  apiVideos: InstagramVideo[];
  setApiVideos: (videos: InstagramVideo[]) => void;
  isLoadingVideos: boolean;
  setIsLoadingVideos: (isLoading: boolean) => void;
  channelCursors?: Record<string, string>;
  setChannelCursors?: (cursors: Record<string, string>) => void;
}

const Discovery: React.FC<DiscoveryProps> = ({ 
  onAddToLibrary, 
  onRemoveFromLibrary,
  onViewAnalysis,
  savedVideos, 
  initialView, 
  setActiveTab,
  isFilterOpen,
  setIsFilterOpen,
  trackedChannels,
  onOpenConfigure,
  selectedVideoDetails,
  setSelectedVideoDetails,
  apiVideos,
  setApiVideos,
  isLoadingVideos,
  setIsLoadingVideos,
  channelCursors,
  setChannelCursors
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('Trending');
  const [isSortOpen, setIsSortOpen] = useState(false);
  const [isChannelFilterOpen, setIsChannelFilterOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [previewVideo, setPreviewVideo] = useState<InstagramVideo | null>(null);
  const [flyingVideos, setFlyingVideos] = useState<FlyingVideo[]>([]);
  const [isLibraryPulsing, setIsLibraryPulsing] = useState(false);
  const [showDevNotice, setShowDevNotice] = useState(initialView === 'Videos');
  const libraryButtonRef = useRef<HTMLButtonElement>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  React.useEffect(() => {
    // Skip if Library or if we already have cached videos
    if (initialView === 'Library' || apiVideos.length > 0) return;
    
    if (initialView === 'Videos') {
      setIsLoadingVideos(true);
      fetchDiscoveryVideos().then(videos => {
        setApiVideos(videos);
        setIsLoadingVideos(false);
      });
      return;
    }

    if (trackedChannels.length === 0) {
      setApiVideos([]);
      setIsLoadingVideos(false);
      return;
    }

    setIsLoadingVideos(true);
    
    const fetchInitialVideos = async () => {
      const newCursors: Record<string, string> = {};
      let allVideos: InstagramVideo[] = [];

      try {
        const promises = trackedChannels.map(async (channel) => {
          const result = await fetchInstagramPostsPage(`https://www.instagram.com/${channel.username}/`, '');
          newCursors[channel.username] = result.nextCursor || '';
          return result.videos;
        });

        const results = await Promise.all(promises);
        allVideos = results.flat();

        if (setChannelCursors) {
          setChannelCursors(newCursors);
        }
        setApiVideos(allVideos.sort((a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime()));
      } catch (err) {
        console.error('Error fetching initial videos:', err);
      } finally {
        setIsLoadingVideos(false);
      }
    };

    fetchInitialVideos();
  }, [trackedChannels, initialView, apiVideos.length]);

  const categories = ['Trending', 'For You', 'Music', 'Sports', 'Entertainment', 'Tech', 'Gaming'];

  const DEFAULT_FILTERS: FilterConfig = {
    channels: [],
    outlierScore: [1, 1000],
    views: [0, 1000000000],
    engagement: [0, 100],
    postedInLast: 0,
    postedInLastUnit: 'Months',
    platform: 'All',
    keywords: ''
  };
  const [filters, setFilters] = useState<FilterConfig>(DEFAULT_FILTERS);

  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'views' | 'outlier' | 'engagement'>('newest');

  const getChannel = (id: string) => {
    return trackedChannels.find(c => c.id === id) || {
      id,
      username: id,
      fullName: id.split(/[._]/).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${id}&backgroundColor=1a1a1a&textColor=ffffff`,
      followers: Math.floor(Math.random() * 2000000) + 100000,
      totalViews: 0,
      description: '',
      niche: 'Discovery',
      platform: 'Instagram'
    } as InstagramChannel;
  };


  const filteredVideos = useMemo(() => {
    let videos = initialView === 'Library' ? savedVideos : apiVideos;

    // Apply search and category
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      if (q.startsWith('@')) {
        const channelQuery = q.slice(1);
        videos = videos.filter(v => {
          const channel = getChannel(v.channelId);
          return channel?.username.toLowerCase().includes(channelQuery) || 
                 channel?.fullName.toLowerCase().includes(channelQuery);
        });
      } else if (q.startsWith('#')) {
        const tagQuery = q.slice(1);
        videos = videos.filter(v => v.caption?.toLowerCase().includes(tagQuery));
      } else {
        videos = videos.filter(v => {
          const channel = getChannel(v.channelId);
          return (v.caption?.toLowerCase().includes(q)) || 
                 (channel?.username.toLowerCase().includes(q)) ||
                 (channel?.fullName.toLowerCase().includes(q));
        });
      }
    }

    // Apply all filters
    if (filters.channels.length > 0) {
      videos = videos.filter(v => filters.channels.includes(v.channelId));
    }
    if (filters.platform !== 'All') {
      videos = videos.filter(v => v.platform === filters.platform);
    }
    // Views filter
    videos = videos.filter(v => v.views >= filters.views[0] && v.views <= filters.views[1]);
    // Outlier score filter
    videos = videos.filter(v => v.outlierScore >= filters.outlierScore[0] && v.outlierScore <= filters.outlierScore[1]);
    // Engagement filter (0-100 scale)
    videos = videos.filter(v => (v.engagement * 100) >= filters.engagement[0] && (v.engagement * 100) <= filters.engagement[1]);
    // Posted in last filter
    if (filters.postedInLast > 0) {
      const now = new Date();
      const unitMs: Record<string, number> = { Days: 86400000, Weeks: 604800000, Months: 2592000000, Years: 31536000000 };
      const cutoff = new Date(now.getTime() - filters.postedInLast * (unitMs[filters.postedInLastUnit] || 2592000000));
      videos = videos.filter(v => new Date(v.postedAt) >= cutoff);
    }
    // Keywords filter
    if (filters.keywords) {
      const kw = filters.keywords.toLowerCase();
      videos = videos.filter(v => v.caption?.toLowerCase().includes(kw));
    }

    // Sort
    return [...videos].sort((a, b) => {
      if (sortBy === 'views') return b.views - a.views;
      if (sortBy === 'outlier') return b.outlierScore - a.outlierScore;
      if (sortBy === 'engagement') return b.engagement - a.engagement;
      if (sortBy === 'oldest') return new Date(a.postedAt).getTime() - new Date(b.postedAt).getTime();
      return new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime();
    });
  }, [initialView, savedVideos, apiVideos, searchQuery, sortBy, filters, trackedChannels]);

  const handleAddVideo = () => {
    if (videoUrl.trim()) {
      // Simulate finding a video
      const randomVideo = MOCK_VIDEOS[Math.floor(Math.random() * MOCK_VIDEOS.length)];
      setPreviewVideo({
        ...randomVideo,
        id: `custom-${Date.now()}`,
        caption: "Newly added video from URL"
      });
    }
  };

  const handleLoadMore = async () => {
    setIsFetchingMore(true);
    let newVideos: InstagramVideo[] = [];
    const updatedCursors = { ...channelCursors };

    try {
      const promises = trackedChannels.map(async (channel) => {
        const cursor = channelCursors[channel.username];
        if (cursor) {
          const result = await fetchInstagramPostsPage(`https://www.instagram.com/${channel.username}/`, cursor);
          updatedCursors[channel.username] = result.nextCursor || '';
          return result.videos;
        }
        return [];
      });

      const results = await Promise.all(promises);
      newVideos = results.flat();
    } catch(e) {}

    setApiVideos(prev => {
      const all = [...prev, ...newVideos];
      const uniqueVideos = Array.from(new Map(all.map(v => [v.id, v])).values());
      return uniqueVideos.sort((a,b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime());
    });
    setChannelCursors(updatedCursors);
    setIsFetchingMore(false);
  };

  const sortOptions = [
    { label: 'Newest', value: 'newest' as const },
    { label: 'Oldest', value: 'oldest' as const },
    { label: 'Outlier score', value: 'outlier' as const },
    { label: 'Views', value: 'views' as const },
    { label: 'Engagement rate', value: 'engagement' as const },
  ];

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    if (diffInSeconds < 2419200) return `${Math.floor(diffInSeconds / 604800)}w`;
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2419200)}mo`;
    return `${Math.floor(diffInSeconds / 31536000)}y`;
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  return (
    <div className="flex h-screen bg-brand-bg overflow-hidden relative">
      {/* Under Development Notice - Now a smaller, transparent popup */}
      <AnimatePresence>
        {showDevNotice && initialView === 'Videos' && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
              onClick={() => setShowDevNotice(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-sm bg-[#1a1a1a]/90 backdrop-blur-xl border border-brand-accent/30 rounded-3xl shadow-[0_0_50px_rgba(255,99,33,0.15)] overflow-hidden p-6 text-center pointer-events-auto"
            >
              <div className="w-12 h-12 bg-brand-accent/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Zap className="w-6 h-6 text-brand-accent fill-current" />
              </div>
              <h3 className="text-xl font-black text-white mb-2 tracking-tight">Under Development</h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                This Discovery page is currently under <span className="text-brand-accent font-bold">development</span>. 
                What you see now is a functional <span className="text-white font-bold">demo</span>.
              </p>
              <button 
                onClick={() => setShowDevNotice(false)}
                className="w-full py-3 bg-brand-accent text-white font-black rounded-xl hover:bg-brand-accent/90 transition-all shadow-lg shadow-brand-accent/20 text-sm"
              >
                Got it, let's explore
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Filter Sidebar */}
      <AnimatePresence initial={false}>
        {isFilterOpen && initialView !== 'Videos' && (
          <motion.aside
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 280, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="border-r border-brand-border bg-brand-surface/30 backdrop-blur-xl overflow-y-auto no-scrollbar flex-shrink-0"
          >
            <div className="p-5 flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500">Filters</h2>
                <button 
                  onClick={() => setFilters(DEFAULT_FILTERS)}
                  className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Clear
                </button>
              </div>

              {/* Channels Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Channels</label>
                <div className="relative">
                  <button 
                    onClick={() => setIsChannelFilterOpen(!isChannelFilterOpen)}
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white flex items-center justify-between focus:outline-none focus:border-brand-accent/50 transition-all"
                  >
                    <span className="truncate">
                      {filters.channels.length === 0 
                        ? 'All channels' 
                        : filters.channels.length === 1 
                          ? `@${trackedChannels.find(c => c.id === filters.channels[0])?.username}`
                          : `${filters.channels.length} channels selected`}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${isChannelFilterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isChannelFilterOpen && (
                      <>
                        <div className="fixed inset-0 z-[60]" onClick={() => setIsChannelFilterOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 5, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 5, scale: 0.95 }}
                          className="absolute left-0 right-0 top-full mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-[70] overflow-hidden p-1 max-h-64 overflow-y-auto no-scrollbar"
                        >
                          <button 
                            onClick={() => {
                              setFilters(f => ({ ...f, channels: [] }));
                              setIsChannelFilterOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                              filters.channels.length === 0 ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                            }`}
                          >
                            <div className="w-6 h-6 rounded-full bg-zinc-800 flex items-center justify-center">
                              <Users className="w-3 h-3" />
                            </div>
                            <span>All Channels</span>
                            {filters.channels.length === 0 && <Check className="w-4 h-4 text-brand-accent ml-auto" />}
                          </button>
                          
                          {trackedChannels.map(c => (
                            <button 
                              key={c.id}
                              onClick={() => {
                                if (filters.channels.includes(c.id)) {
                                  setFilters(f => ({ ...f, channels: f.channels.filter(id => id !== c.id) }));
                                } else {
                                  setFilters(f => ({ ...f, channels: [...f.channels, c.id] }));
                                }
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                filters.channels.includes(c.id) ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                              }`}
                            >
                              <img 
                                src={c.avatarUrl} 
                                alt={c.username} 
                                className="w-6 h-6 rounded-full object-cover border border-white/10"
                                referrerPolicy="no-referrer"
                              />
                              <span className="truncate">@{c.username}</span>
                              {filters.channels.includes(c.id) && <Check className="w-4 h-4 text-brand-accent ml-auto" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              {/* Outlier Score */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Outlier score</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="1" value={filters.outlierScore[0]} onChange={e => setFilters(f => ({ ...f, outlierScore: [Number(e.target.value), f.outlierScore[1]] }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                  <input type="number" placeholder="100x" value={filters.outlierScore[1]} onChange={e => setFilters(f => ({ ...f, outlierScore: [f.outlierScore[0], Number(e.target.value)] }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                </div>
              </div>

              {/* Views */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Views</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0" value={filters.views[0]} onChange={e => setFilters(f => ({ ...f, views: [Number(e.target.value), f.views[1]] }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                  <input type="number" placeholder="10,000,000" value={filters.views[1]} onChange={e => setFilters(f => ({ ...f, views: [f.views[0], Number(e.target.value)] }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                </div>
              </div>

              {/* Engagement */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Engagement</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0%" value={filters.engagement[0]} onChange={e => setFilters(f => ({ ...f, engagement: [Number(e.target.value), f.engagement[1]] }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                  <input type="number" placeholder="100%" value={filters.engagement[1]} onChange={e => setFilters(f => ({ ...f, engagement: [f.engagement[0], Number(e.target.value)] }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                </div>
              </div>

              {/* Posted in last */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Posted in last</label>
                <div className="flex gap-2">
                  <input type="number" placeholder="0" value={filters.postedInLast} onChange={e => setFilters(f => ({ ...f, postedInLast: Number(e.target.value) }))} className="w-1/2 bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50" />
                  <div className="relative w-1/2">
                    <select value={filters.postedInLastUnit} onChange={e => setFilters(f => ({ ...f, postedInLastUnit: e.target.value as any }))} className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-brand-accent/50">
                      <option>Months</option>
                      <option>Weeks</option>
                      <option>Days</option>
                      <option>Years</option>
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-zinc-500 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Platform */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Platform</label>
                <div className="relative">
                  <select 
                    className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white appearance-none focus:outline-none focus:border-brand-accent/50"
                    value="Instagram"
                    disabled
                  >
                    <option value="Instagram">Instagram</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 pointer-events-none" />
                </div>
              </div>

              {/* Keywords */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-zinc-400">Keywords</label>
                <input 
                  type="text" 
                  placeholder="Search captions and titles" 
                  className="w-full bg-brand-bg/50 border border-brand-border rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <button className="w-full py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg font-bold text-sm transition-all mt-2">
                Save filter
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-brand-border bg-brand-bg/50 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 relative z-20">
          <div className="flex items-center gap-4">
            {initialView !== 'Videos' && (
              <>
                <button 
                  onClick={() => setIsFilterOpen(!isFilterOpen)}
                  className={`p-2 rounded-lg transition-all ${isFilterOpen ? 'text-brand-accent' : 'text-zinc-500 hover:text-white'}`}
                >
                  <Filter className="w-5 h-5" />
                </button>
                <div className="h-8 w-px bg-brand-border mx-4" />
              </>
            )}
            
            <h1 className="text-xl font-semibold text-white tracking-tight">
              {initialView === 'Library' ? 'Library' : initialView === 'Videos' ? 'Discovery' : 'Feed'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {initialView === 'Library' ? (
                <button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <Plus className="w-4 h-4 text-zinc-500 group-hover:text-brand-accent transition-colors" />
                  Add Video URL
                </button>
              ) : initialView !== 'Videos' && (
                <button 
                  onClick={onOpenConfigure}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-bold text-zinc-300 hover:text-white hover:bg-white/10 transition-all group"
                >
                  <Users className="w-4 h-4 text-zinc-500 group-hover:text-brand-accent transition-colors" />
                  Configure channels
                </button>
              )}
              
              {initialView !== 'Videos' && (
                <div className="relative">
                  <button 
                    onClick={() => setIsSortOpen(!isSortOpen)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all group ${isSortOpen ? 'bg-white/10 border-brand-accent text-white' : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'}`}
                  >
                    <ArrowUpDown className={`w-4 h-4 transition-colors ${isSortOpen ? 'text-brand-accent' : 'text-zinc-500 group-hover:text-brand-accent'}`} />
                    <span className="text-xs font-bold">Sort by</span>
                  </button>

                  <AnimatePresence>
                    {isSortOpen && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          className="absolute right-0 top-full mt-2 w-48 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl z-50 overflow-hidden p-1"
                        >
                          {[
                            { label: 'Newest First', value: 'newest' },
                            { label: 'Oldest First', value: 'oldest' },
                            { label: 'Most Viewed', value: 'views' },
                            { label: 'Highest Outlier', value: 'outlier' },
                            { label: 'Engagement', value: 'engagement' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => {
                                setSortBy(option.value as any);
                                setIsSortOpen(false);
                              }}
                              className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${sortBy === option.value ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'}`}
                            >
                              {option.label}
                              {sortBy === option.value && <Check className="w-4 h-4 text-brand-accent" />}
                            </button>
                          ))}
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-brand-border mx-1" />

            {initialView === 'Library' ? (
              <button 
                onClick={() => setActiveTab('discovery')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 font-bold text-sm transition-all"
              >
                <Zap className="w-4 h-4" />
                Go To Feed
              </button>
            ) : (
              <motion.button 
                ref={libraryButtonRef}
                animate={isLibraryPulsing ? { scale: [1, 1.2, 1], backgroundColor: ['rgba(255, 99, 33, 0.1)', 'rgba(255, 99, 33, 0.3)', 'rgba(255, 99, 33, 0.1)'] } : {}}
                transition={{ duration: 0.4 }}
                onClick={() => setActiveTab('library')}
                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent/10 text-brand-accent hover:bg-brand-accent/20 font-bold text-sm transition-all relative"
              >
                <LibraryIcon className="w-4 h-4" />
                Go To Library
              </motion.button>
            )}
          </div>
        </header>

        {/* Video Discovery Section (Instagram Style) */}
        <main className="flex-1 overflow-y-auto no-scrollbar">
          {initialView === 'Videos' && (
            <div className="px-6 pt-6 flex flex-col gap-6">
              <div className="relative group max-w-2xl mx-auto w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-accent transition-colors" />
                <input 
                  type="text"
                  placeholder="Search @accounts or #hashtags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900/50 border border-white/5 rounded-2xl py-4 pl-11 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent/50 focus:bg-zinc-900 transition-all placeholder:text-zinc-600 shadow-xl"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-full transition-colors"
                  >
                    <X className="w-3 h-3 text-zinc-400" />
                  </button>
                )}
              </div>

              {/* Trending Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar justify-center">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={`px-6 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${
                      activeCategory === cat 
                        ? 'bg-white text-black border-white shadow-lg' 
                        : 'bg-transparent text-zinc-400 border-white/10 hover:border-white/30'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                {searchQuery ? (
                  <>
                    <Search className="w-5 h-5 text-brand-accent" />
                    Results for "{searchQuery}"
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-brand-accent" />
                    {initialView === 'Videos' ? activeCategory : initialView}
                  </>
                )}
              </h2>
            </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-5">
            {isLoadingVideos ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <div className="w-12 h-12 border-4 border-brand-accent border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-zinc-400 font-bold">Fetching real-time videos instantly...</p>
                <p className="text-zinc-600 text-xs mt-2">
                  {initialView === 'Videos' ? 'Discovering top recommended content for you...' : 'Syncing channels directly from Instagram DB'}
                </p>
              </div>
            ) : initialView === 'Videos' && filteredVideos.length === 0 ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-zinc-500" />
                </div>
                <p className="text-zinc-300 font-black text-xl mb-2">No results for "{searchQuery}"</p>
                <p className="text-zinc-500 text-sm">Try searching for something else in the Discovery engine.</p>
              </div>
            ) : filteredVideos.length === 0 && trackedChannels.length === 0 && initialView === 'Feed' ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <p className="text-zinc-400 font-bold mb-2">No channels tracked yet</p>
                <p className="text-zinc-500 text-sm mb-6">Add channels to your tracking list to see their videos here.</p>
                <button
                  onClick={onOpenConfigure}
                  className="px-6 py-3 bg-brand-accent text-white rounded-xl font-bold flex items-center gap-2 hover:bg-brand-accent/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Add Channels
                </button>
              </div>
            ) : filteredVideos.length === 0 && initialView === 'Library' ? (
              <div className="col-span-full py-20 flex flex-col items-center justify-center">
                <p className="text-zinc-400 font-bold">Your library is empty</p>
                <p className="text-zinc-500 text-sm mt-2">Save videos to watch them later</p>
              </div>
            ) : filteredVideos.map((video) => {
              const channel = getChannel(video.channelId);
              const isSaved = savedVideos.some(v => v.id === video.id);

              return (
                <motion.div
                  layout
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="group relative bg-brand-surface border border-brand-border rounded-2xl overflow-hidden hover:border-brand-accent/50 transition-all duration-500"
                >
                  {/* Thumbnail Container */}
                  <div className="aspect-[9/16] relative overflow-hidden">
                    <img 
                      src={video.thumbnailUrl} 
                      alt={video.caption}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />
                    
                    {/* Platform Badge */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center border border-white/10">
                      {video.platform === 'Instagram' ? (
                        <div className="w-4 h-4 bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-600 rounded-sm" />
                      ) : (
                        <div className="w-4 h-4 bg-black rounded-sm flex items-center justify-center">
                          <span className="text-[8px] font-black text-white">T</span>
                        </div>
                      )}
                    </div>

                    {/* Outlier Badge */}
                    <div className="absolute top-4 left-4 px-2.5 py-1 rounded-full bg-brand-accent/90 backdrop-blur-md flex items-center gap-1.5 border border-white/20">
                      <Zap className="w-3 h-3 text-white fill-current" />
                      <span className="text-[10px] font-black text-white">{video.outlierScore}x</span>
                    </div>

                    {/* Play / Progress Button Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40 backdrop-blur-[2px]">
                      {initialView === 'Library' ? (
                        <button 
                          onClick={() => onViewAnalysis?.(video)}
                          className={`px-5 py-2.5 rounded-full font-bold text-sm shadow-2xl flex flex-col items-center justify-center gap-1 transition-all ${
                            video.status === 'failed' ? 'bg-red-500/90 text-white' : 
                            video.status === 'transcribing' || video.status === 'analyzing' ? 'bg-orange-500/90 text-white animate-pulse' : 
                            'bg-brand-accent text-white hover:bg-brand-accent/90'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {video.status === 'failed' ? <Zap className="w-4 h-4 line-through" /> : <TrendingUp className="w-4 h-4" />}
                            {video.status === 'failed' ? 'Analysis Failed' : 
                             video.status === 'transcribing' ? 'Transcribing...' : 
                             video.status === 'analyzing' ? 'Analyzing...' : 
                             'View Analysis'}
                          </div>
                          {video.status === 'failed' && (
                            <span className="text-[9px] font-normal opacity-90 max-w-[120px] truncate text-center">
                              {video.error || 'Server error'}
                            </span>
                          )}
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedVideoDetails(video)}
                          className="px-5 py-2.5 rounded-full bg-brand-accent text-white font-bold text-sm shadow-2xl flex items-center justify-center gap-2 hover:bg-brand-accent/90 transition-all"
                        >
                          <Play className="w-4 h-4 fill-current" />
                          View details
                        </button>
                      )}
                    </div>

                    {/* Bottom Stats Overlay */}
                    <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                      <div className="flex items-center gap-3 bg-black/40 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10">
                        <div className="flex items-center gap-1 text-white">
                          <Eye className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{formatNumber(video.views)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-brand-accent">
                          <TrendingUp className="w-3 h-3" />
                          <span className="text-[10px] font-bold">{(video.engagement * 100).toFixed(1)}%</span>
                        </div>
                      </div>
                    </div>

                    {/* Add to Library Hover Button */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out">
                      {initialView !== 'Library' && (
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            if (!isSaved) {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const newFlyingVideo = {
                                id: Math.random().toString(36).substr(2, 9),
                                thumbnail: video.thumbnailUrl,
                                startX: rect.left + rect.width / 2,
                                startY: rect.top + rect.height / 2,
                              };
                              setFlyingVideos(prev => [...prev, newFlyingVideo]);
                              
                              // Trigger pulse after animation duration (approx 0.8s)
                              setTimeout(() => {
                                setIsLibraryPulsing(true);
                                setTimeout(() => setIsLibraryPulsing(false), 400);
                                setFlyingVideos(prev => prev.filter(fv => fv.id !== newFlyingVideo.id));
                              }, 800);
                            }
                            onAddToLibrary(video);
                          }}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-2xl transition-all ${
                            isSaved 
                              ? 'bg-emerald-500 text-white' 
                              : 'bg-brand-accent text-white hover:bg-brand-accent/90'
                          }`}
                        >
                          {isSaved ? (
                            <>
                              <BookmarkCheck className="w-4 h-4" />
                              Saved to Library
                            </>
                          ) : (
                            <>
                              <Bookmark className="w-4 h-4" />
                              Add to Library
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Info Section */}
                  <div className="p-4 flex flex-col gap-3">
                    <div className="flex items-center gap-2">
                      <img 
                        src={channel?.avatarUrl} 
                        alt={channel?.username} 
                        className="w-6 h-6 rounded-full border border-white/10"
                        referrerPolicy="no-referrer"
                      />
                      <span className="text-xs font-bold text-white truncate">@{channel?.username}</span>
                      <span className="text-[10px] text-zinc-500 ml-auto flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {formatTimeAgo(video.postedAt)} ago
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 line-clamp-2 leading-relaxed">
                      {video.caption}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Load More Button */}
          {initialView !== 'Library' && filteredVideos.length > 0 && channelCursors && Object.values(channelCursors).some(c => !!c) && (
            <div className="flex justify-center mt-10 mb-8">
              <button 
                onClick={handleLoadMore}
                disabled={isFetchingMore}
                className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold rounded-xl transition-all flex items-center gap-3 disabled:opacity-50"
              >
                {isFetchingMore ? (
                  <>
                    <div className="w-5 h-5 border-2 border-brand-accent border-t-transparent rounded-full animate-spin"></div>
                    Loading more videos...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 text-brand-accent" />
                    Load More Videos
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </main>
    </div>

      {/* Add Video Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-6 flex flex-col gap-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">Add Video from URL</h3>
                  <button 
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setPreviewVideo(null);
                      setVideoUrl('');
                    }}
                    className="p-2 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-sm font-bold text-zinc-400">Video Link</label>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Paste Instagram or TikTok link here"
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                    />
                    <button 
                      onClick={handleAddVideo}
                      className="px-6 py-3 bg-brand-accent text-white font-bold rounded-xl hover:bg-brand-accent/90 transition-all"
                    >
                      Preview
                    </button>
                  </div>
                </div>

                {previewVideo && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col gap-4"
                  >
                    <div className="aspect-[16/9] relative rounded-2xl overflow-hidden border border-white/10">
                      <img 
                        src={previewVideo.thumbnailUrl} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Play className="w-12 h-12 text-white fill-current" />
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        onAddToLibrary(previewVideo);
                        setIsAddModalOpen(false);
                        setPreviewVideo(null);
                        setVideoUrl('');
                      }}
                      className="w-full py-4 bg-emerald-500 text-white font-bold rounded-xl hover:bg-emerald-500/90 transition-all flex items-center justify-center gap-2"
                    >
                      <Bookmark className="w-5 h-5" />
                      Add to Library
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flying Videos Animation Layer */}
      <div className="fixed inset-0 pointer-events-none z-[200]">
        <AnimatePresence>
          {flyingVideos.map((fv) => {
            const targetRect = libraryButtonRef.current?.getBoundingClientRect();
            if (!targetRect) return null;

            return (
              <motion.div
                key={fv.id}
                initial={{ 
                  x: fv.startX, 
                  y: fv.startY, 
                  scale: 1, 
                  opacity: 1,
                  rotate: 0 
                }}
                animate={{ 
                  x: targetRect.left + targetRect.width / 2, 
                  y: targetRect.top + targetRect.height / 2, 
                  scale: 0.1, 
                  opacity: 0,
                  rotate: 360
                }}
                transition={{ 
                  duration: 0.8, 
                  ease: [0.4, 0, 0.2, 1] 
                }}
                className="fixed top-0 left-0 w-20 h-20 -ml-10 -mt-10 rounded-xl overflow-hidden border-2 border-brand-accent shadow-[0_0_20px_rgba(255,99,33,0.5)]"
              >
                <img src={fv.thumbnail} className="w-full h-full object-cover" alt="" referrerPolicy="no-referrer" />
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Discovery;
