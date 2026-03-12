import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Listen for the auth event when Supabase exchanges the token from the URL
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' && session) {
        setSessionReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match!');
      return;
    }
    if (newPassword.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) {
      setErrorMsg(error.message);
    } else {
      setSuccessMsg('Password updated successfully! Redirecting to login...');
      setTimeout(() => navigate('/'), 2500);
    }
    setLoading(false);
  };

  if (!sessionReady) {
    return (
      <div className="login-container">
        <div className="login-header">
          <h2>Verifying Link...</h2>
          <p>Please wait while we verify your reset link.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Set New Password</h2>
        <p>Enter your new password below</p>
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && (
        <div className="error-message" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)' }}>
          {successMsg}
        </div>
      )}

      <form onSubmit={handleReset}>
        <div className="input-group">
          <input
            type={showPassword ? 'text' : 'password'}
            id="new-password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
          <label htmlFor="new-password">New Password</label>
          <span className="toggle-password" onClick={() => setShowPassword(!showPassword)}>
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>

        <div className="input-group">
          <input
            type="password"
            id="confirm-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
          />
          <label htmlFor="confirm-password">Confirm Password</label>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPassword;
