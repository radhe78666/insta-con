import { useState } from 'react';
import './FeedPage.css';

/* ─── Mock Data ─── */
const MOCK_VIDEOS = [
  { id: 1,  channel: 'hustle.faceless',    handle: '@hustle.faceless',    avatar: 'H', followers: 78000,  thumbnail: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&q=80', title: 'This AI creates and edits videos automatically', views: 102000, engagement: 3.2, outlier: 1.2, daysAgo: 2, platform: 'instagram', saved: false },
  { id: 2,  channel: 'sebastienjefferies', handle: '@sebastienjefferies', avatar: 'S', followers: 64000,  thumbnail: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80', title: 'If you need to translate content in seconds', views: 17000, engagement: 4.8, outlier: 2.4, daysAgo: 2, platform: 'youtube', saved: false },
  { id: 3,  channel: 'artificialintelligen',handle: '@artificialintelligen',avatar: 'A', followers: 293000, thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400&q=80', title: 'These AI-generated videos are insane', views: 33000, engagement: 2.1, outlier: 1.1, daysAgo: 2, platform: 'instagram', saved: false },
  { id: 4,  channel: 'mendy.ai',            handle: '@mendy.ai',            avatar: 'M', followers: 54000,  thumbnail: 'https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?w=400&q=80', title: 'Comment "epoxy" for the full tutorial link', views: 300000,engagement: 5.0, outlier: 3.0, daysAgo: 3, platform: 'instagram', saved: false },
  { id: 5,  channel: 'airesearches',        handle: '@airesearches',        avatar: 'A', followers: 1100000,thumbnail: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80', title: 'Scientists just copied a fruit fly brain', views: 82000, engagement: 6.1, outlier: 0.9, daysAgo: 4, platform: 'instagram', saved: false },
  { id: 6,  channel: 'davidondrej',         handle: '@davidondrej',         avatar: 'D', followers: 349000, thumbnail: 'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?w=400&q=80', title: 'Beast Challenge: Escape Dubai', views: 214000,engagement: 3.8, outlier: 2.1, daysAgo: 3, platform: 'youtube', saved: false },
  { id: 7,  channel: 'digitaljeff',         handle: '@digitaljeff',         avatar: 'D', followers: 381000, thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&q=80', title: 'The collapse of trust in AI', views: 79000, engagement: 7.2, outlier: 1.8, daysAgo: 5, platform: 'instagram', saved: false },
  { id: 8,  channel: 'higgsfield.ai',       handle: '@higgsfield.ai',       avatar: 'H', followers: 614000, thumbnail: 'https://images.unsplash.com/photo-1626544827763-d516dce335e2?w=400&q=80', title: '$500,000 Action Contest — Enter Now', views: 39000, engagement: 4.5, outlier: 0.7, daysAgo: 6, platform: 'instagram', saved: false },
  { id: 9,  channel: 'drk_talks',           handle: '@drk_talks',           avatar: 'D', followers: 392000, thumbnail: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&q=80', title: 'AI-powered social media strategy 2026', views: 211000,engagement: 4.1, outlier: 2.8, daysAgo: 4, platform: 'instagram', saved: false },
  { id: 10, channel: 'heysirio',            handle: '@heysirio',            avatar: 'H', followers: 306000, thumbnail: 'https://images.unsplash.com/photo-1593642634524-b40b5baae6bb?w=400&q=80', title: 'AI tool tutorials for creatives in 2026', views: 107000,engagement: 3.6, outlier: 1.5, daysAgo: 3, platform: 'instagram', saved: false },
];

const FOLLOWER_FILTERS = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Nano (<10K)', min: 0, max: 10000 },
  { label: 'Micro (10K–50K)', min: 10000, max: 50000 },
  { label: 'Mid (50–200K)', min: 50000, max: 200000 },
  { label: 'Macro (200–500K)', min: 200000, max: 500000 },
  { label: 'Mega (500K–1M)', min: 500000, max: 1000000 },
  { label: '1M+', min: 1000000, max: Infinity },
];
const SORT_OPTIONS = [
  { label: 'Newest', key: 'newest' },
  { label: 'Most Views', key: 'views' },
  { label: 'Engagement', key: 'engagement' },
  { label: 'Outlier Score', key: 'outlier' },
];
const PLATFORMS = ['All platforms', 'Instagram', 'YouTube', 'TikTok'];

const fmtNum = (n) => {
  if (typeof n === 'string') return n;
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n;
};

/* Platform icon */
const PlatformIcon = ({ type }) => {
  if (type === 'youtube') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M22.54 6.42a2.78 2.78 0 00-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 001.46 6.42 29 29 0 001 12a29 29 0 00.46 5.58 2.78 2.78 0 001.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 001.95-1.96A29 29 0 0023 12a29 29 0 00-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#111"/></svg>
  );
  if (type === 'tiktok') return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.19a8.15 8.15 0 004.77 1.52V6.25a4.85 4.85 0 01-1-.56z"/></svg>
  );
  // Instagram default
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="2" y="2" width="20" height="20" rx="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/></svg>
  );
};

const platformBg = (type) => {
  if (type === 'youtube') return 'rgba(255,0,0,0.7)';
  if (type === 'tiktok')  return 'rgba(0,0,0,0.8)';
  return 'rgba(193,53,132,0.7)';
};

export default function FeedPage() {
  const [activeTab, setActiveTab] = useState('feed');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [configTab, setConfigTab] = useState('keyword');

  /* Saved channels */
  const [savedChannels, setSavedChannels] = useState([
    { id: 1, name: 'hustle.faceless',    handle: '@hustle.faceless',    avatar: 'H', followers: 78000 },
    { id: 2, name: 'sebastienjefferies', handle: '@sebastienjefferies', avatar: 'S', followers: 64000 },
  ]);

  /* Feed filters */
  const [selectedChannelId, setSelectedChannelId] = useState('all'); // 'all' or id
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [filterOutlierMin, setFilterOutlierMin] = useState('1');
  const [filterOutlierMax, setFilterOutlierMax] = useState('100');
  const [filterViewsMin, setFilterViewsMin] = useState('0');
  const [filterViewsMax, setFilterViewsMax] = useState('10000000');
  const [filterEngMin, setFilterEngMin] = useState('0');
  const [filterEngMax, setFilterEngMax] = useState('100');
  const [filterDays, setFilterDays] = useState('0');
  const [filterDaysUnit, setFilterDaysUnit] = useState('Months');
  const [filterPlatform, setFilterPlatform] = useState('Instagram');
  const [filterKeyword, setFilterKeyword] = useState('');

  /* Library */
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [library, setLibrary] = useState([]);

  /* Videos tab */
  const [videoSearchMode, setVideoSearchMode] = useState('keyword');
  const [videoSearchInput, setVideoSearchInput] = useState('');
  const [videoFollowerFilter, setVideoFollowerFilter] = useState(FOLLOWER_FILTERS[0]);
  const [videoSortBy, setVideoSortBy] = useState(SORT_OPTIONS[0]);
  const [videoResults, setVideoResults] = useState(MOCK_VIDEOS);

  /* Configure modal */
  const [searchKeyword, setSearchKeyword] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [searchFollowerFilter, setSearchFollowerFilter] = useState(FOLLOWER_FILTERS[0]);
  const [searchResults, setSearchResults] = useState([]);

  const MOCK_SEARCH = [
    { id: 101, name: 'aiadvantage',    handle: '@aiadvantage',    avatar: 'A', followers: 415000 },
    { id: 102, name: 'aicenturyclips', handle: '@aicenturyclips', avatar: 'A', followers: 416000 },
    { id: 103, name: 'airesearches',   handle: '@airesearches',   avatar: 'A', followers: 1100000 },
    { id: 104, name: 'digitaljeff',    handle: '@digitaljeff',    avatar: 'D', followers: 381000 },
    { id: 105, name: 'davidondrej',    handle: '@davidondrej',    avatar: 'D', followers: 349000 },
  ];

  const clearFilters = () => {
    setSelectedChannelId('all');
    setFilterOutlierMin('1'); setFilterOutlierMax('100');
    setFilterViewsMin('0'); setFilterViewsMax('10000000');
    setFilterEngMin('0'); setFilterEngMax('100');
    setFilterDays('0'); setFilterKeyword('');
  };

  const getFilteredVideos = () => {
    let list = selectedChannelId === 'all' ? videos :
      videos.filter(v => {
        const ch = savedChannels.find(c => c.id === selectedChannelId);
        return ch && v.handle === ch.handle;
      });
    if (filterKeyword) list = list.filter(v => v.title.toLowerCase().includes(filterKeyword.toLowerCase()) || v.handle.toLowerCase().includes(filterKeyword.toLowerCase()));
    if (filterOutlierMin) list = list.filter(v => v.outlier >= parseFloat(filterOutlierMin));
    if (filterOutlierMax) list = list.filter(v => v.outlier <= parseFloat(filterOutlierMax));
    if (filterViewsMin && filterViewsMin !== '0') list = list.filter(v => v.views >= parseInt(filterViewsMin));
    if (filterViewsMax && filterViewsMax !== '10000000') list = list.filter(v => v.views <= parseInt(filterViewsMax));
    if (filterEngMin && filterEngMin !== '0') list = list.filter(v => v.engagement >= parseFloat(filterEngMin));
    if (filterEngMax && filterEngMax !== '100') list = list.filter(v => v.engagement <= parseFloat(filterEngMax));
    return [...list].sort((a, b) => {
      if (sortBy.key === 'newest') return a.daysAgo - b.daysAgo;
      if (sortBy.key === 'views') return b.views - a.views;
      if (sortBy.key === 'engagement') return b.engagement - a.engagement;
      if (sortBy.key === 'outlier') return b.outlier - a.outlier;
      return 0;
    });
  };

  const saveToLibrary = (video) => {
    setLibrary(prev => prev.find(v => v.id === video.id) ? prev : [...prev, video]);
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, saved: true } : v));
  };

  const handleVideoSearch = () => {
    let r = [...MOCK_VIDEOS];
    if (videoSearchInput.trim()) {
      const kw = videoSearchInput.toLowerCase();
      r = r.filter(v => v.title.toLowerCase().includes(kw) || v.handle.toLowerCase().includes(kw));
    }
    if (videoFollowerFilter.label !== 'All') {
      r = r.filter(v => videoFollowerFilter.max === Infinity ? v.followers >= videoFollowerFilter.min : v.followers >= videoFollowerFilter.min && v.followers < videoFollowerFilter.max);
    }
    r = r.sort((a, b) => {
      if (videoSortBy.key === 'newest') return a.daysAgo - b.daysAgo;
      if (videoSortBy.key === 'views') return b.views - a.views;
      if (videoSortBy.key === 'engagement') return b.engagement - a.engagement;
      if (videoSortBy.key === 'outlier') return b.outlier - a.outlier;
      return 0;
    });
    setVideoResults(r);
  };

  const handleChannelSearch = () => {
    const kw = searchKeyword.toLowerCase();
    const r = MOCK_SEARCH.filter(c => {
      const matchKw = !kw || c.name.includes(kw) || c.handle.includes(kw);
      const matchF = searchFollowerFilter.max === Infinity ? c.followers >= searchFollowerFilter.min : c.followers >= searchFollowerFilter.min && c.followers < searchFollowerFilter.max;
      return matchKw && matchF;
    });
    setSearchResults(r.length > 0 ? r : MOCK_SEARCH.slice(0, 4));
  };

  const addChannel = (ch) => {
    if (!savedChannels.find(s => s.id === ch.id)) setSavedChannels(p => [...p, ch]);
  };
  const removeChannel = (id) => setSavedChannels(p => p.filter(c => c.id !== id));

  const VideoCard = ({ video }) => (
    <div className="ic-card">
      <div className="ic-thumb-wrap">
        <img src={video.thumbnail} alt={video.title} className="ic-thumb" />
        {/* View count badge top-left */}
        <div className="ic-views-badge">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="#60a5fa"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          {fmtNum(video.views)}
        </div>
        {/* Platform badge top-right */}
        <div className="ic-platform-badge" style={{background: platformBg(video.platform)}}>
          <PlatformIcon type={video.platform} />
        </div>
        {/* Bottom overlay: title + channel + score */}
        <div className="ic-card-overlay">
          <p className="ic-title">{video.title}</p>
          <div className="ic-channel-row">
            <div className="ic-ch-avatar">{video.avatar}</div>
            <div className="ic-ch-info">
              <span className="ic-ch-handle">{video.handle}</span>
              <span className="ic-verified">VERIFIED CREATOR</span>
            </div>
            <div className="ic-outlier-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              {video.outlier}x
            </div>
          </div>
          {/* Hover action */}
          <button className={`ic-save-btn ${video.saved ? 'saved' : ''}`} onClick={() => saveToLibrary(video)}>
            {video.saved ? '✓ Saved' : '⊕ Save to library'}
          </button>
        </div>
      </div>
    </div>
  );

  const filteredVideos = getFilteredVideos();

  return (
    <div className="ic-page">
      {/* Left Filter Panel */}
      <aside className="ic-filter-panel">
        <div className="ic-fp-header">
          <span className="ic-fp-title">FILTERS</span>
          <button className="ic-fp-clear" onClick={clearFilters}>Clear</button>
        </div>

        {/* Channels */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Channels</label>
          <select className="ic-fp-select"
            value={selectedChannelId}
            onChange={e => setSelectedChannelId(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}>
            <option value="all">All channels</option>
            {savedChannels.map(ch => <option key={ch.id} value={ch.id}>{ch.name}</option>)}
          </select>
        </div>

        {/* Outlier score */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Outlier score</label>
          <div className="ic-fp-range-row">
            <input className="ic-fp-input" type="number" value={filterOutlierMin} onChange={e => setFilterOutlierMin(e.target.value)} />
            <input className="ic-fp-input" type="number" placeholder="100x" value={filterOutlierMax} onChange={e => setFilterOutlierMax(e.target.value)} />
          </div>
        </div>

        {/* Views */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Views</label>
          <div className="ic-fp-range-row">
            <input className="ic-fp-input" type="number" value={filterViewsMin} onChange={e => setFilterViewsMin(e.target.value)} />
            <input className="ic-fp-input" type="number" value={filterViewsMax} onChange={e => setFilterViewsMax(e.target.value)} />
          </div>
        </div>

        {/* Engagement */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Engagement</label>
          <div className="ic-fp-range-row">
            <input className="ic-fp-input" type="number" placeholder="0%" value={filterEngMin} onChange={e => setFilterEngMin(e.target.value)} />
            <input className="ic-fp-input" type="number" placeholder="100%" value={filterEngMax} onChange={e => setFilterEngMax(e.target.value)} />
          </div>
        </div>

        {/* Posted in last */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Posted in last</label>
          <div className="ic-fp-range-row">
            <input className="ic-fp-input" type="number" value={filterDays} onChange={e => setFilterDays(e.target.value)} />
            <select className="ic-fp-select-sm" value={filterDaysUnit} onChange={e => setFilterDaysUnit(e.target.value)}>
              <option>Days</option>
              <option>Months</option>
            </select>
          </div>
        </div>

        {/* Platform */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Platform</label>
          <select className="ic-fp-select" value={filterPlatform} onChange={e => setFilterPlatform(e.target.value)}>
            {PLATFORMS.map(p => <option key={p}>{p}</option>)}
          </select>
        </div>

        {/* Keywords */}
        <div className="ic-fp-section">
          <label className="ic-fp-label">Keywords</label>
          <input className="ic-fp-text" placeholder="Search captions and titles" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
        </div>

        <button className="ic-save-filter-btn">Save filter</button>
      </aside>

      {/* Main Content */}
      <div className="ic-main">
        {/* Top Tab Bar */}
        <div className="ic-topbar">
          <div className="ic-tabs">
            <button className={`ic-tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Feed</button>
            <button className={`ic-tab ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>Videos</button>
            <button className={`ic-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
              Library {library.length > 0 && <span className="ic-badge">{library.length}</span>}
            </button>
          </div>
          <div className="ic-topbar-right">
            <button className="ic-topbar-btn" onClick={() => setShowConfigModal(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
              FILTERS: ALL
            </button>
            <div className="ic-topbar-divider"/>
            <button className="ic-topbar-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
              Sort
            </button>
            <div className="ic-topbar-divider"/>
            <button className="ic-topbar-btn">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
              Export
            </button>
          </div>
        </div>

        {/* Feed Tab */}
        {activeTab === 'feed' && (
          <div className="ic-grid-wrap">
            {filteredVideos.length === 0 ? (
              <div className="ic-empty">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                <p>No videos match filters</p>
                <button className="ic-link" onClick={clearFilters}>Clear filters</button>
              </div>
            ) : (
              <div className="ic-grid">
                {filteredVideos.map(v => <VideoCard key={v.id} video={v} />)}
              </div>
            )}
          </div>
        )}

        {/* Videos Tab */}
        {activeTab === 'videos' && (
          <div className="ic-videos-tab">
            <div className="ic-vsb">
              <div className="ic-vsb-toggle">
                <button className={`ic-vsb-btn ${videoSearchMode === 'keyword' ? 'active' : ''}`} onClick={() => setVideoSearchMode('keyword')}>Keyword</button>
                <button className={`ic-vsb-btn ${videoSearchMode === 'url' ? 'active' : ''}`} onClick={() => setVideoSearchMode('url')}>URL</button>
              </div>
              <input className="ic-vsb-input" placeholder={videoSearchMode === 'url' ? 'Paste Instagram video URL...' : 'Search by keyword...'} value={videoSearchInput} onChange={e => setVideoSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVideoSearch()} />
              <button className="ic-vsb-search" onClick={handleVideoSearch}>Search</button>
            </div>
            <div className="ic-vt-filters">
              <span className="ic-vt-label">Channel size:</span>
              {FOLLOWER_FILTERS.map(f => (
                <button key={f.label} className={`ic-vt-pill ${videoFollowerFilter.label === f.label ? 'active' : ''}`}
                  onClick={() => { setVideoFollowerFilter(f); setTimeout(handleVideoSearch, 0); }}>{f.label}</button>
              ))}
              <span className="ic-vt-label" style={{marginLeft: 12}}>Sort:</span>
              {SORT_OPTIONS.map(o => (
                <button key={o.key} className={`ic-vt-pill ${videoSortBy.key === o.key ? 'active' : ''}`}
                  onClick={() => { setVideoSortBy(o); setTimeout(handleVideoSearch, 0); }}>{o.label}</button>
              ))}
            </div>
            <div className="ic-grid" style={{padding: '16px 20px'}}>
              {videoResults.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          </div>
        )}

        {/* Library Tab */}
        {activeTab === 'library' && (
          library.length === 0 ? (
            <div className="ic-empty">
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l7 7v9a2 2 0 01-2 2z"/></svg>
              <p>Library is empty</p>
              <span style={{color:'#4b5563', fontSize:'0.85rem'}}>Save videos from Feed to access them here</span>
            </div>
          ) : (
            <div className="ic-grid" style={{padding: '20px'}}>
              {library.map(v => <VideoCard key={v.id} video={v} />)}
            </div>
          )
        )}
      </div>

      {/* Configure Channels Modal */}
      {showConfigModal && (
        <div className="ic-modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="ic-modal" onClick={e => e.stopPropagation()}>
            <div className="ic-modal-hdr">
              <h3>Configure Channels</h3>
              <button className="ic-modal-close" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="ic-modal-tabs">
              {['keyword', 'url', 'saved'].map(t => (
                <button key={t} className={`ic-modal-tab ${configTab === t ? 'active' : ''}`} onClick={() => setConfigTab(t)}>
                  {t === 'saved' ? `Saved (${savedChannels.length})` : t === 'url' ? 'By URL' : 'Keyword'}
                </button>
              ))}
            </div>
            <div className="ic-modal-body">
              {configTab === 'keyword' && <>
                <div className="ic-modal-srow">
                  <input className="ic-modal-inp" placeholder="e.g. AI, fitness, travel..." value={searchKeyword} onChange={e => setSearchKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChannelSearch()} />
                  <button className="ic-modal-sbtn" onClick={handleChannelSearch}>Search</button>
                </div>
                <div className="ic-modal-fl">
                  <span className="ic-modal-fl-label">Follower size:</span>
                  {FOLLOWER_FILTERS.map(f => (
                    <button key={f.label} className={`ic-modal-fpill ${searchFollowerFilter.label === f.label ? 'active' : ''}`} onClick={() => setSearchFollowerFilter(f)}>{f.label}</button>
                  ))}
                </div>
                {searchResults.length === 0 && <p className="ic-no-res">Search to find channels</p>}
                {searchResults.map(ch => (
                  <div key={ch.id} className="ic-result">
                    <div className="ic-result-av">{ch.avatar}</div>
                    <div className="ic-result-info">
                      <span className="ic-rname">{ch.name}</span>
                      <span className="ic-rhandle">{ch.handle} · {fmtNum(ch.followers)}</span>
                    </div>
                    <button className={`ic-add-btn ${savedChannels.find(s => s.id === ch.id) ? 'added' : ''}`} onClick={() => addChannel(ch)}>
                      {savedChannels.find(s => s.id === ch.id) ? '✓' : '+'}
                    </button>
                  </div>
                ))}
              </>}
              {configTab === 'url' && <>
                <input className="ic-modal-inp" style={{width:'100%',boxSizing:'border-box'}} placeholder="https://www.instagram.com/channel/" value={urlInput} onChange={e => setUrlInput(e.target.value)} />
                <button className="ic-modal-sbtn" style={{width:'100%',marginTop:10}} onClick={() => {
                  if (!urlInput.trim()) return;
                  const h = urlInput.replace(/\/$/, '').split('/').pop();
                  addChannel({ id: Date.now(), name: h, handle: `@${h}`, avatar: h[0]?.toUpperCase() || 'C', followers: 0 });
                  setUrlInput(''); setConfigTab('saved');
                }}>Add Channel</button>
              </>}
              {configTab === 'saved' && (
                savedChannels.length === 0 ? <p className="ic-no-res">No channels added yet</p> :
                savedChannels.map(ch => (
                  <div key={ch.id} className="ic-result">
                    <div className="ic-result-av">{ch.avatar}</div>
                    <div className="ic-result-info">
                      <span className="ic-rname">{ch.name}</span>
                      <span className="ic-rhandle">{ch.handle} {ch.followers > 0 ? `· ${fmtNum(ch.followers)}` : ''}</span>
                    </div>
                    <button className="ic-rm-btn" onClick={() => removeChannel(ch.id)}>Remove</button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
