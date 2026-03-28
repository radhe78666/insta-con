import React, { useState } from 'react';
import { 
  Play, 
  Bookmark, 
  ExternalLink, 
  Copy, 
  FileText, 
  Zap, 
  TrendingUp, 
  Eye, 
  Clock,
  ChevronLeft,
  Sparkles,
  Layers,
  Quote,
  Layout,
  MessageSquare,
  Info,
  Check,
  Share2,
  Trash2,
  Plus
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { InstagramVideo, InstagramChannel } from '../types';
import { AIAnalysis } from '../services/aiService';
import { Loader2, RefreshCcw, AlertCircle } from 'lucide-react';

interface AnalysisProps {
  video: InstagramVideo;
  channel?: InstagramChannel;
  onBack: () => void;
  onViewDetails: (video: InstagramVideo) => void;
  onRemove: (id: string) => void;
}

type TabType = 'transcript' | 'idea' | 'hook' | 'storytelling' | 'layout';

const Analysis: React.FC<AnalysisProps> = ({ video, channel, onBack, onViewDetails, onRemove }) => {
  const [activeTab, setActiveTab] = useState<TabType>('transcript');
  const [copied, setCopied] = useState(false);

  const analysisData: AIAnalysis | null = React.useMemo(() => {
    if (!video.analysis) return null;
    try {
      return JSON.parse(video.analysis);
    } catch (e) {
      console.error('Failed to parse analysis data', e);
      return null;
    }
  }, [video.analysis]);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  };

  const handleCopyTranscript = () => {
    if (video.transcript) {
      navigator.clipboard.writeText(video.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const tabs = [
    { id: 'transcript', label: 'Transcript', icon: Quote },
    { id: 'idea', label: 'Idea Analysis', icon: Sparkles },
    { id: 'hook', label: 'Hook', icon: Zap },
    { id: 'storytelling', label: 'Storytelling Format', icon: MessageSquare },
    { id: 'layout', label: 'Visual Layout', icon: Layout },
  ];

  return (
    <div className="flex flex-col h-full bg-brand-bg overflow-hidden">
      {/* Header */}
      <header className="h-14 border-b border-brand-border bg-brand-bg/50 backdrop-blur-md flex items-center justify-between px-4 flex-shrink-0 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h1 className="text-base font-bold text-white truncate max-w-md">
            {video.caption}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onViewDetails(video)}
            className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white font-bold text-xs hover:bg-white/10 transition-all flex items-center gap-2"
          >
            <Info className="w-3.5 h-3.5" />
            View Details
          </button>
          <button className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-400 hover:text-white transition-all">
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-4 no-scrollbar">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[300px_1fr] gap-6">
          
          {/* Left Column: Video & Actions */}
          <div className="flex flex-col gap-4">
            {/* Video Preview Card */}
            <div className="bg-brand-surface border border-brand-border rounded-[24px] overflow-hidden shadow-xl">
              <div className="aspect-[9/16] relative group">
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.caption}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-brand-accent/90 flex items-center justify-center shadow-2xl transform transition-transform group-hover:scale-110">
                    <Play className="w-5 h-5 text-white fill-current ml-1" />
                  </div>
                </div>
                
                {/* Channel Overlay */}
                <div className="absolute bottom-3 left-3 right-3 flex items-center gap-2">
                  <img 
                    src={channel?.avatarUrl} 
                    alt={channel?.username}
                    className="w-8 h-8 rounded-full border border-white/20"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold text-white">@{channel?.username}</span>
                    <span className="text-[9px] text-zinc-400">3 days ago</span>
                  </div>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="p-3 grid grid-cols-3 gap-1.5 border-t border-white/5">
                <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-white/5">
                  <Zap className="w-3 h-3 text-brand-accent fill-current" />
                  <span className="text-[10px] font-black text-white">{video.outlierScore}x</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-white/5">
                  <Eye className="w-3 h-3 text-blue-400" />
                  <span className="text-[10px] font-black text-white">{formatNumber(video.views)}</span>
                </div>
                <div className="flex flex-col items-center gap-0.5 py-1.5 rounded-lg bg-white/5">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] font-black text-white">{(video.engagement * 100).toFixed(1)}%</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col gap-1.5">
              <button className="w-full py-2.5 bg-white/5 border border-white/10 text-zinc-500 font-bold rounded-xl flex items-center justify-center gap-2 text-[11px] opacity-40 cursor-not-allowed">
                <FileText className="w-3.5 h-3.5" />
                Create Script
              </button>
              
              <div className="grid grid-cols-1 gap-1.5">
                <button className="w-full py-2.5 px-3 bg-white/5 border border-white/10 text-zinc-500 font-bold rounded-xl flex items-center gap-2.5 text-[11px] opacity-40 cursor-not-allowed">
                  <Plus className="w-3.5 h-3.5" />
                  Add to project
                </button>
                
                <button 
                  onClick={() => onRemove(video.id)}
                  className="w-full py-2.5 px-3 bg-white/5 border border-white/10 text-red-400/60 font-bold rounded-xl hover:bg-red-500/10 hover:border-red-500/20 transition-all flex items-center gap-2.5 text-[11px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove from library
                </button>

                <button className="w-full py-2.5 px-3 bg-white/5 border border-white/10 text-zinc-400 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2.5 text-[11px]">
                  <Layers className="w-3.5 h-3.5" />
                  Export for LLM
                </button>

                <a 
                  href={video.videoUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-3 bg-white/5 border border-white/10 text-zinc-400 font-bold rounded-xl hover:bg-white/10 transition-all flex items-center gap-2.5 text-[11px]"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Go to Instagram
                </a>
              </div>
            </div>
          </div>

          {/* Right Column: Analysis Content */}
          <div className="flex flex-col gap-6">
            {/* Summary Section */}
            <section className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 relative overflow-hidden">
              {video.status !== 'completed' && (
                <div className="absolute inset-0 bg-brand-bg/60 backdrop-blur-[2px] z-10 flex items-center justify-center flex-col gap-3">
                  {video.status === 'failed' ? (
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  ) : (
                    <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                  )}
                  <div className="text-center px-4">
                    <p className="text-white font-bold text-sm">
                      {video.status === 'transcribing' ? 'Transcribing Video...' : 
                       video.status === 'analyzing' ? 'Analyzing Content...' : 
                       video.status === 'failed' ? 'Analysis Failed' : 
                       'Waiting for Process...'}
                    </p>
                    {video.status === 'failed' ? (
                      <p className="text-red-400/80 text-[10px] mt-1">{video.error || 'Server error occurred'}</p>
                    ) : (
                      <p className="text-zinc-500 text-[10px]">This usually takes 15-30 seconds</p>
                    )}
                  </div>
                </div>
              )}
              
              <h2 className="text-lg font-bold text-white mb-3 flex items-center gap-2">
                Summary
                {video.status === 'completed' && <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold uppercase tracking-widest border border-emerald-500/20">AI Generated</span>}
              </h2>
              <p className="text-zinc-400 leading-relaxed text-base">
                {analysisData?.summary || "Analysis in progress... We are extracting key themes and summarizing the core message for you."}
              </p>
            </section>

            {/* Tabs Navigation */}
            <div className="bg-white/5 p-1 rounded-xl flex items-center gap-1 overflow-x-auto no-scrollbar">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[11px] font-bold transition-all whitespace-nowrap ${
                    activeTab === tab.id 
                      ? 'bg-brand-accent text-white shadow-lg shadow-brand-accent/20' 
                      : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/5'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="bg-white/[0.02] border border-white/5 rounded-[24px] p-6 flex-1 min-h-[400px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="h-full"
                >
                  {activeTab === 'transcript' && (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                            <Quote className="w-4 h-4 text-brand-accent" />
                          </div>
                          <div>
                            <h3 className="text-base font-bold text-white">Transcript</h3>
                            <p className="text-[10px] text-zinc-500">{video.transcript?.split(' ').length || 0} words analyzed</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={handleCopyTranscript}
                            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border transition-all text-[10px] font-bold ${
                              copied ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                            }`}
                          >
                            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            {copied ? 'Copied' : 'Copy'}
                          </button>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {video.status === 'completed' || video.transcript ? (
                          <div className="bg-brand-bg/30 p-4 rounded-xl border border-white/5">
                            <p className="text-white/90 leading-relaxed text-base font-medium whitespace-pre-wrap">
                              {video.transcript}
                            </p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center justify-center py-20 gap-4 opacity-50">
                            <Loader2 className="w-10 h-10 text-zinc-600 animate-spin" />
                            <p className="text-zinc-500 text-sm">Transcription in progress...</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeTab === 'idea' && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-brand-accent" />
                        </div>
                        <h3 className="text-base font-bold text-white">Idea Analysis</h3>
                      </div>

                      {analysisData?.idea_analysis ? (
                        <div className="grid grid-cols-1 gap-6">
                          {[
                            { label: 'TOPIC', value: analysisData.idea_analysis?.topic || 'N/A' },
                            { label: 'IDEA SEED', value: analysisData.idea_analysis?.idea_seed || 'N/A' },
                            { label: 'UNIQUE ANGLE', value: analysisData.idea_analysis?.unique_angle || 'N/A' },
                            { label: 'COMMON BELIEF TO CHALLENGE', value: analysisData.idea_analysis?.common_belief_to_challenge || 'N/A' },
                            { label: 'CONTRARIAN REALITY', value: analysisData.idea_analysis?.contrarian_reality || 'N/A' }
                          ].map((item, i) => (
                            <div key={i} className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">{item.label}</span>
                              <p className="text-white text-base font-medium leading-relaxed">{item.value}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                          <p className="text-zinc-500 text-sm">Waiting for AI analysis...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'hook' && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                          <Zap className="w-4 h-4 text-brand-accent" />
                        </div>
                        <h3 className="text-base font-bold text-white">Hook Breakdown</h3>
                      </div>

                      {analysisData?.hooks && Array.isArray(analysisData.hooks) ? (
                        <div className="grid grid-cols-1 gap-8">
                          {analysisData.hooks.map((hook, i) => (
                            <div key={i} className="grid grid-cols-1 gap-6 p-6 rounded-2xl bg-white/5 border border-white/5">
                              <div className="flex flex-col gap-1.5">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">FORMULA</span>
                                <p className="text-white text-sm font-medium italic">{hook?.formula || 'N/A'}</p>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">TEXT</span>
                                <p className="text-white text-lg font-bold">"{hook?.text || 'N/A'}"</p>
                              </div>

                              <div className="flex flex-col gap-1.5">
                                <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ANALYSIS</span>
                                <p className="text-zinc-400 text-base leading-relaxed">{hook?.analysis || 'N/A'}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                          <p className="text-zinc-500 text-sm">Hook analysis in progress...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'storytelling' && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                          <MessageSquare className="w-4 h-4 text-brand-accent" />
                        </div>
                        <h3 className="text-base font-bold text-white">Storytelling Format</h3>
                      </div>

                      {analysisData?.storytelling ? (
                        <div className="grid grid-cols-1 gap-6">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">CATEGORY</span>
                            <span className="w-fit px-2.5 py-1 rounded-lg bg-white/5 text-zinc-300 text-[10px] font-bold">{analysisData.storytelling?.category || 'N/A'}</span>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">DESCRIPTION</span>
                            <p className="text-white text-base font-medium">{analysisData.storytelling?.description || 'N/A'}</p>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">ANALYSIS</span>
                            <p className="text-zinc-400 text-base leading-relaxed">{analysisData.storytelling?.analysis || 'N/A'}</p>
                          </div>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                          <p className="text-zinc-500 text-sm">Storytelling analysis in progress...</p>
                        </div>
                      )}
                    </div>
                  )}

                  {activeTab === 'layout' && (
                    <div className="space-y-8">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-brand-accent/10 flex items-center justify-center">
                          <Layout className="w-4 h-4 text-brand-accent" />
                        </div>
                        <h3 className="text-base font-bold text-white">Visual Layout</h3>
                      </div>

                      {analysisData?.visual_layout ? (
                        <>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">CATEGORY</span>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white text-sm font-bold">{analysisData.visual_layout?.category || 'N/A'}</span>
                              </div>
                            </div>

                            <div className="flex flex-col gap-1.5">
                              <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">SUB-CATEGORY</span>
                              <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                                <span className="text-white text-sm font-bold">{analysisData.visual_layout?.sub_category || 'N/A'}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col gap-1.5">
                            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-widest">VISUAL ELEMENTS</span>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {(analysisData.visual_layout?.visual_elements || []).map((item: string, i: number) => (
                                <li key={i} className="flex items-center gap-2.5 p-2.5 rounded-lg bg-white/5 text-zinc-300 text-[11px] font-medium">
                                  <div className="w-1 h-1 rounded-full bg-brand-accent" />
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </>
                      ) : (
                        <div className="flex flex-col items-center justify-center py-20 opacity-40">
                          <p className="text-zinc-500 text-sm">Visual analysis in progress...</p>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Analysis;
