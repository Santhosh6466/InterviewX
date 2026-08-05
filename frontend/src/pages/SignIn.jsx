import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';

export default function SignIn() {
  const { login, googleLogin, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Navigate to dashboard AFTER React has flushed the auth state update
  useEffect(() => {
    if (isAuthenticated) {
      window.location.hash = '#/dashboard';
    }
  }, [isAuthenticated]);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setError('');

    const cleanEmail = email.trim();
    if (!cleanEmail.toLowerCase().endsWith('@gmail.com')) {
      setError('Email must be a valid @gmail.com address');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 digits/characters long');
      return;
    }

    setIsLoading(true);
    const res = await login(cleanEmail, password);
    setIsLoading(false);
    if (!res.success) {
      setError(res.error);
    }
    // Navigation is handled by the useEffect above
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const res = await googleLogin(credentialResponse.credential);
    if (!res.success) {
      setError(res.error);
    }
    // Navigation is handled by the useEffect above
  };

  return (
    <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-4 selection:bg-theme-hover relative">

      {/* Back button (optional, keeps navigation) */}
      <a href="#/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-theme-muted hover:text-theme-text transition-colors">
        <iconify-icon icon="lucide:arrow-left"></iconify-icon>
        Back to home
      </a>

      <div className="w-full max-w-[400px] flex flex-col items-center fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <iconify-icon icon="ph:hand-waving-light" className="text-theme-text text-5xl mb-2"></iconify-icon>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-theme-text">Welcome back</h1>
          <p className="text-theme-muted text-sm">Sign in to your account to continue</p>
        </div>

        {/* Login Box */}
        <div className="w-full bg-theme-card rounded-sm p-6 sm:p-8 flex flex-col gap-6">
          <div className="relative w-full flex items-center justify-center overflow-hidden">
            <button type="button" className="w-full py-2.5 bg-theme-main hover:bg-[#121214] border border-theme-border rounded-sm flex items-center justify-center gap-3 text-sm font-medium text-theme-muted hover:text-theme-text transition-all shadow-sm">
              <iconify-icon icon="logos:google-icon" className="text-base"></iconify-icon>
              Continue with Google
            </button>
            <div className="absolute inset-0 opacity-0 cursor-pointer flex justify-center items-center">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => setError('Google Login Failed')}
                size="large"
                width="400"
              />
            </div>
          </div>

          <div className="text-center relative flex justify-center items-center">
            <span className="text-[10px] tracking-widest text-theme-muted font-medium px-2 bg-theme-card relative z-10">OR</span>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-theme-hover"></div>
          </div>

          <form className="flex flex-col gap-6" onSubmit={handleEmailLogin}>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-text">Email address</label>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="input-field"
              />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-theme-text">Password</label>
              <input
                type="password"
                placeholder="Enter your password (min 6 characters)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
                className="input-field"
              />
            </div>
            {error && (
              <p className="text-red-500 text-xs font-medium text-center">{error}</p>
            )}
            <button
              disabled={isLoading}
              className="w-full py-3 bg-theme-inverted text-theme-inverted-text rounded-sm font-bold text-sm hover:opacity-80 transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>

        {/* Footer Text */}
        <p className="text-center text-[10px] text-theme-muted mt-8 max-w-xs">
          By signing in, you agree to our <a href="#" className="hover:text-theme-text transition-colors">Terms of Service</a> and <a href="#" className="hover:text-theme-text transition-colors">Privacy Policy</a>
        </p>
        <p className="text-center text-xs text-theme-muted mt-4 max-w-xs">
          Don't have an account? <a href="#/signup" className="hover:text-theme-text font-bold transition-colors">Sign up</a>
        </p>
      </div>
    </div>
  );
}
