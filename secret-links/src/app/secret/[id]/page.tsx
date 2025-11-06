'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Shield, Clock, CheckCircle, XCircle, Key } from 'lucide-react';

interface SecretLink {
  id: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

export default function SecretPage() {
  const params = useParams();
  const [link, setLink] = useState<SecretLink | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string>('');

  useEffect(() => {
    const linkId = params.id as string;
    
    // Get stored links
    const stored = localStorage.getItem('secretLinks');
    if (stored) {
      const links = JSON.parse(stored).map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt),
        expiresAt: new Date(link.expiresAt),
        isExpired: new Date() > new Date(link.expiresAt)
      }));
      
      const foundLink = links.find((l: SecretLink) => l.id === linkId);
      
      if (foundLink) {
        setLink(foundLink);
        setIsValid(!foundLink.isExpired);
      } else {
        setIsValid(false);
      }
    } else {
      setIsValid(false);
    }
  }, [params.id]);

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

  if (isValid === null) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Validating secret link...</p>
        </div>
      </div>
    );
  }

  if (!isValid || !link) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-red-500/30 rounded-lg p-8 text-center">
            <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Invalid Link</h1>
            <p className="text-gray-400 mb-4">
              This sign-up invitation is either invalid or has expired.
            </p>
            <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-300 text-sm">
                Secret links expire after 15 minutes for security purposes.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="bg-gray-800/50 backdrop-blur-sm border border-green-500/30 rounded-lg p-8 text-center glow">
          <CheckCircle className="w-16 h-16 text-green-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Granted</h1>
          <p className="text-gray-400 mb-6">
            You have successfully accessed this secret link!
          </p>

          {/* Link Info */}
          <div className="bg-gray-900/50 rounded-lg p-4 mb-6 text-left">
            <div className="flex items-center justify-between mb-3">
              <span className="text-gray-400 text-sm">Link ID:</span>
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

          {/* Secret Content */}
          {/* Sign-up Form */}
          <div className="bg-gradient-to-r from-blue-900/50 to-purple-900/50 border border-blue-500/30 rounded-lg p-6">
            <Shield className="w-8 h-8 text-blue-400 mx-auto mb-3" />
            <h2 className="text-lg font-semibold text-white mb-4">Join Clutch Platform</h2>
            <p className="text-gray-300 text-sm mb-6">
              You've been invited to join Clutch! This exclusive sign-up link expires in {timeRemaining}.
            </p>
            
            <form className="space-y-4">
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Full Name</label>
                <input
                  type="text"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your full name"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Email Address</label>
                <input
                  type="email"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Enter your email"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Create a password"
                  required
                />
              </div>
              
              <div>
                <label className="block text-gray-300 text-sm font-medium mb-2">Confirm Password</label>
                <input
                  type="password"
                  className="w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Confirm your password"
                  required
                />
              </div>
              
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors glow"
              >
                Create Account
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
              ⚠️ This link will expire automatically. Do not share this URL with anyone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}