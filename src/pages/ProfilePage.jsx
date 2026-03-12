import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import './ProfilePage.css';

const ProfilePage = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user));
  }, []);

  const displayName = user?.email?.split('@')[0] || 'User';
  const joinedDate = user?.created_at ? new Date(user.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—';

  return (
    <div className="profile-page">
      <div className="profile-header">
        <h1>Profile & Settings</h1>
        <p>Manage your account details and subscription</p>
      </div>

      <div className="profile-grid">
        {/* Account Card */}
        <div className="profile-card">
          <div className="card-title">Account Information</div>
          <div className="avatar-row">
            <div className="big-avatar">{displayName[0]?.toUpperCase()}</div>
            <div>
              <div className="user-display-name">{displayName}</div>
              <div className="user-email">{user?.email || '—'}</div>
              <div className="joined-date">Joined {joinedDate}</div>
            </div>
          </div>
        </div>

        {/* Plan Card */}
        <div className="profile-card">
          <div className="card-title">Your Plan</div>
          <div className="plan-row">
            <div className="plan-badge free">Free Plan</div>
            <p className="plan-desc">You're on the Free plan. Upgrade to unlock more channels, unlimited library, and advanced filters.</p>
          </div>
          <div className="plan-features">
            <div className="plan-feat">✓ Up to 5 tracked channels</div>
            <div className="plan-feat">✓ 50 library saves</div>
            <div className="plan-feat">✓ Basic filters</div>
            <div className="plan-feat muted">✗ Advanced analytics</div>
            <div className="plan-feat muted">✗ Unlimited channels</div>
          </div>
          <button className="upgrade-btn">Upgrade to Pro</button>
        </div>

        {/* Website Card */}
        <div className="profile-card">
          <div className="card-title">App Info</div>
          <div className="app-info-row">
            <div className="app-logo-box">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect width="24" height="24" rx="6" fill="#3b82f6"/>
                <path d="M7 12l3.5 3.5L17 8" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <div>
              <div className="app-name">InstaCon</div>
              <div className="app-version">Version 1.0.0</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
