'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import Toast from '@/component/common/Toast';

// API Base URL from environment variables
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ;

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    // Removed unused error and success states
    const [rememberMe, setRememberMe] = useState(false);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const router = useRouter();
    const searchParams = useSearchParams();

    // Check if this is a mobile session
    const isMobileSession = searchParams.get('mobile') === 'true';

    const showToastMessage = useCallback((message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    }, []);

    // Google Sign-In initialization
    useEffect(() => {
        // Define handleGoogleResponse inside useEffect to avoid dependency issue
        const handleGoogleResponse = async (response: Record<string, unknown>) => {
            try {
                setIsLoading(true);

                if (!response.credential) {
                    showToastMessage('Google authentication failed', 'error');
                    setIsLoading(false);
                    return;
                }

                // Send the Google token to your backend
                const apiResponse = await fetch(`${API_BASE_URL}/api/auth/google`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        token: response.credential,
                    }),
                });

                const data = await apiResponse.json();

                if (apiResponse.ok && data.success && data.data?.token) {
                    // Store the token and user session in localStorage
                    const storage = rememberMe ? localStorage : sessionStorage;
                    storage.setItem('authToken', data.data.token);
                    storage.setItem('userSession', 'true');

                    // Store mobile session if applicable
                    if (isMobileSession) {
                        storage.setItem('mobile-session', 'true');
                    }

                    // Show success toast
                    showToastMessage('Google login successful! Redirecting...', 'success');
                    setIsLoading(false);

                    // Redirect to dashboard after showing success message
                    setTimeout(() => {
                        router.push('/dashboard');
                    }, 1500);
                } else {
                    showToastMessage(data.message || 'Google authentication failed', 'error');
                    setIsLoading(false);
                }
            } catch (err) {
                showToastMessage('Failed to authenticate with Google', 'error');
                console.error('Google authentication error:', err);
                setIsLoading(false);
            }
        };

        const initializeGoogleSignIn = () => {
            if (typeof window !== 'undefined' && window.google) {
                window.google.accounts.id.initialize({
                    client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '',
                    callback: handleGoogleResponse,
                    auto_select: false,
                    cancel_on_tap_outside: true
                });

                // Render the Google Sign-In button
                window.google.accounts.id.renderButton(
                    document.getElementById('google-login-btn'),
                    {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                        text: 'signin_with'
                    }
                );
            }
        };

        // Wait for Google script to load
        if (window.google) {
            initializeGoogleSignIn();
        } else {
            const checkGoogleLoaded = setInterval(() => {
                if (window.google) {
                    clearInterval(checkGoogleLoaded);
                    initializeGoogleSignIn();
                }
            }, 100);

            // Cleanup interval after 10 seconds
            setTimeout(() => clearInterval(checkGoogleLoaded), 10000);
        }
    }, [rememberMe, router, showToastMessage, isMobileSession]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Removed references to unused error and success states

        try {
            if (!email || !password) {
                showToastMessage('Please enter both email and password', 'error');
                setIsLoading(false);
                return;
            }



            // Call backend API for authentication
            const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    password,
                }),
            });

            const data = await response.json();


            if (response.ok && data.success && data.data?.token) {


                // Store the token in localStorage or sessionStorage based on remember me
                const storage = rememberMe ? localStorage : sessionStorage;
                storage.setItem('authToken', data.data.token);

                // Store mobile session if applicable
                if (isMobileSession) {
                    storage.setItem('mobile-session', 'true');
                }

                // Show success toast
                showToastMessage('Login successful! Redirecting...', 'success');
                setIsLoading(false);



                // Check if user is admin based on email or response data
                if (email === 'admin@cloudnest.ai' || data.data.user?.role === 'admin') {
                    storage.setItem('adminSession', 'true');

                    // Redirect after showing success message
                    setTimeout(() => {

                        router.push('/admin');
                    }, 1500);
                } else {
                    storage.setItem('userSession', 'true');

                    // Redirect after showing success message
                    setTimeout(() => {

                        router.push('/dashboard');
                    }, 1500);
                }
                return; // Important: return here to prevent further execution
            } else {

                showToastMessage(data.message || 'Invalid email or password', 'error');
                setIsLoading(false);
            }
        } catch (err) {
            console.error('Login error:', err);
            showToastMessage('Failed to connect to server. Please try again.', 'error');
            setIsLoading(false);
        }
    };

    return (
        <>
            <Toast
                message={toastMessage}
                type={toastType}
                show={showToast}
                onHide={() => setShowToast(false)}
            />
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <Image
                        src="/cloudnest-logo.svg"
                        alt="CloudNest Logo"
                        width={80}
                        height={80}
                        className="h-20 w-20 mb-4"
                    />
                    <h2 className="text-2xl font-bold text-center text-gray-800">Login to CloudNest</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#18b26f] focus:border-[#18b26f]"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-[#18b26f] focus:border-[#18b26f]"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-[#18b26f] border-gray-300 rounded focus:ring-[#18b26f]"
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                                Remember me
                            </label>
                        </div>
                        <div className="text-sm">
                            <a href="#" className="text-[#18b26f] hover:text-[#149d5f]">
                                Forgot password?
                            </a>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f]"
                        >
                            {isLoading ? (
                                <div className="flex items-center">
                                    <div className="animate-spin mr-2 h-4 w-4 border-t-2 border-b-2 border-white rounded-full"></div>
                                    Signing in...
                                </div>
                            ) : (
                                'Sign in'
                            )}
                        </button>
                    </div>
                </form>
                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div id="google-login-btn" className="w-full flex justify-center"></div>
                    </div>
                </div>                <p className="mt-6 text-center text-sm text-gray-600">
                    Don&apos;t have an account?{' '}
                    <Link
                        href={`/auth/register${isMobileSession ? '?mobile=true' : ''}`}
                        className="text-[#18b26f] hover:text-[#149d5f] font-medium"
                    >
                        Register here
                    </Link>
                </p>

                {!isMobileSession && (
                    <p className="mt-4 text-center text-sm text-gray-600">
                        <Link href="/" className="text-[#18b26f] hover:text-[#149d5f] font-medium">
                            ← Back to Home
                        </Link>
                    </p>
                )}

                <div className="mt-4 text-center text-xs text-gray-500">
                    <p>Admin access: admin@cloudnest.ai / admin123</p>
                </div>
            </div>
        </>
    );
}
