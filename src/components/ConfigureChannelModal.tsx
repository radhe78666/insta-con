import React, { useState } from 'react';
import { 
  X, 
  Search, 
  Link as LinkIcon, 
  Hash, 
  UserPlus, 
  Check, 
  Loader2,
  Youtube,
  Instagram,
  Video,
  Plus,
  Sparkles,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InstagramChannel } from '../types';
import { searchInstagramProfile } from '../services/instagramService';

interface ConfigureChannelModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddChannel: (channel: InstagramChannel) => void;
  onRemoveChannel: (id: string) => void;
  trackedChannels: InstagramChannel[];
}

type TabType = 'keyword' | 'name' | 'url' | 'tracked';

const ConfigureChannelModal: React.FC<ConfigureChannelModalProps> = ({ 
  isOpen, 
  onClose, 
  onAddChannel,
  onRemoveChannel,
  trackedChannels
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('keyword');
  const [inputValue, setInputValue] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<InstagramChannel[]>([]);

  const handleSearch = async () => {
    if (!inputValue.trim()) return;
    
    setIsSearching(true);
    setSearchResults([]);

    try {
      const results = await searchInstagramProfile(inputValue.trim());
      setSearchResults(results);
    } catch (error) {
      console.error(error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const isAlreadyTracked = (username: string) => {
    if (!username) return false;
    return trackedChannels.some(c => c.username?.toLowerCase() === username.toLowerCase());
  };

  const tabs = [
    { id: 'keyword', label: 'Keyword', icon: Hash },
    { id: 'name', label: 'Name', icon: UserPlus },
    { id: 'url', label: 'URL', icon: LinkIcon },
    { id: 'tracked', label: 'Tracked', icon: Check },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-accent/10 flex items-center justify-center">
                  <Settings2 className="w-5 h-5 text-brand-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Configure Channels</h2>
                  <p className="text-xs text-zinc-500">Manage your tracked creators and search for new ones</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10 bg-black/20">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as TabType);
                    setSearchResults([]);
                    setInputValue('');
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all relative ${
                    activeTab === tab.id ? 'text-brand-accent' : 'text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {activeTab === tab.id && (
                    <motion.div 
                      layoutId="activeTab"
                      className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-accent"
                    />
                  )}
                </button>
              ))}
            </div>

            {/* Search Area */}
            <div className="p-6">
              {activeTab !== 'tracked' && (
                <div className="flex gap-2 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                    <input 
                      type="text"
                      placeholder={
                        activeTab === 'keyword' ? 'Enter niche or keyword (e.g. AI, Crypto)...' :
                        activeTab === 'name' ? 'Enter creator name or username...' :
                        'Paste channel URL here...'
                      }
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-brand-accent/50 transition-all"
                    />
                  </div>
                  <button 
                    onClick={handleSearch}
                    disabled={isSearching || !inputValue}
                    className="px-6 py-3 rounded-xl bg-brand-accent text-white font-bold text-sm hover:bg-brand-accent/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
                    {activeTab === 'url' ? 'Add' : 'Search'}
                  </button>
                </div>
              )}

              {/* Results Area */}
              <div className="space-y-4 overflow-y-auto max-h-[50vh] pr-2 no-scrollbar">
                {isSearching ? (
                  <div className="flex flex-col items-center justify-center py-12 gap-4">
                    <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                    <p className="text-sm text-zinc-500 font-medium">Searching for creators...</p>
                  </div>
                ) : activeTab === 'tracked' ? (
                  trackedChannels.length > 0 ? (
                    trackedChannels.map((channel) => (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        key={channel.id}
                        className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="relative">
                            <img 
                              src={channel.avatarUrl} 
                              alt={channel.username}
                              className="w-12 h-12 rounded-xl object-cover"
                            />
                            <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center">
                              <Instagram className="w-3 h-3 text-pink-500" />
                            </div>
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-white">{channel.fullName}</h4>
                            <p className="text-xs text-zinc-500">@{channel.username}</p>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => onRemoveChannel(channel.id)}
                          className="px-4 py-2 rounded-lg text-xs font-bold transition-all bg-red-500/10 text-red-500 hover:bg-red-500/20"
                        >
                          Remove
                        </button>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center py-12">
                      <Check className="w-12 h-12 text-zinc-500 mx-auto mb-4 opacity-20" />
                      <p className="text-sm text-zinc-500">You haven't tracked any channels yet</p>
                    </div>
                  )
                ) : searchResults.length > 0 ? (
                  searchResults.map((result) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      key={result.id}
                      className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <img 
                            src={result.avatarUrl} 
                            alt={result.username}
                            className="w-12 h-12 rounded-xl object-cover"
                          />
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-black border border-white/10 flex items-center justify-center">
                            <Instagram className="w-3 h-3 text-pink-500" />
                          </div>
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-white">{result.fullName}</h4>
                          <p className="text-xs text-zinc-500">@{result.username}</p>
                        </div>
                      </div>
                      
                      <button
                        onClick={() => onAddChannel(result)}
                        disabled={isAlreadyTracked(result.username)}
                        className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                          isAlreadyTracked(result.username)
                            ? 'bg-emerald-500/10 text-emerald-500 cursor-default'
                            : 'bg-white text-black hover:bg-zinc-200'
                        }`}
                      >
                        {isAlreadyTracked(result.username) ? (
                          <>
                            <Check className="w-3 h-3" />
                            Tracked
                          </>
                        ) : (
                          <>
                            <Plus className="w-3 h-3" />
                            Track Channel
                          </>
                        )}
                      </button>
                    </motion.div>
                  ))
                ) : !isSearching && inputValue && searchResults.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-sm text-zinc-500">No creators found for "{inputValue}"</p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-sm text-zinc-500">Enter a search term to find creators</p>
                  </div>
                )}
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-white/10 bg-white/[0.01] flex justify-between items-center">
              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">
                {trackedChannels.length} Channels Tracked
              </p>
              <button 
                onClick={onClose}
                className="px-6 py-2 rounded-xl bg-white/5 text-white font-bold text-sm hover:bg-white/10 transition-all"
              >
                Done
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ConfigureChannelModal;
