'use client';

import React, { useState, useEffect } from 'react';
import { Key, Clock, Copy, Eye, EyeOff, Shield, Link as LinkIcon, Trash2 } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface SecretLink {
  id: string;
  url: string;
  createdAt: Date;
  expiresAt: Date;
  isExpired: boolean;
}

export default function SecretLinkGenerator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [secretLinks, setSecretLinks] = useState<SecretLink[]>([]);
  const [error, setError] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Master password (in production, this should be hashed and stored securely)
  const MASTER_PASSWORD = 'clutch2024!';

  useEffect(() => {
    // Check if already authenticated
    const auth = localStorage.getItem('secretLinkAuth');
    if (auth === 'authenticated') {
      setIsAuthenticated(true);
      loadStoredLinks();
    }

    // Update expired links every second
    const interval = setInterval(() => {
      updateExpiredLinks();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const loadStoredLinks = () => {
    const stored = localStorage.getItem('secretLinks');
    if (stored) {
      const links = JSON.parse(stored).map((link: any) => ({
        ...link,
        createdAt: new Date(link.createdAt),
        expiresAt: new Date(link.expiresAt),
        isExpired: new Date() > new Date(link.expiresAt)
      }));
      setSecretLinks(links);
    }
  };

  const updateExpiredLinks = () => {
    setSecretLinks(prev => 
      prev.map(link => ({
        ...link,
        isExpired: new Date() > link.expiresAt
      }))
    );
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === MASTER_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('secretLinkAuth', 'authenticated');
      loadStoredLinks();
      setError('');
    } else {
      setError('Invalid password');
    }
  };

  const generateSecretLink = () => {
    const id = uuidv4();
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 15 * 60 * 1000); // 15 minutes
    
    const newLink: SecretLink = {
      id,
      url: `${window.location.origin}/secret/${id}`,
      createdAt: now,
      expiresAt,
      isExpired: false
    };

    const updatedLinks = [newLink, ...secretLinks];
    setSecretLinks(updatedLinks);
    
    // Store in localStorage
    localStorage.setItem('secretLinks', JSON.stringify(updatedLinks));
  };

  const copyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const deleteLink = (id: string) => {
    const updatedLinks = secretLinks.filter(link => link.id !== id);
    setSecretLinks(updatedLinks);
    localStorage.setItem('secretLinks', JSON.stringify(updatedLinks));
  };

  const clearExpiredLinks = () => {
    const activeLinks = secretLinks.filter(link => !link.isExpired);
    setSecretLinks(activeLinks);
    localStorage.setItem('secretLinks', JSON.stringify(activeLinks));
  };

  const logout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('secretLinkAuth');
    setPassword('');
  };

  const formatTimeRemaining = (expiresAt: Date) => {
    const now = new Date();
    const diff = expiresAt.getTime() - now.getTime();
    
    if (diff <= 0) return 'Expired';
    
    const minutes = Math.floor(diff / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${minutes}m ${seconds}s`;
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-8 glow">
            <div className="text-center mb-8">
              <Shield className="w-16 h-16 text-blue-400 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-white mb-2">Secret Link Generator</h1>
              <p className="text-gray-400">Enter master password to access</p>
            </div>

            {error && (
              <div className="mb-6 p-3 bg-red-900/50 border border-red-500/50 rounded text-red-300 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-6">
              <div className="relative">
                <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg px-12 py-3 text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                  placeholder="Master password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors glow"
              >
                Access Generator
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <LinkIcon className="w-8 h-8 text-blue-400" />
            <h1 className="text-3xl font-bold text-white">Secret Link Generator</h1>
          </div>
          <button
            onClick={logout}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>

        {/* Generate Button */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6 mb-8 glow">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white mb-2">Generate New Secret Link</h2>
              <p className="text-gray-400">Creates a unique link that expires in 15 minutes</p>
            </div>
            <button
              onClick={generateSecretLink}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors glow flex items-center space-x-2"
            >
              <Key className="w-5 h-5" />
              <span>Generate Link</span>
            </button>
          </div>
        </div>

        {/* Links List */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-blue-500/30 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Generated Links</h2>
            {secretLinks.some(link => link.isExpired) && (
              <button
                onClick={clearExpiredLinks}
                className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear Expired</span>
              </button>
            )}
          </div>

          {secretLinks.length === 0 ? (
            <div className="text-center py-12">
              <Clock className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <p className="text-gray-400">No secret links generated yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {secretLinks.map((link) => (
                <div
                  key={link.id}
                  className={`border rounded-lg p-4 transition-all ${
                    link.isExpired
                      ? 'border-red-500/30 bg-red-900/20'
                      : 'border-green-500/30 bg-green-900/20 pulse-border'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-2">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            link.isExpired ? 'bg-red-500' : 'bg-green-500'
                          }`}
                        />
                        <span className={`font-medium ${
                          link.isExpired ? 'text-red-300' : 'text-green-300'
                        }`}>
                          {link.isExpired ? 'Expired' : 'Active'}
                        </span>
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-400 text-sm">
                          {link.isExpired ? 'Expired' : formatTimeRemaining(link.expiresAt)}
                        </span>
                      </div>
                      <div className="bg-gray-900/50 rounded p-3 font-mono text-sm text-gray-300 break-all">
                        {link.url}
                      </div>
                      <div className="text-xs text-gray-500 mt-2">
                        Created: {link.createdAt.toLocaleString()} | 
                        Expires: {link.expiresAt.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        onClick={() => copyToClipboard(link.url, link.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          copiedId === link.id
                            ? 'bg-green-600 text-white'
                            : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                        }`}
                        title="Copy link"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteLink(link.id)}
                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                        title="Delete link"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800/50 border border-blue-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-blue-400">
              {secretLinks.filter(link => !link.isExpired).length}
            </div>
            <div className="text-gray-400">Active Links</div>
          </div>
          <div className="bg-gray-800/50 border border-red-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-red-400">
              {secretLinks.filter(link => link.isExpired).length}
            </div>
            <div className="text-gray-400">Expired Links</div>
          </div>
          <div className="bg-gray-800/50 border border-green-500/30 rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-green-400">
              {secretLinks.length}
            </div>
            <div className="text-gray-400">Total Generated</div>
          </div>
        </div>
      </div>
    </div>
  );
}