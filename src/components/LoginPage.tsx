import React, { useState } from 'react';
import { Eye, EyeOff, ArrowLeft, User, Lock, Mail, Shield } from 'lucide-react';

interface LoginPageProps {
  onBack: () => void;
  onLoginSuccess: () => void;
}

function LoginPage({ onBack, onLoginSuccess }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<'login' | 'verify'>('login');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMaskedEmail(data.email);
        setStep('verify');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/verify-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, code: verificationCode }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store token and user data
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        // Call success callback to show home page
        onLoginSuccess();
      } else {
        setError(data.message || 'Verification failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:3001/api/auth/send-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('New verification code sent to your email!');
      } else {
        setError(data.message || 'Failed to resend code');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white overflow-hidden relative">
      {/* Subtle grid background */}
      <div className="absolute inset-0 opacity-5" 
           style={{
             backgroundImage: `
               linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
               linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px'
           }}
      />

      {/* Back button */}
      <button
        onClick={onBack}
        className="absolute top-8 left-8 z-10 group flex items-center space-x-2 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:text-gray-300"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
        <span>Back</span>
      </button>

      {/* Clutch logo in top right */}
      <div className="absolute top-8 right-8 z-10">
        <span className="pixel-font text-sm tracking-wider text-white/80" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          clutch
        </span>
      </div>

      {/* Main login container */}
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Login form container */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/20 p-8 relative">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="pixel-font text-lg mb-2 tracking-wide" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {step === 'login' ? 'Welcome Back' : 'Verify Email'}
              </h1>
              <p className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {step === 'login' ? 'Login to Clutch' : `Code sent to ${maskedEmail}`}
              </p>
            </div>

            {/* Error message */}
            {error && (
              <div className="mb-6 p-3 bg-red-900/50 border border-red-500/50 text-red-300">
                <p className="pixel-font text-xs tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  {error}
                </p>
              </div>
            )}

            {step === 'login' ? (
              /* Login form */
              <form onSubmit={handleLogin} className="space-y-6">
                {/* Email field */}
                <div className="space-y-2">
                  <label className="pixel-font text-xs tracking-wider text-gray-300 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Email
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-black/50 border border-white/30 px-10 py-3 pixel-font text-xs tracking-wider focus:border-white focus:outline-none transition-colors duration-300"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                {/* Password field */}
                <div className="space-y-2">
                  <label className="pixel-font text-xs tracking-wider text-gray-300 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-black/50 border border-white/30 px-10 py-3 pixel-font text-xs tracking-wider focus:border-white focus:outline-none transition-colors duration-300 pr-12"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                      placeholder="••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember me and forgot password */}
                <div className="flex items-center justify-between">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 bg-black/50 border border-white/30 rounded-none focus:ring-0 focus:ring-offset-0"
                    />
                    <span className="pixel-font text-xs tracking-wider text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                      Remember
                    </span>
                  </label>
                  <button
                    type="button"
                    className="pixel-font text-xs tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    Forgot?
                  </button>
                </div>

                {/* Send Code button */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group relative bg-transparent border-2 border-white py-4 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <Mail className="w-4 h-4" />
                    <span>{isLoading ? 'Sending...' : 'Send Code'}</span>
                  </span>
                  
                  {/* Animated background fill */}
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  
                  {/* Loading animation */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>
              </form>
            ) : (
              /* Verification form */
              <form onSubmit={handleVerification} className="space-y-6">
                {/* Verification code field */}
                <div className="space-y-2">
                  <label className="pixel-font text-xs tracking-wider text-gray-300 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Verification Code
                  </label>
                  <div className="relative">
                    <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full bg-black/50 border border-white/30 px-10 py-3 pixel-font text-lg tracking-widest text-center focus:border-white focus:outline-none transition-colors duration-300"
                      style={{ fontFamily: "'Press Start 2P', monospace" }}
                      placeholder="000000"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="pixel-font text-xs text-gray-500 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Enter the 6-digit code from your email
                  </p>
                </div>

                {/* Verify button */}
                <button
                  type="submit"
                  disabled={isLoading || verificationCode.length !== 6}
                  className="w-full group relative bg-transparent border-2 border-white py-4 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <Shield className="w-4 h-4" />
                    <span>{isLoading ? 'Verifying...' : 'Verify & Login'}</span>
                  </span>
                  
                  {/* Animated background fill */}
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  
                  {/* Loading animation */}
                  {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    </div>
                  )}
                </button>

                {/* Resend code */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={handleResendCode}
                    disabled={isLoading}
                    className="pixel-font text-xs tracking-wider text-gray-400 hover:text-white transition-colors duration-300 disabled:opacity-50"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    Resend Code
                  </button>
                </div>

                {/* Back to login */}
                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setStep('login');
                      setVerificationCode('');
                      setError('');
                    }}
                    className="pixel-font text-xs tracking-wider text-gray-400 hover:text-white transition-colors duration-300"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                  >
                    ← Back to Login
                  </button>
                </div>
              </form>
            )}

            {step === 'login' && (
              /* Sign up link */
              <div className="mt-8 text-center">
                <p className="pixel-font text-xs tracking-wider text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Don't have an account?{' '}
                  <button className="text-white hover:text-gray-300 transition-colors duration-300 underline">
                    Sign up
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Ambient particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/10 rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-white/10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-white/10" />
    </div>
  );
}

export default LoginPage;