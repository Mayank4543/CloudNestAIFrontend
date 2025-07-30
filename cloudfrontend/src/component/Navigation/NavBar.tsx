'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NavBar: React.FC = () => {
    const pathname = usePathname();

    return (
        <nav className="bg-white shadow-md">
            <div className="container mx-auto px-4">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link href="/" className="flex-shrink-0 flex items-center">
                            <span className="text-xl font-bold text-blue-600">CloudNest</span>
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
                        </div>
                    </div>

                    <div className="flex items-center md:hidden">
                        {/* Mobile menu button - could be expanded later with dropdown functionality */}
                        <button
                            type="button"
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                            aria-expanded="false"
                        >
                            <span className="sr-only">Open main menu</span>
                            {/* Icon for menu */}
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
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile menu, show/hide based on menu state - functionality could be added later */}
            <div className="hidden md:hidden">
                <div className="pt-2 pb-3 space-y-1">
                    <Link
                        href="/"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                    >
                        Files
                    </Link>

                    <Link
                        href="/upload"
                        className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${pathname === '/upload'
                                ? 'bg-blue-50 border-blue-500 text-blue-700'
                                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                            }`}
                    >
                        Upload
                    </Link>

                    <Link
                        href="/insights"
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
