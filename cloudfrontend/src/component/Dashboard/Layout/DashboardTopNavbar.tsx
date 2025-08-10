'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface DashboardTopNavbarProps {
    onMenuButtonClick: () => void;
}

interface UserProfile {
    _id?: string;
    name?: string;
    email?: string;
    picture?: string; // Changed from profilePicture to picture to match API
    profilePicture?: string; // Keep for backward compatibility
    provider?: 'local' | 'google';
}

const DashboardTopNavbar: React.FC<DashboardTopNavbarProps> = ({ onMenuButtonClick }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const router = useRouter();

    useEffect(() => {
        fetchUserProfile();

        // Close user menu when clicking outside
        const handleClickOutside = (event: MouseEvent) => {
            if (isUserMenuOpen && event.target) {
                const userMenuElement = document.getElementById('user-menu-container');
                if (userMenuElement && !userMenuElement.contains(event.target as Node)) {
                    setIsUserMenuOpen(false);
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isUserMenuOpen]);

    const fetchUserProfile = async () => {
        try {
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            if (!authToken) return;

            const response = await fetch('https://cloudnestaibackend.onrender.com/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                const data = await response.json();
                console.log('TopNavbar API response:', data);
                if (data.success && data.data?.user) {
                    console.log('TopNavbar setting user profile:', data.data.user);
                    console.log('TopNavbar picture field:', data.data.user.picture);
                    setUserProfile(data.data.user);
                }
            }
        } catch (error) {
            console.error('Failed to fetch user profile:', error);
        }
    };

    const getOptimizedImageUrl = (imageUrl: string | undefined): string | undefined => {
        if (!imageUrl) return undefined;

        // For Google profile images, try to optimize the URL
        if (imageUrl.includes('googleusercontent.com')) {
            // Remove size parameters and add our own
            const baseUrl = imageUrl.split('=')[0];
            return `${baseUrl}=s100-c`; // s100 for 100px size, c for crop
        }

        return imageUrl;
    };

    const getInitials = (name: string | undefined | null): string => {
        if (!name || typeof name !== 'string' || name.trim() === '') {
            return 'U';
        }
        return name
            .split(' ')
            .map(word => word.charAt(0).toUpperCase())
            .slice(0, 2)
            .join('');
    };

    const handleSignOut = () => {
        localStorage.removeItem('authToken');
        sessionStorage.removeItem('authToken');
        router.push('/auth/login');
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    return (
        <header className="bg-white border-b border-gray-200 shadow-sm z-10 font-['Inter',system-ui,sans-serif]">
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0 flex items-center md:hidden">
                            <button
                                type="button"
                                className="inline-flex items-center justify-center p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#18b26f] transition-all duration-150"
                                onClick={onMenuButtonClick}
                                aria-label="Open sidebar"
                            >
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M4 6h16M4 12h16M4 18h16"
                                    />
                                </svg>
                            </button>
                        </div>

                        <div className="flex items-center flex-1">
                            <div className="max-w-2xl w-full">
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg
                                            className="h-5 w-5 text-gray-400"
                                            xmlns="http://www.w3.org/2000/svg"
                                            viewBox="0 0 20 20"
                                            fill="currentColor"
                                            aria-hidden="true"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                                                clipRule="evenodd"
                                            />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        name="search"
                                        id="search"
                                        className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-full leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:border-[#18b26f] focus:ring-1 focus:ring-[#18b26f] sm:text-sm transition-all duration-150"
                                        placeholder="Search files, folders..."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:ml-4 md:flex-shrink-0 md:flex md:items-center space-x-1">
                            <button
                                className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150"
                                aria-label="Notifications"
                            >
                                <svg
                                    className="h-6 w-6"
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                                    />
                                </svg>
                            </button>

                            <div className="relative" id="user-menu-container">
                                <button
                                    onClick={toggleUserMenu}
                                    type="button"
                                    className="bg-white rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150"
                                    id="user-menu"
                                    aria-expanded="false"
                                    aria-haspopup="true"
                                >
                                    <span className="sr-only">Open user menu</span>
                                    {(userProfile?.picture || userProfile?.profilePicture) ? (
                                        <Image
                                            src={getOptimizedImageUrl(userProfile?.picture || userProfile?.profilePicture) || ''}
                                            alt={`${userProfile.name}'s profile`}
                                            width={36}
                                            height={36}
                                            className="h-9 w-9 rounded-full object-cover"
                                            crossOrigin="anonymous"
                                            referrerPolicy="no-referrer"
                                            onLoad={() => {
                                                console.log('TopNavbar image loaded:', getOptimizedImageUrl(userProfile?.picture || userProfile?.profilePicture));
                                            }}
                                            onError={(e) => {
                                                console.error('TopNavbar image failed to load:', getOptimizedImageUrl(userProfile?.picture || userProfile?.profilePicture));
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.nextElementSibling?.classList.remove('hidden');
                                            }}
                                        />
                                    ) : null}
                                    <div className={`h-9 w-9 rounded-full bg-gradient-to-r from-[#18b26f] to-[#2cc179] flex items-center justify-center text-white font-semibold ${(userProfile?.picture || userProfile?.profilePicture) ? 'hidden' : ''}`}>
                                        {getInitials(userProfile?.name)}
                                    </div>
                                </button>

                                {isUserMenuOpen && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none"
                                        role="menu"
                                        aria-orientation="vertical"
                                        aria-labelledby="user-menu"
                                    >
                                        {/* User Info */}
                                        <div className="px-4 py-3 border-b border-gray-100">
                                            <p className="text-sm font-medium text-gray-900">
                                                {userProfile?.name || 'User'}
                                            </p>
                                            <p className="text-sm text-gray-500 truncate">
                                                {userProfile?.email || 'No email'}
                                            </p>
                                        </div>

                                        <Link
                                            href="/profile"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            role="menuitem"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                                </svg>
                                                Your Profile
                                            </div>
                                        </Link>

                                        <Link
                                            href="/settings"
                                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                                            role="menuitem"
                                            onClick={() => setIsUserMenuOpen(false)}
                                        >
                                            <div className="flex items-center">
                                                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                                </svg>
                                                Settings
                                            </div>
                                        </Link>

                                        <div className="border-t border-gray-100">
                                            <button
                                                onClick={handleSignOut}
                                                className="w-full text-left px-4 py-2 text-sm text-red-700 hover:bg-red-50 transition-colors"
                                                role="menuitem"
                                            >
                                                <div className="flex items-center">
                                                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                                    </svg>
                                                    Sign out
                                                </div>
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default DashboardTopNavbar;
