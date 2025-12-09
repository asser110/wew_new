import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Shield, Clock, CheckCircle, XCircle, Key, User, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface SecretLink {
  id: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

interface SecretSignupPageProps {
  linkId: string;
}

export default function SecretSignupPage({ linkId }: SecretSignupPageProps) {
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
    // In production, this would validate against a backend database
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
      const response = await fetch('http://localhost:3001/api/auth/send-verification', {
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
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isValid === null) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400 pixel-font" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            Validating invitation...
          </p>
        </div>
      </div>
    );
  }

  if (!isValid || !link) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2 pixel-font" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Invalid Invitation
            </h1>
            <p className="text-gray-400 mb-4">
              This sign-up invitation is either invalid or has expired.
            </p>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">
                Invitations expire after 15 minutes for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2 pixel-font" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Account Created!
            </h1>
            <p className="text-gray-400 mb-6">
              Your Clutch account has been created successfully. A verification email has been sent to your email address.
            </p>
            
            <div className="bg-green-900/20 border border-green-500/30 rounded-lg p-4 mb-6">
              <p className="text-green-300 text-sm">
                ✅ Check your email for a verification code to complete the login process.
              </p>
            </div>
            
            <button
              onClick={() => window.location.href = '/'}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors pixel-font"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            >
              Go to Clutch Login
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2 pixel-font" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            Exclusive Invitation
          </h1>
          <p className="text-gray-400 mb-6">
            You've been invited to join Clutch!
          </p>

          {/* Link Info */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Invitation ID:</span>
              <span className="text-white font-mono text-sm">{link.id.slice(0, 8)}...</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Created:</span>
              <span className="text-white text-sm">{link.createdAt.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Expires:</span>
              <span className="text-white text-sm">{link.expiresAt.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Time Remaining:</span>
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-green-400" />
                <span className="text-green-400 font-semibold">{timeRemaining}</span>
              </div>
            </div>
          </div>

          {/* Sign-up Form */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-4 pixel-font" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Join Clutch Platform
            </h2>
            <p className="text-gray-300 text-sm mb-6">
              This exclusive invitation expires in {timeRemaining}.
            </p>
            
            {error && (
              <div className="mb-4 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your full name"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Enter your email"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Create a password (min 6 characters)"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full bg-gray-800/50 border border-gray-600 rounded-lg pl-10 pr-12 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <Key className="w-4 h-4" />
                    <span>Create Account</span>
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-4 text-center">
              <p className="text-gray-400 text-xs">
                Invitation Code: <span className="text-blue-400 font-mono">{link.id.slice(-8).toUpperCase()}</span>
              </p>
            </div>
          </div>

          {/* Warning */}
          <div className="mt-6 bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-yellow-300 text-xs">
              ⚠️ This invitation will expire automatically. Do not share this URL.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}