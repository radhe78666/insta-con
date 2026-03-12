import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

const Login = () => {
  const [mode, setMode] = useState('login'); // 'login', 'signup', 'forgot_password'
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleAction = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setLoading(true);

    let error = null;
    let redirectOnSuccess = false;

    if (mode === 'login') {
      const { error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      error = loginError;
      redirectOnSuccess = !error;
    } else if (mode === 'signup') {
      const { data, error: signupError } = await supabase.auth.signUp({ email, password });
      error = signupError;
      
      // If no error, check if a session was created immediately (meaning email confirmation is OFF)
      if (!error) {
        if (data?.session) {
           redirectOnSuccess = true;
        } else {
           setSuccessMsg('Account created successfully! You can now log in.');
        }
      }
    } else if (mode === 'forgot_password') {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'https://insta-con.vercel.app/reset-password',
      });
      error = resetError;
      if (!error) setSuccessMsg('Password reset link sent! Check your email.');
    }

    if (error) {
      setErrorMsg(error.message);
    } else if (redirectOnSuccess) {
      navigate('/dashboard');
    }
    setLoading(false);
  };

  const togglePassword = () => setShowPassword(!showPassword);

  const resetForm = (newMode) => {
    setMode(newMode);
    setErrorMsg('');
    setSuccessMsg('');
    setPassword('');
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>
          {mode === 'login' && 'Welcome Back'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'forgot_password' && 'Reset Password'}
        </h2>
        <p>
          {mode === 'login' && 'Enter your details to access the dashboard'}
          {mode === 'signup' && 'Sign up to get started'}
          {mode === 'forgot_password' && 'Enter your email to receive a reset link'}
        </p>
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}
      {successMsg && <div className="error-message" style={{background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.2)'}}>{successMsg}</div>}

      <form onSubmit={handleAction}>
        <div className="input-group">
          <input 
            type="email" 
            id="email" 
            required 
            autoComplete="off" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <label htmlFor="email">Email Address</label>
        </div>

        {mode !== 'forgot_password' && (
          <div className="input-group">
            <input 
              type={showPassword ? 'text' : 'password'} 
              id="password" 
              required 
              autoComplete="off" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label htmlFor="password">Password</label>
            <span className="toggle-password" onClick={togglePassword}>
              {showPassword ? 'Hide' : 'Show'}
            </span>
          </div>
        )}

        {mode === 'login' && (
          <div className="options">
            <label>
              <input type="checkbox" /> Remember me
            </label>
            <a href="#" onClick={(e) => { e.preventDefault(); resetForm('forgot_password'); }}>Forgot Password?</a>
          </div>
        )}

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Processing...' : (
            mode === 'login' ? 'Login' :
            mode === 'signup' ? 'Sign Up' : 'Send Reset Link'
          )}
        </button>
      </form>

      <div className="register-link">
        {mode === 'login' ? (
          <>Don't have an account? <a href="#" onClick={(e) => { e.preventDefault(); resetForm('signup'); }}>Sign up</a></>
        ) : (
          <>Back to <a href="#" onClick={(e) => { e.preventDefault(); resetForm('login'); }}>Login</a></>
        )}
      </div>
    </div>
  );
};

export default Login;
