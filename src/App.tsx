import React, { useState } from 'react';
import { InstagramVideo, InstagramChannel, User } from './types';
import { transcribeVideo } from './services/transcriptionService';
import { analyzeContent } from './services/aiService';
import { MOCK_VIDEOS, MOCK_CHANNELS } from './mockData';
import { supabase } from './lib/supabase';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Discovery from './components/Discovery';
import Channels from './components/Channels';
import Analysis from './components/Analysis';
import Auth from './components/Auth';
import ResetPassword from './components/ResetPassword';
import ConfigureChannelModal from './components/ConfigureChannelModal';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  Instagram, 
  X, 
  Eye, 
  TrendingUp, 
  Zap, 
  Clock, 
  BookmarkCheck, 
  Bookmark, 
  ExternalLink 
} from 'lucide-react';

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isResettingPassword, setIsResettingPassword] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [user, setUser] = useState<User | null>(null);
  const [savedVideos, setSavedVideos] = useState<InstagramVideo[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(true);
  const [trackedChannels, setTrackedChannels] = useState<InstagramChannel[]>([]);
  const [isConfigureModalOpen, setIsConfigureModalOpen] = useState(false);
  const [selectedVideoForAnalysis, setSelectedVideoForAnalysis] = useState<InstagramVideo | null>(null);
  const [selectedVideoDetails, setSelectedVideoDetails] = useState<InstagramVideo | null>(null);
  
  // Cache for Feed and Discovery videos
  const [feedVideos, setFeedVideos] = useState<InstagramVideo[]>([]);
  const [discoveryVideos, setDiscoveryVideos] = useState<InstagramVideo[]>([]);
  const [isLoadingFeed, setIsLoadingFeed] = useState(false);
  const [isLoadingDiscovery, setIsLoadingDiscovery] = useState(false);
  const [channelCursors, setChannelCursors] = useState<Record<string, string>>({});
  const [visitedTabs, setVisitedTabs] = useState<Set<string>>(new Set(['dashboard']));

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    setVisitedTabs(prev => new Set(prev).add(tab));
  };

  React.useEffect(() => {
    if (!user) {
      setTrackedChannels([]);
      setSavedVideos([]);
      return;
    }

    const fetchData = async () => {
      const { data: channelsData } = await supabase
        .from('tracked_channels')
        .select('*')
        .eq('user_id', user.id);
        
      if (channelsData) {
        setTrackedChannels(channelsData.map(c => ({
          id: c.id,
          username: c.username,
          fullName: c.full_name,
          avatarUrl: c.avatar_url || '',
          followers: c.followers || 0,
          description: c.description || '',
          niche: 'Instagram User',
          platform: c.platform || 'Instagram'
        })));
      }

      const { data: videosData } = await supabase
        .from('saved_videos')
        .select('*')
        .eq('user_id', user.id);
        
      if (videosData) {
        setSavedVideos(videosData.map(v => ({
          id: v.id,
          channelId: v.channel_id,
          thumbnailUrl: v.thumbnail_url || '',
          caption: v.caption || '',
          views: v.views || 0,
          engagement: isNaN(Number(v.engagement)) ? 0 : Number(v.engagement),
          outlierScore: isNaN(Number(v.outlier_score)) ? 1 : Number(v.outlier_score),
          postedAt: v.posted_at,
          platform: v.platform || 'Instagram',
          videoUrl: v.video_url || '',
          status: v.status || 'completed',
          transcript: v.transcript || '',
          analysis: v.analysis || '',
          error: v.error || ''
        } as InstagramVideo)));
      }
    };
    
    fetchData();
  }, [user?.id]);

  React.useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'User',
          plan: 'Pro',
          usage: { videosAnalyzed: 0, limit: 100 }
        });
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || 'User',
          plan: 'Pro',
          usage: { videosAnalyzed: 0, limit: 100 }
        });
      } else {
        setUser(null);
      }
    });

    // Handle recovery flow detection
    const handleHashCheck = () => {
      const hash = window.location.hash;
      if (hash && hash.includes('type=recovery')) {
        setIsResettingPassword(true);
      }
    };

    handleHashCheck();
    window.addEventListener('hashchange', handleHashCheck);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashCheck);
    };
  }, []);



  const handleLogin = (email: string) => {
    // Handled by Auth.tsx and onAuthStateChange
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsAuthenticated(false);
    setUser(null);
  };

  const startAnalysis = async (video: InstagramVideo) => {
    // Update state to transcribing
    setSavedVideos(prev => 
      prev.map(v => v.id === video.id ? { ...v, status: 'transcribing' } : v)
    );

    try {
      // 1. Transcription
      const transResult = await transcribeVideo(video.videoUrl);
      
      setSavedVideos(prev => 
        prev.map(v => v.id === video.id ? { ...v, status: 'analyzing', transcript: transResult.transcript } : v)
      );

      // 2. AI Analysis
      const aiResult = await analyzeContent(transResult.transcript);
      const analysisJson = JSON.stringify(aiResult);

      setSavedVideos(prev => 
        prev.map(v => v.id === video.id ? { ...v, status: 'completed', analysis: analysisJson } : v)
      );

      // 3. Save to Supabase
      if (user) {
        await supabase.from('saved_videos').update({
          transcript: transResult.transcript,
          analysis: analysisJson,
          status: 'completed'
        }).match({ user_id: user.id, id: video.id });
      }
    } catch (error: any) {
      console.error('Analysis failed:', error);
      setSavedVideos(prev => 
        prev.map(v => v.id === video.id ? { ...v, status: 'failed', error: error.message } : v)
      );
      if (user) {
        await supabase.from('saved_videos').update({
          status: 'failed',
          error: error.message
        }).match({ user_id: user.id, id: video.id });
      }
    }
  };

  const handleAddToLibrary = async (video: InstagramVideo) => {
    const videoWithStatus: InstagramVideo = { ...video, status: 'idle' };
    
    setSavedVideos(prev => {
      if (!prev.find(v => v.id === video.id)) return [...prev, videoWithStatus];
      return prev;
    });

    if (user) {
      await supabase.from('saved_videos').upsert({
        id: video.id,
        user_id: user.id,
        channel_id: video.channelId,
        thumbnail_url: video.thumbnailUrl,
        caption: video.caption,
        views: video.views,
        engagement: video.engagement,
        outlier_score: video.outlierScore,
        posted_at: video.postedAt,
        platform: video.platform,
        video_url: video.videoUrl,
        status: 'idle'
      });
    }

    // Start background analysis
    startAnalysis(videoWithStatus);
  };

  const handleRemoveFromLibrary = async (id: string) => {
    setSavedVideos(prev => prev.filter(v => v.id !== id));
    if (user) {
      await supabase.from('saved_videos').delete().match({ user_id: user.id, id });
    }
  };

  const handleAddChannel = async (channel: InstagramChannel) => {
    setTrackedChannels(prev => {
      if (!prev.find(c => c.username === channel.username)) return [channel, ...prev];
      return prev;
    });
    
    if (user) {
      await supabase.from('tracked_channels').upsert({
        id: channel.id,
        user_id: user.id,
        username: channel.username,
        full_name: channel.fullName,
        avatar_url: channel.avatarUrl,
        followers: channel.followers,
        description: channel.description,
        platform: channel.platform
      });
    }
  };

  const handleRemoveChannel = async (id: string) => {
    setTrackedChannels(prev => prev.filter(c => c.id !== id));
    
    if (user) {
      await supabase.from('tracked_channels').delete().match({ user_id: user.id, id });
    }
  };

  const getChannel = (channelId: string) => {
    return trackedChannels.find(c => c.id === channelId);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'just now';
    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d`;
    return date.toLocaleDateString();
  };

  if (isResettingPassword) {
    return (
      <ResetPassword 
        onComplete={() => {
          setIsResettingPassword(false);
          // Clear hash to prevent re-triggering
          window.location.hash = '';
        }} 
      />
    );
  }

  if (!isAuthenticated || !user) {
    return <Auth onLogin={handleLogin} />;
  }

  const renderComponent = (tab: string) => {
    switch (tab) {
      case 'dashboard':
        return <Dashboard user={user} />;
      case 'discovery':
        return (
          <Discovery 
            onAddToLibrary={handleAddToLibrary} 
            savedVideos={savedVideos} 
            initialView="Feed" 
            setActiveTab={handleTabChange} 
            isFilterOpen={isFilterOpen} 
            setIsFilterOpen={setIsFilterOpen} 
            trackedChannels={trackedChannels} 
            onOpenConfigure={() => setIsConfigureModalOpen(true)}
            selectedVideoDetails={selectedVideoDetails}
            setSelectedVideoDetails={setSelectedVideoDetails}
            apiVideos={feedVideos}
            setApiVideos={setFeedVideos}
            isLoadingVideos={isLoadingFeed}
            setIsLoadingVideos={setIsLoadingFeed}
            channelCursors={channelCursors}
            setChannelCursors={setChannelCursors}
          />
        );
      case 'videos':
        return (
          <Discovery 
            onAddToLibrary={handleAddToLibrary} 
            savedVideos={savedVideos} 
            initialView="Videos" 
            setActiveTab={handleTabChange} 
            isFilterOpen={isFilterOpen} 
            setIsFilterOpen={setIsFilterOpen} 
            trackedChannels={trackedChannels} 
            onOpenConfigure={() => setIsConfigureModalOpen(true)}
            selectedVideoDetails={selectedVideoDetails}
            setSelectedVideoDetails={setSelectedVideoDetails}
            apiVideos={discoveryVideos}
            setApiVideos={setDiscoveryVideos}
            isLoadingVideos={isLoadingDiscovery}
            setIsLoadingVideos={setIsLoadingDiscovery}
          />
        );
      case 'library':
        return (
          <Discovery 
            onAddToLibrary={handleAddToLibrary} 
            savedVideos={savedVideos} 
            initialView="Library" 
            setActiveTab={handleTabChange} 
            isFilterOpen={isFilterOpen} 
            setIsFilterOpen={setIsFilterOpen} 
            trackedChannels={trackedChannels} 
            onOpenConfigure={() => setIsConfigureModalOpen(true)}
            onViewAnalysis={(video) => {
              setSelectedVideoForAnalysis(video);
              setActiveTab('analysis');
            }}
            selectedVideoDetails={selectedVideoDetails}
            setSelectedVideoDetails={setSelectedVideoDetails}
            apiVideos={[]}
            setApiVideos={() => {}}
            isLoadingVideos={false}
            setIsLoadingVideos={() => {}}
          />
        );
      case 'channels':
        return <Channels setActiveTab={handleTabChange} trackedChannels={trackedChannels} onOpenConfigure={() => setIsConfigureModalOpen(true)} onRemoveChannel={handleRemoveChannel} />;
      case 'analysis': {
        const currentVideo = selectedVideoForAnalysis 
          ? (savedVideos.find(v => v.id === selectedVideoForAnalysis.id) || selectedVideoForAnalysis)
          : null;
          
        return currentVideo ? (
          <Analysis 
            video={currentVideo}
            channel={trackedChannels.find(c => c.id === currentVideo.channelId)}
            onBack={() => handleTabChange('library')}
            onViewDetails={(video) => setSelectedVideoDetails(video)}
            onRemove={(id) => {
              handleRemoveFromLibrary(id);
              handleTabChange('library');
            }}
          />
        ) : null;
      }
      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen bg-brand-bg">
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={handleTabChange} 
        user={user} 
        onLogout={handleLogout} 
      />
      
      <main className="flex-1 pl-20 transition-all duration-300 h-screen">
        <div className="h-full w-full relative overflow-hidden">
          {['dashboard', 'discovery', 'videos', 'library', 'channels', 'analysis'].map((tab) => (
            <div 
              key={tab}
              className={`absolute inset-0 w-full h-full overflow-y-auto ${
                activeTab === tab ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              {visitedTabs.has(tab) && renderComponent(tab)}
            </div>
          ))}
        </div>
      </main>

      <ConfigureChannelModal 
        isOpen={isConfigureModalOpen}
        onClose={() => setIsConfigureModalOpen(false)}
        onAddChannel={handleAddChannel}
        onRemoveChannel={handleRemoveChannel}
        trackedChannels={trackedChannels}
      />

      {/* Global Video Details Modal */}
      <AnimatePresence>
        {selectedVideoDetails && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedVideoDetails(null)}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-[32px] shadow-2xl overflow-hidden flex flex-col md:flex-row h-auto max-h-[90vh]"
            >
              {/* Left Side: Video Thumbnail */}
              <a 
                href={selectedVideoDetails.videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="md:w-[40%] relative bg-black flex items-center justify-center group overflow-hidden aspect-[9/16] md:aspect-auto cursor-pointer block hover:opacity-90 transition-opacity"
              >
                <img 
                  src={selectedVideoDetails.thumbnailUrl} 
                  alt={selectedVideoDetails.caption}
                  className="w-full h-full object-cover opacity-80"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-14 h-14 rounded-full bg-brand-accent/90 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                    <Play className="w-5 h-5 text-white fill-current ml-1" />
                  </div>
                </div>
                
                {/* Platform Badge */}
                <div className="absolute top-4 left-4 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-2">
                  <Instagram className="w-3 h-3 text-brand-accent" />
                  <span className="text-[10px] font-bold text-white">Instagram</span>
                </div>
              </a>

              {/* Right Side: Details */}
              <div className="md:w-[60%] p-5 flex flex-col bg-brand-surface/50 overflow-y-auto">
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={getChannel(selectedVideoDetails.channelId)?.avatarUrl} 
                      alt={getChannel(selectedVideoDetails.channelId)?.username}
                      className="w-7 h-7 rounded-full border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <h4 className="text-xs font-bold text-white">@{getChannel(selectedVideoDetails.channelId)?.username}</h4>
                      <p className="text-[9px] text-zinc-500">{getChannel(selectedVideoDetails.channelId)?.fullName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedVideoDetails(null)}
                    className="p-1.5 rounded-full hover:bg-white/5 text-zinc-500 hover:text-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex-1 mb-5">
                  <h3 className="text-base font-bold text-white mb-4 leading-snug">
                    {selectedVideoDetails.caption}
                  </h3>

                  <div className="grid grid-cols-2 gap-2.5 mb-5">
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Views</span>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3 text-brand-accent" />
                        <span className="text-sm font-black text-white">{formatNumber(selectedVideoDetails.views)}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Likes</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-brand-accent" />
                        <span className="text-sm font-black text-white">{formatNumber(Math.floor(selectedVideoDetails.views * selectedVideoDetails.engagement))}</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Outline Score</span>
                      <div className="flex items-center gap-1">
                        <Zap className="w-3 h-3 text-brand-accent fill-current" />
                        <span className="text-sm font-black text-white">{selectedVideoDetails.outlierScore}x</span>
                      </div>
                    </div>
                    <div className="bg-white/5 border border-white/10 rounded-xl p-2.5 flex flex-col gap-0.5">
                      <span className="text-[8px] uppercase tracking-widest text-zinc-500 font-bold">Engagement</span>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3 h-3 text-brand-accent" />
                        <span className="text-sm font-black text-white">{(selectedVideoDetails.engagement * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-zinc-500 text-[10px] font-medium">
                    <Clock className="w-3 h-3" />
                    <span>Uploaded {formatTimeAgo(selectedVideoDetails.postedAt)} ago</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2 mt-auto">
                  <button 
                    onClick={() => {
                      if (!savedVideos.some(v => v.id === selectedVideoDetails.id)) {
                        handleAddToLibrary(selectedVideoDetails);
                      }
                      setSelectedVideoDetails(null);
                    }}
                    className={`w-full py-2.5 font-black rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 text-xs ${
                      savedVideos.some(v => v.id === selectedVideoDetails.id)
                        ? 'bg-emerald-500 text-white cursor-default'
                        : 'bg-brand-accent text-white hover:bg-brand-accent/90 shadow-brand-accent/20'
                    }`}
                  >
                    {savedVideos.some(v => v.id === selectedVideoDetails.id) ? (
                      <>
                        <BookmarkCheck className="w-3.5 h-3.5" />
                        Saved to Library
                      </>
                    ) : (
                      <>
                        <Bookmark className="w-3.5 h-3.5" />
                        Save to Library
                      </>
                    )}
                  </button>
                  <a 
                    href={selectedVideoDetails.videoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2.5 bg-white/5 border border-white/10 text-white font-bold rounded-xl hover:bg-white/10 transition-all text-xs flex items-center justify-center gap-2"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View on {selectedVideoDetails.platform}
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
