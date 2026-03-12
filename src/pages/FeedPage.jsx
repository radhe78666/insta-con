import { useState, useEffect } from 'react';
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

const FOLLOWER_FILTERS = [
  { label: 'All', min: 0, max: Infinity },
  { label: 'Nano (<10K)', min: 0, max: 10000 },
  { label: 'Micro (10K–50K)', min: 10000, max: 50000 },
  { label: 'Mid (50K–200K)', min: 50000, max: 200000 },
  { label: 'Macro (200K–500K)', min: 200000, max: 500000 },
  { label: 'Mega (500K–1M)', min: 500000, max: 1000000 },
  { label: 'Celebrity (1M+)', min: 1000000, max: Infinity },
];

const SORT_OPTIONS = [
  { label: 'Newest', key: 'newest' },
  { label: 'Oldest', key: 'oldest' },
  { label: 'Most Views', key: 'views' },
  { label: 'Engagement Rate', key: 'engagement' },
  { label: 'Outlier Score', key: 'outlier' },
];

const FeedPage = () => {
  const [activeTab, setActiveTab] = useState('feed');
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [urlInput, setUrlInput] = useState('');
  const [followerFilter, setFollowerFilter] = useState(FOLLOWER_FILTERS[0]);
  const [savedChannels, setSavedChannels] = useState([
    { id: 1, name: 'higgsfield.ai', handle: '@higgsfield.ai', avatar: 'H', followers: 78000 },
    { id: 2, name: 'cour.cinema', handle: '@cour.cinema', avatar: 'C', followers: 64000 },
  ]);
  const [selectedChannels, setSelectedChannels] = useState([]);
  const [sortBy, setSortBy] = useState(SORT_OPTIONS[0]);
  const [videos, setVideos] = useState(MOCK_VIDEOS);
  const [library, setLibrary] = useState([]);
  const [configTab, setConfigTab] = useState('keyword');

  // Mock search results
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    if (!searchKeyword.trim()) return;
    const results = [
      { id: 101, name: `${searchKeyword} Official`, handle: `@${searchKeyword.toLowerCase().replace(/\s+/g,'.')}`, avatar: searchKeyword[0].toUpperCase(), followers: 45000 },
      { id: 102, name: `${searchKeyword} Clips`, handle: `@${searchKeyword.toLowerCase().replace(/\s+/g,'_')}clips`, avatar: 'C', followers: 8200 },
      { id: 103, name: `Best of ${searchKeyword}`, handle: `@best.${searchKeyword.toLowerCase().replace(/\s+/g,'.')}`, avatar: 'B', followers: 320000 },
      { id: 104, name: `${searchKeyword} Daily`, handle: `@${searchKeyword.toLowerCase().replace(/\s+/g,'')}daily`, avatar: 'D', followers: 5100 },
    ].filter(r => followerFilter.max === Infinity
        ? r.followers >= followerFilter.min
        : r.followers >= followerFilter.min && r.followers < followerFilter.max
    );
    setSearchResults(results);
  };

  const addChannel = (ch) => {
    if (!savedChannels.find(s => s.id === ch.id)) {
      setSavedChannels(prev => [...prev, ch]);
    }
  };

  const removeChannel = (id) => {
    setSavedChannels(prev => prev.filter(c => c.id !== id));
  };

  const toggleSelectChannel = (ch) => {
    setSelectedChannels(prev =>
      prev.find(c => c.id === ch.id)
        ? prev.filter(c => c.id !== ch.id)
        : [...prev, ch]
    );
  };

  const saveToLibrary = (video) => {
    setLibrary(prev => prev.find(v => v.id === video.id) ? prev : [...prev, { ...video, savedAt: new Date() }]);
    setVideos(prev => prev.map(v => v.id === video.id ? { ...v, saved: true } : v));
  };

  const getSortedVideos = () => {
    const filtered = selectedChannels.length > 0
      ? videos.filter(v => selectedChannels.some(c => c.handle === v.channelHandle))
      : videos;

    return [...filtered].sort((a, b) => {
      if (sortBy.key === 'newest') return a.daysAgo - b.daysAgo;
      if (sortBy.key === 'oldest') return b.daysAgo - a.daysAgo;
      if (sortBy.key === 'views') return b.views - a.views;
      if (sortBy.key === 'engagement') return b.engagement - a.engagement;
      if (sortBy.key === 'outlier') return b.outlier - a.outlier;
      return 0;
    });
  };

  const fmtNum = (n) => n >= 1000 ? `${(n / 1000).toFixed(0)}K` : n;

  return (
    <div className="feed-page">
      {/* Top Bar */}
      <div className="feed-topbar">
        <div className="feed-tabs">
          <button className={`feed-tab ${activeTab === 'feed' ? 'active' : ''}`} onClick={() => setActiveTab('feed')}>Feed</button>
          <button className={`feed-tab ${activeTab === 'library' ? 'active' : ''}`} onClick={() => setActiveTab('library')}>
            Library {library.length > 0 && <span className="badge">{library.length}</span>}
          </button>
        </div>
        <div className="feed-actions">
          {activeTab === 'feed' && (
            <>
              <div className="sort-wrapper">
                <button className="action-btn" onClick={() => { setShowSortMenu(p => !p); setShowConfigModal(false); }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M7 12h10M11 18h2"/></svg>
                  Sort: {sortBy.label}
                </button>
                {showSortMenu && (
                  <div className="dropdown-menu">
                    {SORT_OPTIONS.map(opt => (
                      <button key={opt.key} className={`dropdown-item ${sortBy.key === opt.key ? 'active' : ''}`}
                        onClick={() => { setSortBy(opt); setShowSortMenu(false); }}>
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button className="action-btn primary" onClick={() => { setShowConfigModal(true); setShowSortMenu(false); }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="7" r="4"/><path d="M3 21v-1a6 6 0 0112 0v1"/><path d="M19 8v6M22 11h-6"/></svg>
                Configure Channels
              </button>
            </>
          )}
        </div>
      </div>

      {/* Active Channel Pills */}
      {activeTab === 'feed' && savedChannels.length > 0 && (
        <div className="channel-pills">
          <span className="pills-label">Channels:</span>
          <button className={`pill ${selectedChannels.length === 0 ? 'active' : ''}`} onClick={() => setSelectedChannels([])}>All</button>
          {savedChannels.map(ch => (
            <button key={ch.id} className={`pill ${selectedChannels.find(c => c.id === ch.id) ? 'active' : ''}`}
              onClick={() => toggleSelectChannel(ch)}>
              <span className="pill-avatar">{ch.avatar}</span>
              {ch.name}
            </button>
          ))}
        </div>
      )}

      {/* Feed Tab */}
      {activeTab === 'feed' && (
        <div className="video-grid">
          {getSortedVideos().map(video => (
            <div key={video.id} className="video-card">
              <div className="video-thumb-wrap">
                <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                <div className="video-overlay">
                  <button className={`save-btn ${video.saved ? 'saved' : ''}`} onClick={() => saveToLibrary(video)}>
                    {video.saved ? '✓ Saved' : '+ Library'}
                  </button>
                </div>
                <div className="platform-badge">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/></svg>
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
        </div>
      )}

      {/* Library Tab */}
      {activeTab === 'library' && (
        <div className="library-section">
          {library.length === 0 ? (
            <div className="empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="1.5"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l7 7v9a2 2 0 01-2 2z"/><path d="M17 14H7M17 10H7M12 6H7"/></svg>
              <h3>Library is empty</h3>
              <p>Save videos from Feed to access them here anytime</p>
            </div>
          ) : (
            <div className="video-grid">
              {library.map(video => (
                <div key={video.id} className="video-card">
                  <div className="video-thumb-wrap">
                    <img src={video.thumbnail} alt={video.title} className="video-thumb" />
                    <div className="platform-badge">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="#fff"><rect x="2" y="2" width="20" height="20" rx="5" fill="none" stroke="#fff" strokeWidth="2"/><circle cx="12" cy="12" r="5" stroke="#fff" strokeWidth="2" fill="none"/><circle cx="17.5" cy="6.5" r="1.5" fill="#fff"/></svg>
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
          )}
        </div>
      )}

      {/* Configure Channels Modal */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Configure Channels</h3>
              <button className="modal-close" onClick={() => setShowConfigModal(false)}>✕</button>
            </div>

            <div className="modal-tabs">
              <button className={`modal-tab ${configTab === 'keyword' ? 'active' : ''}`} onClick={() => setConfigTab('keyword')}>Keyword Search</button>
              <button className={`modal-tab ${configTab === 'url' ? 'active' : ''}`} onClick={() => setConfigTab('url')}>By URL</button>
              <button className={`modal-tab ${configTab === 'saved' ? 'active' : ''}`} onClick={() => setConfigTab('saved')}>Saved ({savedChannels.length})</button>
            </div>

            {configTab === 'keyword' && (
              <div className="modal-body">
                <div className="search-row">
                  <input className="modal-input" placeholder="Search channels e.g. cooking, fitness..." value={searchKeyword}
                    onChange={e => setSearchKeyword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleSearch()} />
                  <button className="search-btn" onClick={handleSearch}>Search</button>
                </div>
                <div className="filter-label">Follower Size:</div>
                <div className="filter-pills">
                  {FOLLOWER_FILTERS.map(f => (
                    <button key={f.label} className={`filter-pill ${followerFilter.label === f.label ? 'active' : ''}`}
                      onClick={() => setFollowerFilter(f)}>{f.label}</button>
                  ))}
                </div>
                <div className="search-results">
                  {searchResults.map(ch => (
                    <div key={ch.id} className="result-item">
                      <div className="result-avatar">{ch.avatar}</div>
                      <div className="result-info">
                        <span className="result-name">{ch.name}</span>
                        <span className="result-handle">{ch.handle} · {fmtNum(ch.followers)} followers</span>
                      </div>
                      <button className={`add-btn ${savedChannels.find(s => s.id === ch.id) ? 'added' : ''}`}
                        onClick={() => addChannel(ch)}>
                        {savedChannels.find(s => s.id === ch.id) ? '✓ Added' : '+ Add'}
                      </button>
                    </div>
                  ))}
                  {searchResults.length === 0 && searchKeyword && (
                    <p className="no-results">Press Search to find channels</p>
                  )}
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
                  const newCh = { id: Date.now(), name: handle, handle: `@${handle}`, avatar: handle[0]?.toUpperCase() || 'C', followers: 0 };
                  addChannel(newCh);
                  setUrlInput('');
                  setConfigTab('saved');
                }}>Add Channel from URL</button>
              </div>
            )}

            {configTab === 'saved' && (
              <div className="modal-body">
                {savedChannels.length === 0 ? (
                  <p className="no-results">No channels added yet</p>
                ) : (
                  savedChannels.map(ch => (
                    <div key={ch.id} className="result-item">
                      <div className="result-avatar">{ch.avatar}</div>
                      <div className="result-info">
                        <span className="result-name">{ch.name}</span>
                        <span className="result-handle">{ch.handle} {ch.followers > 0 ? `· ${fmtNum(ch.followers)} followers` : ''}</span>
                      </div>
                      <button className="remove-btn" onClick={() => removeChannel(ch.id)}>Remove</button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default FeedPage;
