'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Admin console page without navbar and footer
export default function AdminPage() {
    const router = useRouter();
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [users, setUsers] = useState([
        { id: 1, name: 'John Doe', email: 'john@example.com', storageUsed: '1.2 GB', lastActive: '2025-08-01' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', storageUsed: '3.4 GB', lastActive: '2025-08-03' },
        { id: 3, name: 'Robert Johnson', email: 'robert@example.com', storageUsed: '0.8 GB', lastActive: '2025-07-29' },
        { id: 4, name: 'Emily Davis', email: 'emily@example.com', storageUsed: '2.1 GB', lastActive: '2025-08-02' },
    ]);
    const [stats, setStats] = useState({
        totalUsers: 423,
        totalFiles: 12567,
        totalStorage: 256, // GB
        activeUsers: 312
    });
    const [activeTab, setActiveTab] = useState('dashboard');

    // Check if user is logged in as admin (static check)
    useEffect(() => {
        // Simulating authentication check
        const checkAuth = () => {
            // Static authentication for now
            const adminSession = localStorage.getItem('adminSession');
            if (adminSession === 'true') {
                setIsAuthenticated(true);
            } else {
                // Redirect to login page if not authenticated
                router.push('/auth/login');
            }
        };

        checkAuth();
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem('adminSession');
        setIsAuthenticated(false);
        router.push('/auth/login');
    };

    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#18b26f]"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex h-screen">
                {/* Sidebar */}
                <div className="w-64 bg-[#18b26f] text-white">
                    <div className="p-4 border-b border-[#149d5f]">
                        <h2 className="text-xl font-bold">CloudNest Admin</h2>
                    </div>
                    <nav className="mt-6">
                        <button
                            onClick={() => setActiveTab('dashboard')}
                            className={`flex items-center px-4 py-3 w-full text-left ${activeTab === 'dashboard' ? 'bg-[#149d5f]' : 'hover:bg-[#149d5f]'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                            Dashboard
                        </button>
                        <button
                            onClick={() => setActiveTab('users')}
                            className={`flex items-center px-4 py-3 w-full text-left ${activeTab === 'users' ? 'bg-[#149d5f]' : 'hover:bg-[#149d5f]'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            Users
                        </button>
                        <button
                            onClick={() => setActiveTab('files')}
                            className={`flex items-center px-4 py-3 w-full text-left ${activeTab === 'files' ? 'bg-[#149d5f]' : 'hover:bg-[#149d5f]'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                            Files
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className={`flex items-center px-4 py-3 w-full text-left ${activeTab === 'settings' ? 'bg-[#149d5f]' : 'hover:bg-[#149d5f]'
                                }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            Settings
                        </button>
                    </nav>
                    <div className="absolute bottom-0 w-64 border-t border-[#149d5f]">
                        <button
                            onClick={handleLogout}
                            className="flex items-center px-4 py-3 w-full text-left hover:bg-[#149d5f]"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                            </svg>
                            Logout
                        </button>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 overflow-auto">
                    {/* Top bar */}
                    <div className="bg-white p-4 shadow-sm flex justify-between items-center">
                        <h1 className="text-xl font-semibold">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
                        <div className="flex items-center">
                            <div className="mr-4 text-sm text-gray-600">Admin User</div>
                            <div className="w-8 h-8 rounded-full bg-[#18b26f] flex items-center justify-center text-white font-medium">
                                A
                            </div>
                        </div>
                    </div>

                    {/* Content based on active tab */}
                    <div className="p-6">
                        {activeTab === 'dashboard' && (
                            <div>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Users</p>
                                                <p className="text-xl font-bold">{stats.totalUsers}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Files</p>
                                                <p className="text-xl font-bold">{stats.totalFiles}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Total Storage</p>
                                                <p className="text-xl font-bold">{stats.totalStorage} GB</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <div className="flex items-center">
                                            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div>
                                                <p className="text-gray-500 text-sm">Active Users</p>
                                                <p className="text-xl font-bold">{stats.activeUsers}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h2 className="text-lg font-semibold mb-4">Recent Activity</h2>
                                        <div className="space-y-4">
                                            <div className="flex items-start">
                                                <div className="p-2 rounded-full bg-blue-100 text-blue-600 mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">New user registered</p>
                                                    <p className="text-xs text-gray-500">2 minutes ago</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="p-2 rounded-full bg-green-100 text-green-600 mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">File uploaded</p>
                                                    <p className="text-xs text-gray-500">10 minutes ago</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="p-2 rounded-full bg-yellow-100 text-yellow-600 mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">Settings updated</p>
                                                    <p className="text-xs text-gray-500">1 hour ago</p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="p-2 rounded-full bg-red-100 text-red-600 mr-3">
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium">File deleted</p>
                                                    <p className="text-xs text-gray-500">3 hours ago</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg shadow p-6">
                                        <h2 className="text-lg font-semibold mb-4">Storage Overview</h2>
                                        <div className="h-64 flex items-center justify-center">
                                            <div className="w-48 h-48 rounded-full border-8 border-gray-200 relative">
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    <div className="text-center">
                                                        <p className="text-3xl font-bold text-[#18b26f]">67%</p>
                                                        <p className="text-sm text-gray-500">Used</p>
                                                    </div>
                                                </div>
                                                <div className="absolute inset-0">
                                                    <div
                                                        className="h-full w-full rounded-full border-8"
                                                        style={{
                                                            clipPath: 'polygon(0 0, 100% 0, 100% 67%, 0 67%)',
                                                            transform: 'rotate(-90deg)',
                                                            borderColor: '#18b26f'
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm mt-4">
                                            <div>
                                                <p className="text-gray-500">Used Storage</p>
                                                <p className="font-medium">171.8 GB</p>
                                            </div>
                                            <div>
                                                <p className="text-gray-500">Total Storage</p>
                                                <p className="font-medium">256 GB</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div>
                                <div className="bg-white rounded-lg shadow overflow-hidden">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h2 className="text-lg font-semibold">User Management</h2>
                                        <button className="px-4 py-2 bg-[#18b26f] text-white rounded-md hover:bg-[#149d5f] transition-colors text-sm">
                                            Add New User
                                        </button>
                                    </div>
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    User
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Email
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Storage Used
                                                </th>
                                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Last Active
                                                </th>
                                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {users.map((user) => (
                                                <tr key={user.id}>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="h-8 w-8 rounded-full bg-[#e6f5ee] flex items-center justify-center text-[#18b26f] font-medium">
                                                                {user.name.split(' ').map(part => part[0]).join('')}
                                                            </div>
                                                            <div className="ml-3">
                                                                <p className="text-sm font-medium text-gray-900">{user.name}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.email}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.storageUsed}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                        {user.lastActive}
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        <button className="text-[#18b26f] hover:text-[#149d5f] mr-3">
                                                            Edit
                                                        </button>
                                                        <button className="text-red-500 hover:text-red-700">
                                                            Delete
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                    <div className="px-6 py-3 flex justify-between items-center bg-gray-50 border-t border-gray-200">
                                        <div className="text-sm text-gray-500">
                                            Showing {users.length} of {stats.totalUsers} users
                                        </div>
                                        <div className="flex">
                                            <button className="px-3 py-1 border border-gray-300 rounded-l-md bg-white text-gray-500 hover:bg-gray-50">
                                                Previous
                                            </button>
                                            <button className="px-3 py-1 border border-gray-300 border-l-0 rounded-r-md bg-white text-gray-500 hover:bg-gray-50">
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'files' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-6">File Management</h2>
                                <p className="text-gray-500">
                                    This section allows you to manage all files uploaded to the platform.
                                </p>
                                <div className="flex justify-center items-center h-64 border-2 border-dashed border-gray-300 rounded-lg mt-6">
                                    <div className="text-center">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                                        </svg>
                                        <h3 className="mt-2 text-sm font-medium text-gray-900">File management</h3>
                                        <p className="mt-1 text-sm text-gray-500">
                                            This feature is currently under development
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-white rounded-lg shadow p-6">
                                <h2 className="text-lg font-semibold mb-6">Admin Settings</h2>

                                <div className="space-y-6">
                                    <div>
                                        <h3 className="text-md font-medium mb-3">System Configuration</h3>
                                        <div className="bg-gray-50 rounded p-4 border border-gray-200">
                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <p className="font-medium text-sm">Enable User Registration</p>
                                                    <p className="text-xs text-gray-500">Allow new users to register for accounts</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#18b26f]"></div>
                                                </label>
                                            </div>

                                            <div className="flex justify-between items-center mb-3">
                                                <div>
                                                    <p className="font-medium text-sm">Email Notifications</p>
                                                    <p className="text-xs text-gray-500">Send system notifications via email</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" value="" className="sr-only peer" defaultChecked />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#18b26f]"></div>
                                                </label>
                                            </div>

                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <p className="font-medium text-sm">Maintenance Mode</p>
                                                    <p className="text-xs text-gray-500">Put the system into maintenance mode</p>
                                                </div>
                                                <label className="relative inline-flex items-center cursor-pointer">
                                                    <input type="checkbox" value="" className="sr-only peer" />
                                                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-100 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#18b26f]"></div>
                                                </label>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="text-md font-medium mb-3">Storage Settings</h3>
                                        <div className="bg-gray-50 rounded p-4 border border-gray-200">
                                            <div className="mb-4">
                                                <label htmlFor="defaultQuota" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Default User Storage Quota (GB)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="defaultQuota"
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#18b26f] focus:border-[#18b26f]"
                                                    defaultValue={10}
                                                />
                                            </div>

                                            <div>
                                                <label htmlFor="maxFileSize" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Maximum File Size (MB)
                                                </label>
                                                <input
                                                    type="number"
                                                    id="maxFileSize"
                                                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-[#18b26f] focus:border-[#18b26f]"
                                                    defaultValue={100}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end space-x-3">
                                        <button className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50">
                                            Cancel
                                        </button>
                                        <button className="px-4 py-2 bg-[#18b26f] text-white rounded-md hover:bg-[#149d5f] transition-colors text-sm">
                                            Save Settings
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
