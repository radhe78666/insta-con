import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './DashboardPage.css';

const DashboardPage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  const displayName = user?.email?.split('@')[0] || 'User';

  return (
    <div className="dashboard-page">
      <div className="dash-header">
        <div>
          <h1>Welcome back, <span>{displayName}</span> 👋</h1>
          <p>Here's what's happening with your Instagram research today</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon blue">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="9" cy="7" r="4"/><path d="M3 21v-1a6 6 0 0112 0v1"/><path d="M16 11a4 4 0 010 8M21 15a4 4 0 00-4-4"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-val">2</span>
            <span className="stat-label">Tracked Channels</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon purple">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h7l7 7v9a2 2 0 01-2 2z"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-val">0</span>
            <span className="stat-label">Library Videos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon green">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-val">8</span>
            <span className="stat-label">Videos in Feed</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon orange">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>
            </svg>
          </div>
          <div className="stat-content">
            <span className="stat-val">Free</span>
            <span className="stat-label">Current Plan</span>
          </div>
        </div>
      </div>

      <div className="dash-section">
        <h2>Get Started</h2>
        <div className="guide-cards">
          <div className="guide-card">
            <div className="guide-num">1</div>
            <div>
              <h3>Add Channels</h3>
              <p>Go to Feed → Configure Channels to add Instagram accounts you want to track</p>
            </div>
          </div>
          <div className="guide-card">
            <div className="guide-num">2</div>
            <div>
              <h3>Explore the Feed</h3>
              <p>Browse videos from your tracked channels, sort by views, engagement, or outlier score</p>
            </div>
          </div>
          <div className="guide-card">
            <div className="guide-num">3</div>
            <div>
              <h3>Save to Library</h3>
              <p>Save inspiring videos to your Library for quick reference anytime</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
