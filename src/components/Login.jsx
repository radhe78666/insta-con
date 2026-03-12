import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setErrorMsg(error.message);
      setLoading(false);
    } else {
      setLoading(false);
      navigate('/dashboard');
    }
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Enter your details to access the dashboard</p>
      </div>

      {errorMsg && <div className="error-message">{errorMsg}</div>}

      <form onSubmit={handleLogin}>
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

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </div>

        <button type="submit" className="submit-btn" disabled={loading}>
          {loading ? 'Logging In...' : 'Login'}
        </button>
      </form>

      <div className="register-link">
        Don't have an account? <a href="#">Sign up</a>
      </div>
    </div>
  );
};

export default Login;
