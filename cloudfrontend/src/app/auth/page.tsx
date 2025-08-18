'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

const AuthPage: React.FC = () => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Check if user is coming from mobile PWA
    const isMobile = searchParams.get('mobile') === 'true';
    if (isMobile) {
      // Set some indicator that this is a mobile session
      sessionStorage.setItem('mobile-session', 'true');
    }
  }, [searchParams]);

  const handleAuthModeSwitch = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    // Update URL without page reload for better UX
    const currentParams = new URLSearchParams(searchParams.toString());
    router.replace(`/auth/${mode}?${currentParams.toString()}`);
  };

  const isMobileSession = typeof window !== 'undefined' && 
                         (sessionStorage.getItem('mobile-session') === 'true' || 
                          searchParams.get('mobile') === 'true');

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#e6f5ee] to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* App Logo/Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-[#18b26f] rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor" 
              className="w-8 h-8 text-white"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m0 0V10a5 5 0 00-10 0v11.5z" 
              />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">CloudNest AI</h1>
          <p className="text-gray-600 mt-1">Intelligent Cloud Storage</p>
          {isMobileSession && (
            <div className="inline-block bg-[#18b26f] text-white px-3 py-1 rounded-full text-xs font-medium mt-2">
              Mobile App
            </div>
          )}
        </div>

        {/* Auth Mode Selector */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => handleAuthModeSwitch('login')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'login'
                  ? 'bg-white text-[#18b26f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => handleAuthModeSwitch('register')}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                authMode === 'register'
                  ? 'bg-white text-[#18b26f] shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Auth Form Content */}
          <div className="space-y-4">
            {authMode === 'login' ? (
              <>
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  Welcome Back
                </h2>
                <p className="text-gray-600 text-center text-sm">
                  Sign in to access your files and continue your work
                </p>
              </>
            ) : (
              <>
                <h2 className="text-xl font-semibold text-gray-900 text-center">
                  Create Account
                </h2>
                <p className="text-gray-600 text-center text-sm">
                  Join CloudNest AI to start managing your files intelligently
                </p>
              </>
            )}

            {/* Action Buttons */}
            <div className="space-y-3 mt-6">
              <Link
                href={`/auth/${authMode}${isMobileSession ? '?mobile=true' : ''}`}
                className="w-full bg-[#18b26f] text-white py-3 px-4 rounded-md font-medium hover:bg-[#149d5f] transition-colors text-center block"
              >
                {authMode === 'login' ? 'Sign In with Google' : 'Sign Up with Google'}
              </Link>
              
              {!isMobileSession && (
                <Link
                  href="/"
                  className="w-full border border-gray-300 text-gray-700 py-3 px-4 rounded-md font-medium hover:bg-gray-50 transition-colors text-center block"
                >
                  Back to Home
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* App Features for Mobile Users */}
        {isMobileSession && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <h3 className="font-medium text-gray-900 mb-3 text-sm">What you can do:</h3>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Upload & organize files
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                AI-powered search
              </div>
              <div className="flex items-center text-sm text-gray-600">
                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Access from anywhere
              </div>
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-gray-500">
          By continuing, you agree to our Terms of Service and Privacy Policy
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
