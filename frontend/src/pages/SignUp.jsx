import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import Logo from '../components/Logo';
import OtpInput from '../components/OtpInput';
import { toast } from 'react-hot-toast';

export default function SignUp() {
  const { register, sendOtp, verifyOtp, googleLogin, isAuthenticated } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1 = Registration details, 2 = OTP verification
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const [isResending, setIsResending] = useState(false);

  // Navigate to complete-profile or dashboard AFTER React has flushed the auth state
  useEffect(() => {
    if (isAuthenticated) {
      const justRegistered = sessionStorage.getItem('justRegistered') === 'true' || localStorage.getItem('justRegistered') === 'true';
      if (justRegistered) {
        window.location.hash = '#/complete-profile';
      } else {
        window.location.hash = '#/dashboard';
      }
    }
  }, [isAuthenticated]);

  // Resend OTP countdown timer
  useEffect(() => {
    let interval = null;
    if (step === 2 && resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [step, resendTimer]);

  const handleSendOtp = async (e) => {
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
    const res = await sendOtp(cleanEmail);
    setIsLoading(false);
    if (res.success) {
      setStep(2);
      setResendTimer(30);
    } else {
      setError(res.error);
    }
  };

  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResending) return;
    setError('');
    setIsResending(true);
    const cleanEmail = email.trim();
    const res = await sendOtp(cleanEmail);
    setIsResending(false);
    if (res.success) {
      toast.success('A new verification code has been sent to your email.');
      setResendTimer(30);
    } else {
      setError(res.error);
    }
  };

  const handleVerifyOtpAndRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (otp.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);
    const cleanEmail = email.trim();
    const verifyRes = await verifyOtp(cleanEmail, otp);
    if (verifyRes.success) {
      sessionStorage.setItem('justRegistered', 'true');
      localStorage.setItem('justRegistered', 'true');
      const regRes = await register(name.trim(), cleanEmail, password);
      setIsLoading(false);
      if (regRes.success) {
        toast.success('Account created successfully!');
        window.location.hash = '#/complete-profile';
      } else {
        sessionStorage.removeItem('justRegistered');
        localStorage.removeItem('justRegistered');
        setError(regRes.error);
      }
    } else {
      setIsLoading(false);
      setError(verifyRes.error);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    sessionStorage.setItem('justRegistered', 'true');
    localStorage.setItem('justRegistered', 'true');
    const res = await googleLogin(credentialResponse.credential);
    if (!res.success) {
      sessionStorage.removeItem('justRegistered');
      localStorage.removeItem('justRegistered');
      setError(res.error);
    }
    // Navigation is handled by the useEffect above
  };

  return (
    <div className="min-h-screen bg-theme-main flex flex-col items-center justify-center p-4 selection:bg-theme-hover relative">
      
      {/* Back button */}
      <a href="#/" className="absolute top-8 left-8 flex items-center gap-2 text-sm font-medium text-theme-muted hover:text-theme-text transition-colors">
        <iconify-icon icon="lucide:arrow-left"></iconify-icon>
        Back to home
      </a>

      <div className="w-full max-w-[400px] flex flex-col items-center fade-in-up">
        {/* Header Section */}
        <div className="flex flex-col items-center text-center gap-2 mb-8">
          <Logo className="h-10 w-auto text-theme-text mb-2" />
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-theme-text">Create your account</h1>
          <p className="text-theme-muted text-sm">Join the community and share knowledge.</p>
        </div>

        {/* Login Box */}
        <div className="w-full bg-theme-card rounded-sm p-6 sm:p-8 flex flex-col gap-6">
          <form className="flex flex-col gap-5" onSubmit={step === 1 ? handleSendOtp : handleVerifyOtpAndRegister}>
            
            <div key={step} className="step-transition flex flex-col gap-5">
              {step === 1 ? (
                <>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-theme-text">Full name</label>
                    <input 
                      type="text" 
                      placeholder="Enter your full name" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="input-field"
                    />
                  </div>

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
                      placeholder="Create a password (min 6 characters)" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      minLength={6}
                      required
                      className="input-field"
                    />
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-bold text-theme-text">Verification Code (OTP)</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        setStep(1);
                        setError('');
                      }} 
                      className="text-[11px] font-medium text-theme-muted hover:text-theme-text transition-colors cursor-pointer"
                    >
                      Edit details
                    </button>
                  </div>
                  <OtpInput 
                    value={otp}
                    onChange={setOtp}
                    length={6}
                  />
                  <div className="flex justify-between items-center text-xs mt-1">
                    <span className="text-theme-muted text-[11px] truncate max-w-[200px]" title={email}>
                      Code sent to {email}
                    </span>
                    <button
                      type="button"
                      disabled={resendTimer > 0 || isResending}
                      onClick={handleResendOtp}
                      className="font-bold text-[11px] text-theme-text hover:opacity-80 active:scale-95 disabled:opacity-40 transition-all cursor-pointer disabled:cursor-not-allowed flex-shrink-0"
                    >
                      {isResending ? 'Sending...' : resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {error && (
              <p className="text-red-500 text-xs font-medium text-center animate-fade-in">{error}</p>
            )}

            <button 
              disabled={isLoading}
              className="w-full py-3 bg-theme-inverted text-theme-inverted-text rounded-sm font-bold text-sm hover:opacity-85 active:scale-[0.98] transition-all mt-2 disabled:opacity-50 cursor-pointer shadow-sm"
            >
              {isLoading ? (step === 1 ? 'Sending code...' : 'Verifying...') : (step === 1 ? 'Sign up' : 'Verify & Complete')}
            </button>
          </form>

          <div className="text-center relative flex justify-center items-center">
            <span className="text-[10px] tracking-widest text-theme-muted font-medium px-2 bg-theme-card relative z-10">or continue with</span>
            <div className="absolute left-0 right-0 top-1/2 h-[1px] bg-theme-hover"></div>
          </div>

          <div className="flex gap-4">
            <div className="relative flex-1 flex items-center justify-center overflow-hidden">
              <button type="button" className="w-full h-full py-2.5 bg-theme-main hover:bg-[#121214] border border-theme-border rounded-sm flex items-center justify-center gap-3 text-sm font-medium text-theme-muted hover:text-theme-text transition-all shadow-sm">
                <iconify-icon icon="logos:google-icon" className="text-base"></iconify-icon>
                Google
              </button>
              <div className="absolute inset-0 opacity-0 cursor-pointer flex justify-center items-center">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => setError('Google Login Failed')}
                  size="large"
                  width="200"
                />
              </div>
            </div>
            <button type="button" className="flex-1 py-2.5 bg-theme-main hover:bg-[#121214] border border-theme-border rounded-sm flex items-center justify-center gap-3 text-sm font-medium text-theme-muted hover:text-theme-text transition-all shadow-sm">
              <iconify-icon icon="simple-icons:github" className="text-base"></iconify-icon>
              GitHub
            </button>
          </div>
        </div>

        {/* Footer Text */}
        <p className="text-center text-xs text-theme-muted mt-8 max-w-xs">
          Already have an account? <a href="#/signin" className="hover:text-theme-text font-bold transition-colors">Login</a>
        </p>
      </div>
    </div>
  );
}
