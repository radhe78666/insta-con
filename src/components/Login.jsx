import { useState } from 'react';
import './Login.css';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('Login Submitted!');
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-container">
      <div className="login-header">
        <h2>Welcome Back</h2>
        <p>Enter your details to access your tool</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="input-group">
          <input type="email" id="email" required autoComplete="off" />
          <label htmlFor="email">Email Address</label>
        </div>

        <div className="input-group">
          <input 
            type={showPassword ? 'text' : 'password'} 
            id="password" 
            required 
            autoComplete="off" 
          />
          <label htmlFor="password">Password</label>
          <span 
            className="toggle-password" 
            onClick={togglePassword}
          >
            {showPassword ? 'Hide' : 'Show'}
          </span>
        </div>

        <div className="options">
          <label>
            <input type="checkbox" /> Remember me
          </label>
          <a href="#">Forgot Password?</a>
        </div>

        <button type="submit" className="submit-btn">Login</button>
      </form>

      <div className="register-link">
        Don't have an account? <a href="#">Sign up</a>
      </div>
    </div>
  );
};

export default Login;
