import React, { useState, useMemo } from 'react';
import { 
  Users, 
  Plus, 
  ArrowUpDown, 
  Search, 
  Youtube, 
  Instagram, 
  Video,
  Compass,
  LayoutGrid,
  TrendingUp,
  Check,
  Settings2,
  Trash2
} from 'lucide-react';
import { InstagramChannel } from '../types';
import { motion, AnimatePresence } from 'motion/react';

interface ChannelsProps {
  setActiveTab: (tab: string) => void;
  trackedChannels: InstagramChannel[];
  onOpenConfigure: () => void;
  onRemoveChannel: (id: string) => void;
}

type SortType = 'name' | 'views' | 'followers';

const Channels: React.FC<ChannelsProps> = ({ setActiveTab, trackedChannels, onOpenConfigure, onRemoveChannel }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('followers');
  const [isSortOpen, setIsSortOpen] = useState(false);

  const sortedChannels = useMemo(() => {
    let filtered = trackedChannels.filter(channel => {
      const query = searchQuery.toLowerCase();
      return (channel.username?.toLowerCase().includes(query)) ||
             (channel.fullName?.toLowerCase().includes(query));
    });

    return [...filtered].sort((a, b) => {
      if (sortBy === 'name') return a.fullName.localeCompare(b.fullName);
      if (sortBy === 'views') return b.totalViews - a.totalViews;
      if (sortBy === 'followers') return b.followers - a.followers;
      return 0;
    });
  }, [trackedChannels, searchQuery, sortBy]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(0) + 'K';
    return num.toString();
  };

  return (
    <div className="flex flex-col h-full bg-brand-bg">
      {/* Header */}
      <header className="h-16 border-b border-brand-border bg-brand-bg/50 backdrop-blur-md flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setActiveTab('videos')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all font-bold text-sm"
          >
            <Compass className="w-4 h-4 text-brand-accent" />
            Explore Videos
          </button>
          <button 
            onClick={() => setActiveTab('discovery')}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-zinc-300 hover:text-white hover:bg-white/10 transition-all font-bold text-sm"
          >
            <LayoutGrid className="w-4 h-4 text-brand-accent" />
            Explore Feed
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-brand-accent transition-colors" />
            <input 
              type="text" 
              placeholder="Search channels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-brand-accent/50 transition-all w-64"
            />
          </div>

          <button 
            onClick={onOpenConfigure}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-accent text-white font-bold text-sm hover:bg-brand-accent/90 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Channel
          </button>

          <div className="relative">
            <button 
              onClick={() => setIsSortOpen(!isSortOpen)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-bold text-sm ${
                isSortOpen ? 'bg-white/10 border-brand-accent text-white' : 'bg-white/5 border-white/10 text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <ArrowUpDown className="w-4 h-4 text-brand-accent" />
              Sort
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
                      { label: 'Name', value: 'name' },
                      { label: 'Followers', value: 'followers' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSortBy(option.value as SortType);
                          setIsSortOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          sortBy === option.value ? 'bg-white/10 text-white' : 'text-zinc-400 hover:bg-white/5 hover:text-white'
                        }`}
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
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-y-auto p-6 no-scrollbar">
        <div className="mb-8 px-2">
          <h1 className="text-3xl font-black text-white tracking-tight">Tracked Creators</h1>
          <p className="text-zinc-500 text-sm mt-1">Add channels here to customize your feed. Once tracked, videos from these creators will appear in your feed automatically.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedChannels.map((channel) => (
            <motion.div
              key={channel.id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-brand-surface border border-brand-border rounded-2xl p-6 hover:border-brand-accent/50 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div className="relative">
                  <img 
                    src={channel.avatarUrl} 
                    alt={channel.username}
                    className="w-16 h-16 rounded-2xl object-cover border-2 border-white/5 group-hover:border-brand-accent/30 transition-all"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-black border border-white/10 flex items-center justify-center">
                    <Instagram className="w-3 h-3 text-pink-500" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white truncate">{channel.username}</h3>
                  </div>
                  <div className="flex flex-wrap gap-x-3 gap-y-1 mt-1">
                    <span className="text-xs font-bold text-zinc-400">
                      {formatNumber(channel.followers)} {channel.platform === 'YouTube' ? 'subscribers' : 'followers'}
                    </span>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-zinc-400 line-clamp-3 leading-relaxed mb-6">
                {channel.description}
              </p>

              <div className="flex items-center gap-2">
                <a 
                  href={`https://www.instagram.com/${channel.username}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all flex items-center justify-center"
                >
                  View Channel
                </a>
                <button 
                  onClick={() => onRemoveChannel(channel.id)}
                  className="px-3 py-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-all"
                  title="Remove Channel"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default Channels;
