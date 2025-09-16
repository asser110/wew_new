'use client';

import React, { useState, useEffect } from 'react';
import { LogIn } from 'lucide-react';
import LoginPage from '@/components/LoginPage';

export default function Home() {
  const [showLogin, setShowLogin] = useState(false);
  const [topLeftText, setTopLeftText] = useState('');
  const [centerText, setCenterText] = useState('');
  const [showButton, setShowButton] = useState(false);
  const [showTopCursor, setShowTopCursor] = useState(true);
  const [showCenterCursor, setShowCenterCursor] = useState(false);

  const topLeftTarget = 'clutch';
  const centerTarget = 'welcome to clutch';

  useEffect(() => {
    // Top left typing animation
    let topLeftIndex = 0;
    const topLeftInterval = setInterval(() => {
      if (topLeftIndex < topLeftTarget.length) {
        setTopLeftText(topLeftTarget.slice(0, topLeftIndex + 1));
        topLeftIndex++;
      } else {
        clearInterval(topLeftInterval);
        setShowTopCursor(false);
        
        // Start center animation after a short delay
        setTimeout(() => {
          setShowCenterCursor(true);
          let centerIndex = 0;
          const centerInterval = setInterval(() => {
            if (centerIndex < centerTarget.length) {
              setCenterText(centerTarget.slice(0, centerIndex + 1));
              centerIndex++;
            } else {
              clearInterval(centerInterval);
              setShowCenterCursor(false);
              
              // Show button after center text is complete
              setTimeout(() => {
                setShowButton(true);
              }, 500);
            }
          }, 100);
        }, 800);
      }
    }, 150);

    return () => clearInterval(topLeftInterval);
  }, []);

  if (showLogin) {
    return <LoginPage onBack={() => setShowLogin(false)} />;
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
      
      {/* Top left typing animation */}
      <div className="absolute top-8 left-8 z-10">
        <div className="flex items-center">
          <span className="pixel-font text-sm md:text-lg tracking-wider text-white">
            {topLeftText}
          </span>
          {showTopCursor && (
            <span className="ml-2 w-0.5 h-6 md:h-8 bg-white animate-pulse" />
          )}
        </div>
      </div>

      {/* Main content container */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6">
        {/* Center typing animation */}
        <div className="flex flex-col items-center space-y-8">
          <div className="flex items-center justify-center min-h-[80px]">
            <span className="pixel-font text-xl md:text-3xl lg:text-4xl text-center tracking-wide">
              {centerText}
            </span>
            {showCenterCursor && (
              <span className="ml-3 w-1 h-8 md:h-12 lg:h-16 bg-white animate-pulse" />
            )}
          </div>

          {/* Login button with smooth fade-in animation */}
          <div className={`transition-all duration-1000 ease-out transform ${
            showButton 
              ? 'opacity-100 translate-y-0 scale-100' 
              : 'opacity-0 translate-y-8 scale-95'
          }`}>
            <button 
              onClick={() => setShowLogin(true)}
              className="group relative px-8 py-4 bg-transparent border-2 border-white pixel-font text-xs tracking-wider uppercase transition-all duration-300 hover:bg-white hover:text-black hover:shadow-2xl hover:shadow-white/20 active:scale-95"
            >
              {/* Glitch effect on hover */}
              <span className="relative z-10 flex items-center space-x-3">
                <LogIn className="w-5 h-5" />
                <span>Login</span>
              </span>
              
              {/* Animated background fill */}
              <div className="absolute inset-0 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              
              {/* Subtle glow effect */}
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </button>
          </div>
        </div>

        {/* Ambient particles effect */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-white/20 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Subtle corner accents */}
      <div className="absolute top-0 right-0 w-32 h-32 border-t-2 border-r-2 border-white/10" />
      <div className="absolute bottom-0 left-0 w-32 h-32 border-b-2 border-l-2 border-white/10" />
    </div>
  );
}