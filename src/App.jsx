import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import ResetPassword from './components/ResetPassword';
import Sidebar from './components/Sidebar';
import DashboardPage from './pages/DashboardPage';
import FeedPage from './pages/FeedPage';
import ProfilePage from './pages/ProfilePage';
import './App.css';

// Layout wrapper for authenticated pages
const AppLayout = ({ children }) => (
  <div style={{ display: 'flex', minHeight: '100vh', background: '#000' }}>
    <Sidebar />
    <main style={{ marginLeft: '220px', flex: 1, display: 'flex', flexDirection: 'column' }}>
      {children}
    </main>
  </div>
);

function App() {
  const [session, setSession] = useState(undefined); // undefined = loading

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#000', color: '#fff' }}>
        Loading...
      </div>
    );
  }

  return (
    <Router>
      <div className="app-background">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
      </div>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={session ? <Navigate to="/dashboard" replace /> : <Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Protected Routes */}
        <Route path="/dashboard" element={session ? <AppLayout><DashboardPage /></AppLayout> : <Navigate to="/" replace />} />
        <Route path="/feed" element={session ? <AppLayout><FeedPage /></AppLayout> : <Navigate to="/" replace />} />
        <Route path="/profile" element={session ? <AppLayout><ProfilePage /></AppLayout> : <Navigate to="/" replace />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to={session ? "/dashboard" : "/"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
