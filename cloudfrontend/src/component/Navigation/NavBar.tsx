'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

const NavBar: React.FC = () => {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Don't show navbar on dashboard pages
    if (pathname.startsWith('/dashboard') || pathname === '/upload' || pathname === '/insights' || pathname === '/search') {
        return null;
    }

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
    };

    const closeMobileMenu = () => {
        setIsMobileMenuOpen(false);
    };
    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <Image
                                src="/cloudnest-logo.svg"
                                alt="CloudNest Logo"
                                className="mr-2"
                                width={40}
                                height={40}
                                priority
                            />
                            <span className="text-xl font-bold text-[#18b26f]">CloudNest</span>
                        </Link>
                    </div>

                    <div className="flex items-center">
                        <div className="hidden md:ml-6 md:flex md:space-x-8">
                            <Link
                                href="/"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Files
                            </Link>

                            <Link
                                href="/upload"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/upload'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Upload
                            </Link>

                            <Link
                                href="/insights"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/insights'
                                    ? 'border-blue-500 text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Insights
                            </Link>

                            <Link
                                href="/admin"
                                className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${pathname === '/admin' || pathname.startsWith('/admin/')
                                    ? 'border-[#18b26f] text-gray-900'
                                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }`}
                            >
                                Admin Console
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center md:hidden">
                        {/* Mobile menu button - could be expanded later with dropdown functionality */}
                        <button
                            type="button"
                            onClick={toggleMobileMenu}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded={isMobileMenuOpen}
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon for menu */}
                            {!isMobileMenuOpen ? (
                                <svg
                                    className="block h-6 w-6"
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
                            ) : (
                                <svg
                                    className="block h-6 w-6"
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
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            )}
                        </button>

                    </div>
                </div>
            </div>


            {/* Mobile menu, show/hide based on menu state */}
            <div className={`md:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
                <div className="pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
                    <Link
                        href="/"
                        onClick={closeMobileMenu}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                    >
                        Files
                    </Link>

                    <Link
                        href="/admin"
                        onClick={closeMobileMenu}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/admin' || pathname.startsWith('/admin/')
                            ? 'bg-[#e6f5ee] border-[#18b26f] text-[#18b26f]'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                    >
                        Admin Console
                    </Link>

                    <Link
                        href="/upload"
                        onClick={closeMobileMenu}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/upload'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                    >
                        Upload
                    </Link>

                    <Link
                        href="/insights"
                        onClick={closeMobileMenu}
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/insights'
                            ? 'bg-blue-50 border-blue-500 text-blue-700'
                            : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                    >
                        Insights
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default NavBar;
