import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Dashboard.css';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/');
      } else {
        setUser(session.user);
      }
    };

    getSession();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (!user) return <div className="loading">Loading Dashboard...</div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h2>Dashboard Overview</h2>
        <div className="user-info">
          <p><strong>Logged in as:</strong></p>
          <p className="email-display">{user.email}</p>
        </div>
        
        <div className="stats-grid">
          <div className="stat-box">
            <h3>Active Sessions</h3>
            <p>1</p>
          </div>
          <div className="stat-box">
            <h3>Status</h3>
            <p className="status-badge">Online</p>
          </div>
        </div>

        <button onClick={handleLogout} className="logout-btn">
          Secure Logout
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
