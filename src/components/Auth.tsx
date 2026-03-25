import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Lock, User, ArrowRight, ChevronLeft, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

type AuthView = 'login' | 'signup' | 'forgot-password';

interface AuthProps {
  onLogin: (email: string) => void;
}

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleViewChange = (newView: AuthView) => {
    setView(newView);
    setError(null);
    setSuccess(null);
  };

  const containerVariants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
  };

  const GoogleIcon = () => (
    <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email.');
      return;
    }
    
    setError(null);
    setSuccess(null);
    setIsLoading(true);

    try {
      if (view === 'login') {
        if (!password) {
          setError('Please enter your password.');
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) setError(error.message);
      } else if (view === 'signup') {
        if (!password || !fullName) {
          setError('Please fill in all fields.');
          setIsLoading(false);
          return;
        }
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) setError(error.message);
        else setSuccess('Account created successfully! You can now log in.');
      } else if (view === 'forgot-password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) setError(error.message);
        else setSuccess('Password reset email sent! Check your inbox.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const StatusMessage = () => (
    <AnimatePresence>
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-start gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm mb-4"
        >
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <p className="pt-0.5">{error}</p>
        </motion.div>
      )}
      {success && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex items-start gap-3 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm mb-4"
        >
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <p className="pt-0.5">{success}</p>
        </motion.div>
      )}
    </AnimatePresence>
  );

  const renderLogin = () => (
    <motion.div
      key="login"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-md space-y-8 p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
    >
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-4xl font-bold tracking-tighter text-white font-serif italic">InstaCore</h1>
        <p className="text-zinc-400 text-sm">Welcome back. Please enter your details.</p>
      </div>

      <StatusMessage />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email or Username</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="Enter your email"
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Password</label>
            <button
              type="button"
              onClick={() => handleViewChange('forgot-password')}
              className="text-xs font-medium text-zinc-400 hover:text-white transition-colors"
            >
              Forgot password?
            </button>
          </div>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          disabled={isLoading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-6 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <div className="relative py-4">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-2 text-zinc-500">Or continue with</span>
        </div>
      </div>

      <button className="w-full bg-zinc-900 border border-zinc-800 text-white py-3 rounded-xl hover:bg-zinc-800 transition-colors flex items-center justify-center gap-3">
        <GoogleIcon />
        Google
      </button>

      <p className="text-center text-zinc-500 text-sm">
        Don't have an account?{' '}
        <button
          onClick={() => handleViewChange('signup')}
          className="text-white font-semibold hover:underline underline-offset-4"
        >
          Sign up
        </button>
      </p>
    </motion.div>
  );

  const renderSignup = () => (
    <motion.div
      key="signup"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-md space-y-6 p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
    >
      <div className="text-center space-y-2 mb-6">
        <h1 className="text-4xl font-bold tracking-tighter text-white font-serif italic">InstaCore</h1>
        <p className="text-zinc-400 text-sm">Create your account to start sharing.</p>
      </div>

      <StatusMessage />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Full Name</label>
          <div className="relative group">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="text"
              placeholder="John Doe"
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Password</label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
        </div>

        <button 
          disabled={isLoading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-4 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>
      </form>

      <p className="text-center text-zinc-500 text-sm">
        Already have an account?{' '}
        <button
          onClick={() => handleViewChange('login')}
          className="text-white font-semibold hover:underline underline-offset-4"
        >
          Log in
        </button>
      </p>
    </motion.div>
  );

  const renderForgotPassword = () => (
    <motion.div
      key="forgot"
      variants={containerVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="w-full max-w-md space-y-6 p-8 bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl"
    >
      <div className="flex justify-start">
        <button
          onClick={() => handleViewChange('login')}
          className="flex items-center gap-1 text-zinc-500 hover:text-white transition-colors text-sm font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to login
        </button>
      </div>

      <div className="text-center space-y-2 mb-6">
        <div className="w-16 h-16 bg-zinc-900 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
          <Lock className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-white">Trouble logging in?</h1>
        <p className="text-zinc-400 text-sm">
          Enter your email and we'll send you a link to get back into your account.
        </p>
      </div>

      <StatusMessage />

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider ml-1">Email</label>
          <div className="relative group">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-white transition-colors" />
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full bg-zinc-900 border border-zinc-800 text-white pl-10 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-zinc-600 transition-all placeholder:text-zinc-600"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
        </div>

        <button 
          disabled={isLoading}
          className="w-full bg-white text-black font-bold py-3 rounded-xl hover:bg-zinc-200 active:scale-[0.98] transition-all flex items-center justify-center gap-2 group mt-2 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Sending Link...
            </>
          ) : (
            'Send Login Link'
          )}
        </button>
      </form>

      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-zinc-800"></div>
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-zinc-950 px-2 text-zinc-500">Or</span>
        </div>
      </div>

      <button
        onClick={() => handleViewChange('signup')}
        className="w-full text-white text-sm font-semibold hover:underline"
      >
        Create New Account
      </button>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 selection:bg-white selection:text-black">
      {/* Background Decorative Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-900/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-zinc-900/20 blur-[120px]" />
      </div>

      <AnimatePresence mode="wait">
        {view === 'login' && renderLogin()}
        {view === 'signup' && renderSignup()}
        {view === 'forgot-password' && renderForgotPassword()}
      </AnimatePresence>

      <footer className="mt-12 text-zinc-600 text-[10px] uppercase tracking-[0.2em] font-medium">
        &copy; 2026 InstaCore from Meta-ish
      </footer>
    </div>
  );
};

export default Auth;
