'use client';

import React, { useState } from 'react';
import Link from 'next/link';

interface TopNavbarProps {
    onMenuButtonClick: () => void;
}

const TopNavbar: React.FC<TopNavbarProps> = ({ onMenuButtonClick }) => {
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

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
                        <div className="hidden md:flex md:items-center">
                            <h1 className="text-xl font-normal text-gray-900">My Drive</h1>
                        </div>
                    </div>

                    {/* Search Bar - Center/Right */}
                    <div className="hidden md:flex flex-1 items-center justify-center px-6 lg:px-12 max-w-3xl mx-auto">
                        <div className="w-full relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                className="block w-full pl-12 pr-4 py-2.5 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#18b26f] focus:border-[#18b26f] hover:border-gray-400 transition-all duration-150 bg-gray-50"
                                placeholder="Search in Drive"
                            />
                        </div>
                    </div>

                    {/* Right side controls */}
                    <div className="flex items-center space-x-3">
                        {/* View options */}
                        <button
                            type="button"
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-all duration-150"
                            aria-label="View options"
                        >
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                            </svg>
                        </button>

                        {/* Help */}
                        <button
                            type="button"
                            className="p-2 rounded-full text-gray-500 hover:text-gray-700 hover:bg-gray-100 focus:outline-none transition-all duration-150"
                            aria-label="Help"
                        >
                            <svg
                                className="h-6 w-6"
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </button>

                        {/* User profile dropdown */}
                        <div className="relative">
                            <button
                                type="button"
                                className="flex items-center space-x-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150"
                                id="user-menu"
                                aria-expanded={isUserMenuOpen}
                                onClick={toggleUserMenu}
                            >
                                <div className="h-8 w-8 rounded-full bg-[#18b26f] flex items-center justify-center text-white shadow-sm">
                                    <span className="text-xs font-medium">MU</span>
                                </div>
                                <span className="hidden md:flex text-sm font-medium text-gray-700">Filip Justic</span>
                                <svg
                                    className="hidden md:block h-4 w-4 text-gray-400"
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                            </button>

                            {/* Dropdown menu */}
                            {isUserMenuOpen && (
                                <div
                                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1"
                                    role="menu"
                                    aria-orientation="vertical"
                                    aria-labelledby="user-menu"
                                >
                                    <Link href="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Your Profile</Link>
                                    <Link href="/settings" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Settings</Link>
                                    <Link href="/logout" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">Sign out</Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default TopNavbar;
