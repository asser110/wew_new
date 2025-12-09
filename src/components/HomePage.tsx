import React, { useState, useEffect } from 'react';
import { LogOut, Users, MessageSquare, Settings, Hash, Volume2, Mic, MicOff, Headphones, User, Crown, Shield } from 'lucide-react';

interface User {
  id: string;
  email: string;
  username: string;
  status: string;
  createdAt: string;
}

interface HomePageProps {
  onLogout: () => void;
}

export default function HomePage({ onLogout }: HomePageProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isDeafened, setIsDeafened] = useState(false);

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    onLogout();
  };

  const channels = [
    { name: 'general', type: 'text', active: true },
    { name: 'random', type: 'text', active: false },
    { name: 'announcements', type: 'text', active: false },
    { name: 'General Voice', type: 'voice', active: false },
    { name: 'Gaming', type: 'voice', active: false },
  ];

  const onlineUsers = [
    { username: 'admin', status: 'online', role: 'owner' },
    { username: 'moderator1', status: 'online', role: 'mod' },
    { username: user?.username || 'user', status: 'online', role: 'member' },
    { username: 'player2', status: 'away', role: 'member' },
    { username: 'gamer123', status: 'busy', role: 'member' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'away': return 'bg-yellow-500';
      case 'busy': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner': return <Crown className="w-3 h-3 text-yellow-400" />;
      case 'mod': return <Shield className="w-3 h-3 text-blue-400" />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex overflow-hidden">
      {/* Server Sidebar */}
      <div className="w-16 bg-gray-900 flex flex-col items-center py-4 space-y-3">
        <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center pixel-font text-xs" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          C
        </div>
        <div className="w-8 h-0.5 bg-gray-600"></div>
        <div className="w-12 h-12 bg-gray-700 hover:bg-gray-600 rounded-lg flex items-center justify-center transition-colors cursor-pointer">
          +
        </div>
      </div>

      {/* Channel Sidebar */}
      <div className="w-60 bg-gray-800 flex flex-col">
        {/* Server Header */}
        <div className="h-16 border-b border-gray-700 flex items-center px-4">
          <h1 className="pixel-font text-sm tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            Clutch Server
          </h1>
        </div>

        {/* Channels */}
        <div className="flex-1 p-4 space-y-4">
          <div>
            <h3 className="pixel-font text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Text Channels
            </h3>
            <div className="space-y-1">
              {channels.filter(c => c.type === 'text').map((channel) => (
                <div
                  key={channel.name}
                  className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer transition-colors ${
                    channel.active ? 'bg-gray-700 text-white' : 'text-gray-400 hover:text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <Hash className="w-4 h-4" />
                  <span className="pixel-font text-xs tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    {channel.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="pixel-font text-xs text-gray-400 uppercase tracking-wider mb-2" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Voice Channels
            </h3>
            <div className="space-y-1">
              {channels.filter(c => c.type === 'voice').map((channel) => (
                <div
                  key={channel.name}
                  className="flex items-center space-x-2 px-2 py-1 rounded cursor-pointer text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-colors"
                >
                  <Volume2 className="w-4 h-4" />
                  <span className="pixel-font text-xs tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    {channel.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* User Panel */}
        <div className="h-16 bg-gray-900 flex items-center justify-between px-4">
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <div className="pixel-font text-xs text-white tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                {user?.username || 'User'}
              </div>
              <div className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                online
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`p-1 rounded hover:bg-gray-700 transition-colors ${isMuted ? 'text-red-400' : 'text-gray-400'}`}
            >
              {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsDeafened(!isDeafened)}
              className={`p-1 rounded hover:bg-gray-700 transition-colors ${isDeafened ? 'text-red-400' : 'text-gray-400'}`}
            >
              <Headphones className="w-4 h-4" />
            </button>
            <button
              onClick={handleLogout}
              className="p-1 rounded hover:bg-gray-700 transition-colors text-gray-400"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Channel Header */}
        <div className="h-16 border-b border-gray-700 flex items-center px-6">
          <Hash className="w-5 h-5 text-gray-400 mr-2" />
          <h2 className="pixel-font text-sm tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
            general
          </h2>
        </div>

        {/* Messages Area */}
        <div className="flex-1 p-6 space-y-4">
          {/* Welcome Message */}
          <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <div className="pixel-font text-sm text-white tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  System
                </div>
                <div className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Today at 12:00 PM
                </div>
              </div>
            </div>
            <div className="pixel-font text-sm text-blue-300 tracking-wider leading-relaxed" style={{ fontFamily: "'Press Start 2P', monospace" }}>
              Welcome to Clutch! 🎮
              <br />
              <br />
              You have successfully joined the server.
              <br />
              Feel free to chat and connect with others!
            </div>
          </div>

          {/* Sample Messages */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="pixel-font text-sm text-white tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    admin
                  </span>
                  <Crown className="w-3 h-3 text-yellow-400" />
                  <span className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Today at 12:05 PM
                  </span>
                </div>
                <div className="pixel-font text-sm text-gray-300 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  Hey everyone! Welcome to the server 👋
                </div>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                <User className="w-4 h-4" />
              </div>
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="pixel-font text-sm text-white tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    gamer123
                  </span>
                  <span className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    Today at 12:10 PM
                  </span>
                </div>
                <div className="pixel-font text-sm text-gray-300 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  This platform looks awesome! 🔥
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Message Input */}
        <div className="p-6">
          <div className="bg-gray-700 rounded-lg px-4 py-3">
            <input
              type="text"
              placeholder="Message #general"
              className="w-full bg-transparent text-white pixel-font text-sm tracking-wider placeholder-gray-400 focus:outline-none"
              style={{ fontFamily: "'Press Start 2P', monospace" }}
            />
          </div>
        </div>
      </div>

      {/* Members Sidebar */}
      <div className="w-60 bg-gray-800 p-4">
        <h3 className="pixel-font text-xs text-gray-400 uppercase tracking-wider mb-4" style={{ fontFamily: "'Press Start 2P', monospace" }}>
          Members — {onlineUsers.length}
        </h3>
        <div className="space-y-2">
          {onlineUsers.map((member) => (
            <div key={member.username} className="flex items-center space-x-3 px-2 py-1 rounded hover:bg-gray-700/50 transition-colors">
              <div className="relative">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4" />
                </div>
                <div className={`absolute -bottom-1 -right-1 w-3 h-3 ${getStatusColor(member.status)} rounded-full border-2 border-gray-800`}></div>
              </div>
              <div className="flex-1">
                <div className="flex items-center space-x-1">
                  <span className="pixel-font text-xs text-white tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                    {member.username}
                  </span>
                  {getRoleIcon(member.role)}
                </div>
                <div className="pixel-font text-xs text-gray-400 tracking-wider" style={{ fontFamily: "'Press Start 2P', monospace" }}>
                  {member.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}