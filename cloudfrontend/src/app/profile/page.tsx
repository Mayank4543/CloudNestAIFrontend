'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';

interface UserProfile {
    _id?: string;
    name?: string;
    email?: string;
    picture?: string; // Changed from profilePicture to picture
    profilePicture?: string; // Keep this for backward compatibility
    provider?: 'local' | 'google';
    createdAt?: string;
    updatedAt?: string;
}

interface ApiResponse {
    success: boolean;
    message?: string;
    data?: {
        user?: UserProfile;
    };
}

function ProfileContent() {
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // Removed unused debugInfo state

    useEffect(() => {


        // Gather debug info
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
        const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');

        // Debug information now logged instead of stored in state
        console.log('Auth Token:', authToken ? 'Present' : 'Missing');
        console.log('User Session:', userSession ? 'Active' : 'Inactive');

        fetchUserProfile();
    }, []);

    const fetchUserProfile = async () => {
        try {
            setLoading(true);
            setError(null);

            // Get auth token from localStorage or sessionStorage
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');


            if (!authToken) {
                setError('No authentication token found');
                setLoading(false);
                return;
            }


            const response = await fetch('https://cloudnestaibackend.onrender.com/api/auth/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });


            const data: ApiResponse = await response.json();


            if (response.ok && data.success && data.data?.user) {
                setProfile(data.data.user);

            } else {
                setError(data.message || `API Error: ${response.status} - Failed to fetch profile`);
                console.error('API error:', data);
            }
        } catch (err) {
            console.error('Profile fetch error:', err);
            setError('Failed to connect to server. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const getOptimizedImageUrl = (imageUrl: string | undefined): string | undefined => {
        if (!imageUrl) return undefined;

        // For Google profile images, try to optimize the URL
        if (imageUrl.includes('googleusercontent.com')) {
            // Remove size parameters and add our own
            const baseUrl = imageUrl.split('=')[0];
            return `${baseUrl}=s200-c`; // s200 for 200px size, c for crop
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

    const formatDate = (dateString: string | undefined | null): string => {
        if (!dateString) return 'Not available';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
        } catch {
            // No need for error parameter
            return 'Invalid date';
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18b26f] mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading your profile...</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (error) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
                            <p className="font-semibold">Error Loading Profile</p>
                            <p className="text-sm">{error}</p>
                        </div>
                        <button
                            onClick={fetchUserProfile}
                            className="bg-[#18b26f] text-white px-4 py-2 rounded-lg hover:bg-[#149d5f] transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    if (!profile) {
        return (
            <DashboardLayout>
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <p className="text-gray-600">No profile data found</p>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto p-6">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
                            <p className="text-gray-600">Manage your account information and preferences</p>
                        </div>
                        <button
                            onClick={fetchUserProfile}
                            className="bg-[#18b26f] text-white px-4 py-2 rounded-lg hover:bg-[#149d5f] transition-colors text-sm"
                        >
                            Refresh Profile
                        </button>
                    </div>
                </div>




                {/* Profile Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-gradient-to-r from-[#18b26f] to-[#149d5f] h-32"></div>

                    <div className="relative px-6 pb-6">
                        {/* Profile Picture */}
                        <div className="flex justify-center -mt-16 mb-4">
                            <div className="relative">
                                {(profile.picture || profile.profilePicture) ? (
                                    <Image
                                        src={getOptimizedImageUrl(profile.picture || profile.profilePicture) || ''}
                                        alt={`${profile.name}'s profile`}
                                        className="w-24 h-24 rounded-full border-4 border-white shadow-lg object-cover"
                                        width={96}
                                        height={96}
                                        priority
                                        crossOrigin="anonymous"
                                        referrerPolicy="no-referrer"

                                        onError={(e) => {
                                            // Fallback to initials if image fails to load
                                            console.error('Profile image failed to load:', getOptimizedImageUrl(profile.picture || profile.profilePicture));
                                            const target = e.target as HTMLImageElement;
                                            target.style.display = 'none';
                                            target.nextElementSibling?.classList.remove('hidden');
                                        }}
                                    />
                                ) : null}

                                {/* Fallback Avatar with Initials */}
                                <div className={`w-24 h-24 rounded-full border-4 border-white shadow-lg bg-[#18b26f] flex items-center justify-center ${(profile.picture || profile.profilePicture) ? 'hidden' : ''}`}>
                                    <span className="text-white text-xl font-bold">
                                        {getInitials(profile.name)}
                                    </span>
                                </div>

                                {/* Debug info */}
                                <div className="absolute top-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded">
                                    {(profile.picture || profile.profilePicture) ? 'IMG' : 'INIT'}
                                </div>
                            </div>
                        </div>

                        {/* User Info */}
                        <div className="text-center mb-8">
                            <h2 className="text-2xl font-bold text-gray-900 mb-2">{profile.name || 'User'}</h2>
                            <p className="text-gray-600 mb-2">{profile.email || 'No email provided'}</p>
                            {profile.provider && (
                                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                    {profile.provider === 'google' ? (
                                        <>
                                            <svg className="w-3 h-3 mr-1" viewBox="0 0 24 24">
                                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                                            </svg>
                                            Google Account
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-6-3a2 2 0 11-4 0 2 2 0 014 0zm-2 4a5 5 0 00-4.546 2.916A5.986 5.986 0 0010 16a5.986 5.986 0 004.546-2.084A5 5 0 0010 11z" clipRule="evenodd" />
                                            </svg>
                                            Local Account
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Account Details */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Account Created</h3>
                                    <p className="text-gray-900">{formatDate(profile.createdAt)}</p>
                                </div>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="text-sm font-semibold text-gray-700 mb-2">Last Updated</h3>
                                    <p className="text-gray-900">{formatDate(profile.updatedAt)}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex justify-center space-x-4 pt-4">
                                <button className="bg-[#18b26f] text-white px-6 py-2 rounded-lg hover:bg-[#149d5f] transition-colors">
                                    Edit Profile
                                </button>
                                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                                    Change Password
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Temporary Debug Panel */}
                {profile && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="text-sm font-semibold text-yellow-800 mb-2">Debug - Profile Data:</h3>
                        <div className="text-xs text-yellow-700 space-y-1">
                            <p><strong>Name:</strong> {JSON.stringify(profile.name)}</p>
                            <p><strong>Email:</strong> {JSON.stringify(profile.email)}</p>
                            <p><strong>Picture:</strong> {JSON.stringify(profile.picture)}</p>
                            <p><strong>ProfilePicture:</strong> {JSON.stringify(profile.profilePicture)}</p>
                            <p><strong>Provider:</strong> {JSON.stringify(profile.provider)}</p>
                            <p><strong>Has Picture:</strong> {!!(profile.picture || profile.profilePicture)}</p>
                            <p><strong>Original URL:</strong> {profile.picture || profile.profilePicture || 'None'}</p>
                            <p><strong>Optimized URL:</strong> {getOptimizedImageUrl(profile.picture || profile.profilePicture) || 'None'}</p>
                        </div>
                    </div>
                )}

                {/* Additional Settings */}
                {/* <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Settings</h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">Email Notifications</h4>
                                <p className="text-sm text-gray-600">Receive notifications about your account activity</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" defaultChecked />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#18b26f]/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#18b26f]"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-gray-900">Two-Factor Authentication</h4>
                                <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                            </div>
                            <button className="text-[#18b26f] hover:text-[#149d5f] font-medium text-sm">
                                Setup
                            </button>
                        </div>
                    </div>
                </div> */}
            </div>
        </DashboardLayout>
    );
}

export default function Profile() {
    return (
        <ProtectedRoute requireAuth={true}>
            <ProfileContent />
        </ProtectedRoute>
    );
}
