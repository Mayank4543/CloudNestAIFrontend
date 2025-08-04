'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface SidebarProps {
    isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
    const pathname = usePathname();

    const navItems = [
        { name: 'My Drive', href: '/dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { name: 'Recent', href: '/dashboard/recent', icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z' },
        { name: 'Starred', href: '/dashboard/starred', icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
        { name: 'Trash', href: '/dashboard/trash', icon: 'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' },
        { name: 'Upload', href: '/upload', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
        { name: 'Insights', href: '/insights', icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
        { name: 'Settings', href: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' },
    ];

    return (
        <div
            className={`${isOpen ? 'translate-x-0' : '-translate-x-full'
                } fixed z-30 inset-y-0 left-0 w-64 transition duration-300 transform bg-white border-r border-gray-200 md:translate-x-0 md:static md:inset-0 font-['Inter',system-ui,sans-serif]`}
        >
            <div className="flex items-center px-5 h-16">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-[#18b26f] mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
                <span className="text-xl font-medium text-gray-800">CloudNest</span>
            </div>
            <div className="flex flex-col h-full">
                <div className="mt-6 px-4">
                    <a href="/upload" className="flex items-center justify-center w-full px-4 py-2 bg-white border border-gray-300 rounded-full text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150">
                        <svg className="w-5 h-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        New
                    </a>
                </div>
                <div className="mt-6 flex-1 flex flex-col overflow-y-auto">
                    <nav className="flex-1 px-3 space-y-1">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href ||
                                (item.href === '/dashboard' && pathname.startsWith('/dashboard'));
                            return (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-full transition-all duration-150 ${isActive
                                        ? 'bg-[#e6f5ee] text-[#18b26f]'
                                        : 'text-gray-700 hover:bg-gray-100'
                                        }`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <svg
                                        className={`mr-3 h-5 w-5 ${isActive
                                            ? 'text-[#18b26f]'
                                            : 'text-gray-500 group-hover:text-gray-600'
                                            } transition-colors duration-150`}
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
                                            d={item.icon}
                                        />
                                    </svg>
                                    {item.name}
                                </Link>
                            );
                        })}
                    </nav>
                </div>

                <div className="p-3 mt-auto">
                    <div className="py-2 px-3">
                        <div className="flex items-center">
                            <div className="text-xs text-gray-500">Storage</div>
                            <div className="ml-auto text-xs text-gray-500">5 GB of 15 GB used</div>
                        </div>
                        <div className="mt-1 h-2 relative max-w-full rounded-full overflow-hidden bg-gray-200">
                            <div className="absolute h-full bg-[#18b26f]" style={{ width: '33%' }}></div>
                        </div>
                    </div>
                </div>

                <div className="p-3">
                    <div className="flex items-center py-2 px-3 rounded-md hover:bg-gray-100 cursor-pointer transition-all duration-150">
                        <div className="h-8 w-8 rounded-full bg-[#18b26f] flex items-center justify-center text-white">
                            <span className="text-xs font-medium">MU</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-gray-700">My Account</p>
                            <p className="text-xs text-gray-500">Free Plan</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
export default Sidebar;
