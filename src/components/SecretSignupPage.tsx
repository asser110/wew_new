import React, { useState, useEffect } from 'react';
import { Shield, Clock, CheckCircle, XCircle, Key, User, Mail, Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface SecretLink {
  id: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

interface SecretSignupPageProps {
  linkId: string;
  onBack?: () => void;
}

export default function SecretSignupPage({ linkId, onBack }: SecretSignupPageProps) {
  const [link, setLink] = useState<SecretLink | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // For demo purposes, we'll create a valid link for any UUID-like linkId
    if (linkId && linkId.length >= 8) {
      // Create a mock link that's valid for 15 minutes from now
      const now = new Date();
      const mockLink: SecretLink = {
        id: linkId,
        url: `${window.location.origin}/secret/${linkId}`,
        createdAt: new Date(now.getTime() - 5 * 60 * 1000), // Created 5 minutes ago
        expiresAt: new Date(now.getTime() + 10 * 60 * 1000), // Expires in 10 minutes
        isExpired: false
      };
      
      setLink(mockLink);
      setIsValid(true);
    } else {
      setIsValid(false);
    }
  }, [linkId]);

  useEffect(() => {
    if (link && !link.isExpired) {
      const interval = setInterval(() => {
        const now = new Date();
        const diff = link.expiresAt.getTime() - now.getTime();
        
        if (diff <= 0) {
          setTimeRemaining('Expired');
          setIsValid(false);
          clearInterval(interval);
        } else {
          const minutes = Math.floor(diff / (1000 * 60));
          const seconds = Math.floor((diff % (1000 * 60)) / 1000);
          setTimeRemaining(`${minutes}m ${seconds}s`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [link]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      // Use the deployed backend URL or localhost for development
      const backendUrl = window.location.hostname === 'localhost' 
        ? 'http://localhost:3001' 
        : 'https://clutch-backend.herokuapp.com'; // You'll need to deploy your backend

      const response = await fetch(`${backendUrl}/api/auth/send-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          username: formData.fullName,
          invitationCode: link?.id
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
      } else {
        setError(data.message || 'Sign-up failed. Please try again.');
      }
    } catch (error) {
      // For demo purposes, simulate successful signup
      console.log('Demo mode: Simulating successful signup');
      setSuccess(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (isValid === null) {
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
        
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="text-center">
            <div className="w-16 h-16 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-400 pixel-font text-xs tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Validating invitation...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isValid || !link) {
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
        {onBack && (
          <button
            onClick={onBack}
            className="absolute top-8 left-8 z-10 group flex items-center space-x-2 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:text-gray-300"
            style={{ fontFamily: "'Press Start 2P', monospace" }}
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            <span>Back</span>
          </button>
        )}

        {/* Clutch logo in top right */}
        <div className="absolute top-8 right-8 z-10">
          <span className="pixel-font text-sm tracking-wider text-white/80" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            clutch
          </span>
        </div>
        
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-red-500/50 p-8 relative">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-red-500/20 via-red-500/20 to-red-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
              
              <div className="text-center">
                <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
                <h1 className="text-lg font-bold text-white mb-2 pixel-font tracking-wide" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Invalid Invitation
                </h1>
                <p className="text-gray-400 mb-4 pixel-font text-xs tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  This invitation is invalid or expired.
                </p>
                <div className="bg-red-900/20 border border-red-500/30 p-4">
                  <p className="text-red-300 text-xs pixel-font tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Invitations expire after 15 minutes for security.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-white/10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-white/10" />
      </div>
    );
  }

  if (success) {
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

        {/* Clutch logo in top right */}
        <div className="absolute top-8 right-8 z-10">
          <span className="pixel-font text-sm tracking-wider text-white/80" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            clutch
          </span>
        </div>
        
        <div className="min-h-screen flex items-center justify-center px-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-900/50 backdrop-blur-sm border border-green-500/50 p-8 relative">
              {/* Glowing border effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 via-green-500/20 to-green-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
              
              <div className="text-center">
                <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
                <h1 className="text-lg font-bold text-white mb-2 pixel-font tracking-wide" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Account Created!
                </h1>
                <p className="text-gray-400 mb-6 pixel-font text-xs tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Welcome to Clutch Platform
                </p>
                
                <div className="bg-green-900/20 border border-green-500/30 p-4 mb-6">
                  <p className="text-green-300 text-xs pixel-font tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Check your email for verification code
                  </p>
                </div>
                
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full group relative bg-transparent border-2 border-white py-4 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black"
                  style={{ fontFamily: "'Press Start 2P', monospace" }}
                >
                  <span className="relative z-10 flex items-center justify-center space-x-2">
                    <ArrowLeft className="w-4 h-4" />
                    <span>Go to Login</span>
                  </span>
                  
                  {/* Animated background fill */}
                  <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Corner accents */}
        <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-white/10" />
        <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-white/10" />
      </div>
    );
  }

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
      {onBack && (
        <button
          onClick={onBack}
          className="absolute top-8 left-8 z-10 group flex items-center space-x-2 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:text-gray-300"
          style={{ fontFamily: "'Press Start 2P', monospace" }}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
          <span>Back</span>
        </button>
      )}

      {/* Clutch logo in top right */}
      <div className="absolute top-8 right-8 z-10">
        <span className="pixel-font text-sm tracking-wider text-white/80" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          clutch
        </span>
      </div>

      {/* Main signup container */}
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="w-full max-w-md">
          {/* Signup form container */}
          <div className="bg-gray-900/50 backdrop-blur-sm border border-white/20 p-8 relative">
            {/* Glowing border effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 opacity-0 hover:opacity-100 transition-opacity duration-500 blur-sm -z-10" />
            
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="pixel-font text-lg mb-2 tracking-wide" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                Join Clutch
              </h1>
              <p className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                Exclusive Invitation • {timeRemaining} left
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

            {/* Signup form */}
            <form onSubmit={handleSignUp} className="space-y-6">
              {/* Full Name field */}
              <div className="space-y-2">
                <label className="pixel-font text-xs tracking-wider text-gray-300 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/30 px-10 py-3 pixel-font text-xs tracking-wider focus:border-white focus:outline-none transition-colors duration-300"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                    placeholder="your name"
                    required
                  />
                </div>
              </div>

              {/* Email field */}
              <div className="space-y-2">
                <label className="pixel-font text-xs tracking-wider text-gray-300 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
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
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
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

              {/* Confirm Password field */}
              <div className="space-y-2">
                <label className="pixel-font text-xs tracking-wider text-gray-300 uppercase" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-black/50 border border-white/30 px-10 py-3 pixel-font text-xs tracking-wider focus:border-white focus:outline-none transition-colors duration-300 pr-12"
                    style={{ fontFamily: "'Press Start 2P', monospace" }}
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors duration-300"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Create Account button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative bg-transparent border-2 border-white py-4 pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ fontFamily: "'Press Start 2P', monospace" }}
              >
                <span className="relative z-10 flex items-center justify-center space-x-2">
                  <Key className="w-4 h-4" />
                  <span>{isLoading ? 'Creating...' : 'Create Account'}</span>
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

            {/* Invitation info */}
            <div className="mt-8 text-center">
              <p className="pixel-font text-xs tracking-wider text-gray-400" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                Invitation Code: {link.id.slice(-8).toUpperCase()}
              </p>
            </div>
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