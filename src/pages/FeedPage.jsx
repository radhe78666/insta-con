import { useState } from 'react';
import { supabase } from '../supabaseClient';
import './FeedPage.css';

// --- Mock Data ---
const MOCK_VIDEOS = [
  { id: 1, channel: 'higgsfield.ai', channelHandle: '@higgsfield.ai', avatar: 'H', followers: 78000, thumbnail: 'https://picsum.photos/seed/v1/300/400', title: '$500,000 Higgsfield Action Contest', views: 36000, engagement: 3, outlier: 0.2, daysAgo: 4, saved: false },
  { id: 2, channel: 'cour.cinema', channelHandle: '@cour.cinema', avatar: 'C', followers: 64000, thumbnail: 'https://picsum.photos/seed/v2/300/400', title: 'Le Amir (2018) - Story behind the film', views: 64000, engagement: 5, outlier: 0.4, daysAgo: 5, saved: false },
  { id: 3, channel: 'pjace.official', channelHandle: '@pjace.official', avatar: 'P', followers: 33000, thumbnail: 'https://picsum.photos/seed/v3/300/400', title: '$500,000 Action Contest - PJ Ace', views: 33000, engagement: 1, outlier: 0.2, daysAgo: 5, saved: false },
  { id: 4, channel: 'rourke.films', channelHandle: '@rourke.films', avatar: 'R', followers: 54000, thumbnail: 'https://picsum.photos/seed/v4/300/400', title: '$500,000 Higgsfield Contest Entry', views: 54000, engagement: 1, outlier: 0.3, daysAgo: 5, saved: false },
  { id: 5, channel: 'higgsfield.ai', channelHandle: '@higgsfield.ai', avatar: 'H', followers: 78000, thumbnail: 'https://picsum.photos/seed/v5/300/400', title: 'Action Contest - Behind the Scenes', views: 22000, engagement: 4, outlier: 0.5, daysAgo: 6, saved: false },
  { id: 6, channel: 'cour.cinema', channelHandle: '@cour.cinema', avatar: 'C', followers: 64000, thumbnail: 'https://picsum.photos/seed/v6/300/400', title: 'SOUR CINEMA - Preview Exclusive', views: 41000, engagement: 2, outlier: 0.3, daysAgo: 7, saved: false },
  { id: 7, channel: 'studio.reels', channelHandle: '@studio.reels', avatar: 'S', followers: 12000, thumbnail: 'https://picsum.photos/seed/v7/300/400', title: 'Secret Project Teaser 2026', views: 18000, engagement: 6, outlier: 0.7, daysAgo: 3, saved: false },
  { id: 8, channel: 'meghan.visuals', channelHandle: '@meghan.visuals', avatar: 'M', followers: 29000, thumbnail: 'https://picsum.photos/seed/v8/300/400', title: 'Visual Art Series - Episode 3', views: 9000, engagement: 8, outlier: 1.1, daysAgo: 2, saved: false },
];

const MOCK_CHANNEL_RESULTS = [
  { id: 201, name: 'aiadvantage', handle: '@aiadvantage', avatar: 'A', followers: 415000, totalViews: '5.2M', platform: 'youtube', desc: 'AI tutorials and reviews for young professionals seeking cutting-edge tools.' },
  { id: 202, name: 'aicenturyclips', handle: '@aicenturyclips', avatar: 'A', followers: 416000, totalViews: '82M', platform: 'tiktok', desc: 'AI video creation tutorials for creators and entrepreneurs.' },
  { id: 203, name: 'airesearches', handle: '@airesearches', avatar: 'A', followers: 1100000, totalViews: '504M', platform: 'instagram', desc: 'AI news and insights for young professionals and tech enthusiasts.' },
  { id: 204, name: 'artificialintelligence.co', handle: '@artificialintelligence.co', avatar: 'A', followers: 293000, totalViews: '91M', platform: 'instagram', desc: 'Tech news and AI insights for millennials.' },
  { id: 205, name: 'davidondrej', handle: '@davidondrej', avatar: 'D', followers: 349000, totalViews: '1.3M', platform: 'youtube', desc: 'AI tutorials and analysis for entrepreneurs.' },
  { id: 206, name: 'digitaljeff', handle: '@digitaljeff', avatar: 'D', followers: 381000, totalViews: '79M', platform: 'instagram', desc: 'AI and tech tutorials for entrepreneurs.' },
  { id: 207, name: 'higgsfield.ai', handle: '@higgsfield.ai', avatar: 'H', followers: 614000, totalViews: '39M', platform: 'instagram', desc: 'AI-powered content creation tutorials.' },
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
  { label: 'Oldest', key: 'oldest' },
  { label: 'Most Views', key: 'views' },
  { label: 'Engagement Rate', key: 'engagement' },
  { label: 'Outlier Score', key: 'outlier' },
];

const fmtNum = (n) => {
  if (typeof n === 'string') return n;
  if (n >= 1000000) return `${(n/1000000).toFixed(1)}M`;
  if (n >= 1000) return `${(n/1000).toFixed(0)}K`;
  return n;
};

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [configTab, setConfigTab] = useState('keyword');

  // Saved channels
  const [savedChannels, setSavedChannels] = useState([
    { id: 1, name: 'higgsfield.ai', handle: '@higgsfield.ai', avatar: 'H', followers: 78000 },
    { id: 2, name: 'cour.cinema', handle: '@cour.cinema', avatar: 'C', followers: 64000 },
  ]);
  const [selectedChannels, setSelectedChannels] = useState([]); // empty = All

  // Feed state
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [library, setLibrary] = useState([]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);

  // Filter panel state
  const [filterOutlierMin, setFilterOutlierMin] = useState('');
  const [filterOutlierMax, setFilterOutlierMax] = useState('');
  const [filterViewsMin, setFilterViewsMin] = useState('');
  const [filterViewsMax, setFilterViewsMax] = useState('');
  const [filterEngMin, setFilterEngMin] = useState('');
  const [filterEngMax, setFilterEngMax] = useState('');
  const [filterDays, setFilterDays] = useState('');
  const [filterDaysUnit, setFilterDaysUnit] = useState('Days');
  const [filterKeyword, setFilterKeyword] = useState('');

  // Configure modal state
  const [searchKeyword, setSearchKeyword] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchFollowerFilter, setSearchFollowerFilter] = useState(FOLLOWER_FILTERS[0]);

  // Videos tab state
  const [videoSearchMode, setVideoSearchMode] = useState('keyword'); // 'keyword' | 'url'
  const [videoSearchInput, setVideoSearchInput] = useState('');
  const [videoChannelFollowerFilter, setVideoChannelFollowerFilter] = useState(FOLLOWER_FILTERS[0]);
  const [videoSortBy, setVideoSortBy] = useState(SORT_OPTIONS[0]);
  const [videoResults, setVideoResults] = useState(MOCK_VIDEOS);

  const handleChannelSearch = () => {
    if (!searchKeyword.trim()) return;
    const kw = searchKeyword.toLowerCase();
    const results = MOCK_CHANNEL_RESULTS.filter(c =>
      (c.name.toLowerCase().includes(kw) || c.desc.toLowerCase().includes(kw)) &&
      (searchFollowerFilter.max === Infinity
        ? c.followers >= searchFollowerFilter.min
        : c.followers >= searchFollowerFilter.min && c.followers < searchFollowerFilter.max)
    );
    setSearchResults(results.length > 0 ? results : MOCK_CHANNEL_RESULTS.slice(0, 4));
  };

  const addChannel = (ch) => {
    const simple = { id: ch.id, name: ch.name, handle: ch.handle, avatar: ch.avatar, followers: ch.followers };
    if (!savedChannels.find(s => s.id === ch.id)) setSavedChannels(prev => [...prev, simple]);
  };

  const removeChannel = (id) => setSavedChannels(prev => prev.filter(c => c.id !== id));

  const toggleSelectChannel = (ch) => {
    setSelectedChannels(prev =>
      prev.find(c => c.id === ch.id) ? prev.filter(c => c.id !== ch.id) : [...prev, ch]
    );
  };

  const saveToLibrary = (video) => {
    setLibrary(prev => prev.find(v => v.id === video.id) ? prev : [...prev, { ...video, savedAt: new Date() }]);
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, saved: true } : v));
  };

  const clearFilters = () => {
    setFilterOutlierMin(''); setFilterOutlierMax('');
    setFilterViewsMin(''); setFilterViewsMax('');
    setFilterEngMin(''); setFilterEngMax('');
    setFilterDays(''); setFilterKeyword('');
    setSelectedChannels([]);
  };

  const getFilteredVideos = () => {
    let list = selectedChannels.length > 0
      ? videos.filter(v => selectedChannels.some(c => c.handle === v.channelHandle))
      : videos;

    if (filterOutlierMin) list = list.filter(v => v.outlier >= parseFloat(filterOutlierMin));
    if (filterOutlierMax) list = list.filter(v => v.outlier <= parseFloat(filterOutlierMax));
    if (filterViewsMin) list = list.filter(v => v.views >= parseInt(filterViewsMin));
    if (filterViewsMax) list = list.filter(v => v.views <= parseInt(filterViewsMax));
    if (filterEngMin) list = list.filter(v => v.engagement >= parseFloat(filterEngMin));
    if (filterEngMax) list = list.filter(v => v.engagement <= parseFloat(filterEngMax));
    if (filterDays) {
      const mult = filterDaysUnit === 'Months' ? 30 : 1;
      list = list.filter(v => v.daysAgo <= parseInt(filterDays) * mult);
    }
    if (filterKeyword) {
      const kw = filterKeyword.toLowerCase();
      list = list.filter(v => v.title.toLowerCase().includes(kw) || v.channelHandle.toLowerCase().includes(kw));
    }

    return [...list].sort((a, b) => {
      if (sortBy.key === 'newest') return a.daysAgo - b.daysAgo;
      if (sortBy.key === 'oldest') return b.daysAgo - a.daysAgo;
      if (sortBy.key === 'views') return b.views - a.views;
      if (sortBy.key === 'engagement') return b.engagement - a.engagement;
      if (sortBy.key === 'outlier') return b.outlier - a.outlier;
      return 0;
    });
  };

  const handleVideoSearch = () => {
    let results = [...MOCK_VIDEOS];
    // Filter by keyword in title or channel
    if (videoSearchInput.trim()) {
      const kw = videoSearchInput.toLowerCase();
      results = results.filter(v =>
        v.title.toLowerCase().includes(kw) ||
        v.channelHandle.toLowerCase().includes(kw) ||
        v.channel.toLowerCase().includes(kw)
      );
    }
    // Filter by follower size of the channel
    if (videoChannelFollowerFilter.label !== 'All') {
      results = results.filter(v => {
        const f = v.followers;
        return videoChannelFollowerFilter.max === Infinity
          ? f >= videoChannelFollowerFilter.min
          : f >= videoChannelFollowerFilter.min && f < videoChannelFollowerFilter.max;
      });
    }
    // Sort results
    results = results.sort((a, b) => {
      if (videoSortBy.key === 'newest') return a.daysAgo - b.daysAgo;
      if (videoSortBy.key === 'oldest') return b.daysAgo - a.daysAgo;
      if (videoSortBy.key === 'views') return b.views - a.views;
      if (videoSortBy.key === 'engagement') return b.engagement - a.engagement;
      if (videoSortBy.key === 'outlier') return b.outlier - a.outlier;
      return 0;
    });
    setVideoResults(results);
  };

  const hasActiveFilters = filterOutlierMin || filterOutlierMax || filterViewsMin || filterViewsMax ||
    filterEngMin || filterEngMax || filterDays || filterKeyword || selectedChannels.length > 0;

  return (
    <div className="feed-page">
      {/* Top Bar */}
      <div className="feed-topbar">
        <div className="feed-tabs">
          <button className={`feed-tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Feed</button>
          <button className={`feed-tab ${activeTab === 'videos' ? 'active' : ''}`} onClick={() => setActiveTab('videos')}>Videos</button>
          <button className={`feed-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
            Library {library.length > 0 && <span className="badge">{library.length}</span>}
          </button>
        </div>
        <div className="feed-actions">
          {activeTab === 'feed' && (
            <>
              <div className="sort-wrapper">
                <button className="action-btn" onClick={() => { setShowSortMenu(p => !p); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                  {sortBy.label}
                </button>
                {showSortMenu && (
                  <div className="dropdown-menu">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.key} className={`dropdown-item ${sortBy.key === opt.key ? 'active' : ''}`}
                        onClick={() => { setSortBy(opt); setShowSortMenu(false); }}>{opt.label}</button>
                    ))}
                  </div>
                )}
              </div>
              <button className={`action-btn ${showFilterPanel ? 'btn-active' : ''}`} onClick={() => setShowFilterPanel(p => !p)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Filters {hasActiveFilters && <span className="filter-dot"/>}
              </button>
              <button className="action-btn primary" onClick={() => setShowConfigModal(true)}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-1a6 6 0 0112 0v1"/><path d="M19 8v6M22 11h-6"/></svg>
                Configure Channels
              </button>
            </>
          )}
        </div>
      </div>

      {/* Content Area */}
      <div className="feed-body">
        {/* === FEED TAB === */}
        {activeTab === 'feed' && (
          <div className="feed-content-row">
            <div className="feed-main">
              <div className="video-grid">
                {getFilteredVideos().map(video => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumb-wrap">
                      <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                      <div className="video-overlay">
                        <button className={`save-btn ${video.saved ? 'saved' : ''}`} onClick={() => saveToLibrary(video)}>
                          {video.saved ? '✓ Saved' : '+ Library'}
                        </button>
                      </div>
                      <div className="platform-badge">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/></svg>
                      </div>
                    </div>
                    <div className="video-info">
                      <p className="video-title">{video.title}</p>
                      <div className="video-channel">
                        <div className="ch-avatar">{video.avatar}</div>
                        <span>{video.channelHandle}</span>
                        <span className="dot">·</span>
                        <span className="time">{video.daysAgo}d ago</span>
                      </div>
                      <div className="video-stats">
                        <span className="stat outlier">⚡ {video.outlier}x</span>
                        <span className="stat views">👁 {fmtNum(video.views)}</span>
                        <span className="stat eng">🔥 {video.engagement}%</span>
                      </div>
                    </div>
                  </div>
                ))}
                {getFilteredVideos().length === 0 && (
                  <div className="empty-state" style={{gridColumn: '1/-1'}}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                    <h3>No videos match filters</h3>
                    <p><button className="link-btn" onClick={clearFilters}>Clear filters</button> to see all videos</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Filter Panel */}
            {showFilterPanel && (
              <div className="filter-panel">
                <div className="filter-panel-header">
                  <span className="filter-panel-title">FILTERS</span>
                  <button className="filter-clear-btn" onClick={clearFilters}>Clear</button>
                </div>

                {/* Channels */}
                <div className="filter-section">
                  <div className="filter-section-label">Channels</div>
                  <div className="filter-channel-list">
                    <button className={`filter-channel-item ${selectedChannels.length === 0 ? 'active' : ''}`}
                      onClick={() => setSelectedChannels([])}>
                      <span className="fch-avatar all">A</span>
                      All channels
                    </button>
                    {savedChannels.map(ch => (
                      <button key={ch.id}
                        className={`filter-channel-item ${selectedChannels.find(c => c.id === ch.id) ? 'active' : ''}`}
                        onClick={() => toggleSelectChannel(ch)}>
                        <span className="fch-avatar">{ch.avatar}</span>
                        <span className="fch-name">{ch.name}</span>
                        <span className="fch-count">{fmtNum(ch.followers)}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Outlier Score */}
                <div className="filter-section">
                  <div className="filter-section-label">Outlier Score</div>
                  <div className="filter-range-row">
                    <input className="filter-range-input" type="number" placeholder="0x" value={filterOutlierMin} onChange={e => setFilterOutlierMin(e.target.value)} />
                    <input className="filter-range-input" type="number" placeholder="100x" value={filterOutlierMax} onChange={e => setFilterOutlierMax(e.target.value)} />
                  </div>
                </div>

                {/* Views */}
                <div className="filter-section">
                  <div className="filter-section-label">Views</div>
                  <div className="filter-range-row">
                    <input className="filter-range-input" type="number" placeholder="0" value={filterViewsMin} onChange={e => setFilterViewsMin(e.target.value)} />
                    <input className="filter-range-input" type="number" placeholder="10M" value={filterViewsMax} onChange={e => setFilterViewsMax(e.target.value)} />
                  </div>
                </div>

                {/* Engagement */}
                <div className="filter-section">
                  <div className="filter-section-label">Engagement</div>
                  <div className="filter-range-row">
                    <input className="filter-range-input" type="number" placeholder="0%" value={filterEngMin} onChange={e => setFilterEngMin(e.target.value)} />
                    <input className="filter-range-input" type="number" placeholder="100%" value={filterEngMax} onChange={e => setFilterEngMax(e.target.value)} />
                  </div>
                </div>

                {/* Posted In Last */}
                <div className="filter-section">
                  <div className="filter-section-label">Posted in last</div>
                  <div className="filter-range-row">
                    <input className="filter-range-input" type="number" placeholder="0" value={filterDays} onChange={e => setFilterDays(e.target.value)} style={{flex: 1}} />
                    <select className="filter-select" value={filterDaysUnit} onChange={e => setFilterDaysUnit(e.target.value)}>
                      <option>Days</option>
                      <option>Months</option>
                    </select>
                  </div>
                </div>

                {/* Keywords */}
                <div className="filter-section">
                  <div className="filter-section-label">Keywords</div>
                  <input className="filter-keyword-input" type="text" placeholder="Search captions and titles" value={filterKeyword} onChange={e => setFilterKeyword(e.target.value)} />
                </div>

                <button className="save-filter-btn">Save Filter</button>
              </div>
            )}
          </div>
        )}

        {/* === VIDEOS TAB === */}
        {activeTab === 'videos' && (
          <div className="videos-tab">
            <div className="videos-search-bar">
              <div className="vsb-mode-toggle">
                <button className={`vsb-mode-btn ${videoSearchMode === 'keyword' ? 'active' : ''}`} onClick={() => setVideoSearchMode('keyword')}>Keyword</button>
                <button className={`vsb-mode-btn ${videoSearchMode === 'url' ? 'active' : ''}`} onClick={() => setVideoSearchMode('url')}>URL</button>
              </div>
              <input className="vsb-input" type="text"
                placeholder={videoSearchMode === 'url' ? 'Paste Instagram video URL...' : 'Search by keyword...'}
                value={videoSearchInput} onChange={e => setVideoSearchInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleVideoSearch()} />
              <button className="vsb-search-btn" onClick={handleVideoSearch}>Search</button>
            </div>

            {/* Channel Filters for Videos tab */}
            <div className="video-tab-filters">
              <div className="vtf-label">Filter by Channel Size:</div>
              <div className="vtf-pills">
                {FOLLOWER_FILTERS.map(f => (
                  <button key={f.label} className={`vtf-pill ${videoChannelFollowerFilter.label === f.label ? 'active' : ''}`}
                    onClick={() => {
                      setVideoChannelFollowerFilter(f);
                      setTimeout(handleVideoSearch, 0);
                    }}>{f.label}</button>
                ))}
              </div>
              <div className="vtf-label" style={{marginTop: '14px'}}>Sort by:</div>
              <div className="vtf-pills">
                {SORT_OPTIONS.map(opt => (
                  <button key={opt.key} className={`vtf-pill ${videoSortBy.key === opt.key ? 'active' : ''}`}
                    onClick={() => {
                      setVideoSortBy(opt);
                      setTimeout(handleVideoSearch, 0);
                    }}>{opt.label}</button>
                ))}
              </div>
            </div>

            {videoResults.length > 0 ? (
              <div className="video-grid" style={{padding: '0 28px 28px'}}>
                {videoResults.map(video => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumb-wrap">
                      <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                      <div className="video-overlay">
                        <button className={`save-btn ${video.saved ? 'saved' : ''}`} onClick={() => saveToLibrary(video)}>
                          {video.saved ? '✓ Saved' : '+ Library'}
                        </button>
                      </div>
                    </div>
                    <div className="video-info">
                      <p className="video-title">{video.title}</p>
                      <div className="video-channel">
                        <div className="ch-avatar">{video.avatar}</div>
                        <span>{video.channelHandle}</span>
                      </div>
                      <div className="video-stats">
                        <span className="stat views">👁 {fmtNum(video.views)}</span>
                        <span className="stat eng">🔥 {video.engagement}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>
                <h3>No videos found</h3>
                <p>Try a different keyword or change the follower filter</p>
              </div>
            )}
          </div>
        )}

        {/* === LIBRARY TAB === */}
        {activeTab === 'library' && (
          <div className="library-section">
            {library.length === 0 ? (
              <div className="empty-state">
                <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l7 7v9a2 2 0 01-2 2z"/></svg>
                <h3>Library is empty</h3>
                <p>Save videos from Feed to access them here anytime</p>
              </div>
            ) : (
              <div className="video-grid">
                {library.map(video => (
                  <div key={video.id} className="video-card">
                    <div className="video-thumb-wrap">
                      <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                    </div>
                    <div className="video-info">
                      <p className="video-title">{video.title}</p>
                      <div className="video-channel">
                        <div className="ch-avatar">{video.avatar}</div>
                        <span>{video.channelHandle}</span>
                      </div>
                      <div className="video-stats">
                        <span className="stat views">👁 {fmtNum(video.views)}</span>
                        <span className="stat eng">🔥 {video.engagement}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Configure Channels Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configure Channels</h3>
              <button className="modal-close" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>
            <div className="modal-tabs">
              <button className={`modal-tab ${configTab === 'keyword' ? 'active' : ''}`} onClick={() => setConfigTab('keyword')}>Keyword</button>
              <button className={`modal-tab ${configTab === 'url' ? 'active' : ''}`} onClick={() => setConfigTab('url')}>By URL</button>
              <button className={`modal-tab ${configTab === 'saved' ? 'active' : ''}`} onClick={() => setConfigTab('saved')}>Saved ({savedChannels.length})</button>
            </div>

            {configTab === 'keyword' && (
              <div className="modal-body">
                <div className="search-row">
                  <input className="modal-input" placeholder="Search channels e.g. AI, fitness..." value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChannelSearch()} />
                  <button className="search-btn" onClick={handleChannelSearch}>Search</button>
                </div>
                <div className="filter-label">Follower Size:</div>
                <div className="filter-pills">
                  {FOLLOWER_FILTERS.map(f => (
                    <button key={f.label} className={`filter-pill ${searchFollowerFilter.label === f.label ? 'active' : ''}`}
                      onClick={() => setSearchFollowerFilter(f)}>{f.label}</button>
                  ))}
                </div>
                <div className="search-results">
                  {searchResults.length === 0 && <p className="no-results">Search to find channels</p>}
                  {searchResults.map(ch => (
                    <div key={ch.id} className="result-item">
                      <div className="result-avatar">{ch.avatar}</div>
                      <div className="result-info">
                        <span className="result-name">{ch.name}</span>
                        <span className="result-handle">{ch.handle} · {fmtNum(ch.followers)} followers · {ch.totalViews} views</span>
                        <span className="result-desc">{ch.desc}</span>
                      </div>
                      <button className={`add-btn ${savedChannels.find(s => s.id === ch.id) ? 'added' : ''}`}
                        onClick={() => addChannel(ch)}>
                        {savedChannels.find(s => s.id === ch.id) ? '✓' : '+'}
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {configTab === 'url' && (
              <div className="modal-body">
                <input className="modal-input" placeholder="https://www.instagram.com/channelname/" value={urlInput}
                  onChange={e => setUrlInput(e.target.value)} />
                <button className="search-btn" style={{marginTop: '12px', width: '100%'}} onClick={() => {
                  if (!urlInput.trim()) return;
                  const handle = urlInput.replace(/\/$/, '').split('/').pop();
                  addChannel({ id: Date.now(), name: handle, handle: `@${handle}`, avatar: handle[0]?.toUpperCase() || 'C', followers: 0, totalViews: '—', desc: '' });
                  setUrlInput(''); setConfigTab('saved');
                }}>Add Channel from URL</button>
              </div>
            )}

            {configTab === 'saved' && (
              <div className="modal-body">
                {savedChannels.length === 0 ? <p className="no-results">No channels added yet</p> :
                  savedChannels.map(ch => (
                    <div key={ch.id} className="result-item">
                      <div className="result-avatar">{ch.avatar}</div>
                      <div className="result-info">
                        <span className="result-name">{ch.name}</span>
                        <span className="result-handle">{ch.handle} {ch.followers > 0 ? `· ${fmtNum(ch.followers)}` : ''}</span>
                      </div>
                      <button className="remove-btn" onClick={() => removeChannel(ch.id)}>Remove</button>
                    </div>
                  ))
                }
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
