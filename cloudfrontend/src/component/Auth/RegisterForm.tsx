'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Toast from '@/component/common/Toast';

export default function RegisterForm() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState<'success' | 'error'>('success');
    const router = useRouter();

    const showToastMessage = (message: string, type: 'success' | 'error') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Google Sign-In initialization
    useEffect(() => {
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
                    document.getElementById('google-register-btn'),
                    {
                        theme: 'outline',
                        size: 'large',
                        width: '100%',
                        text: 'continue_with'
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
    }, []);

    const handleGoogleResponse = async (response: any) => {
        try {
            setIsLoading(true);

            if (!response.credential) {
                showToastMessage('Google authentication failed', 'error');
                setIsLoading(false);
                return;
            }

            // Send the Google token to your backend
            const apiResponse = await fetch('https://cloudnestaibackend.onrender.com/api/auth/google', {
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
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userSession', 'true');

                // Show success toast
                showToastMessage('Google registration successful! Redirecting...', 'success');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Basic validation
        if (!name || !email || !password || !confirmPassword) {
            showToastMessage('Please fill in all fields', 'error');
            setIsLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            showToastMessage('Passwords do not match', 'error');
            setIsLoading(false);
            return;
        }

        if (password.length < 6) {
            showToastMessage('Password must be at least 6 characters long', 'error');
            setIsLoading(false);
            return;
        }

        try {
            // Call backend API for user registration
            const response = await fetch('https://cloudnestaibackend.onrender.com/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name,
                    email,
                    password,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success && data.data?.token) {
                // Store the token and user session in localStorage
                localStorage.setItem('authToken', data.data.token);
                localStorage.setItem('userSession', 'true');

                // Show success toast
                showToastMessage('Account created successfully! Redirecting...', 'success');
                setIsLoading(false);

                // Redirect to dashboard after showing success message
                setTimeout(() => {
                    router.push('/dashboard');
                }, 1500);
                return;
            } else {
                showToastMessage(data.message || 'Registration failed. Please try again.', 'error');
                setIsLoading(false);
            }
        } catch (err) {
            showToastMessage('Failed to connect to server. Please try again.', 'error');
            console.error('Registration error:', err);
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
                    <img
                        src="/cloudnest-logo.svg"
                        alt="CloudNest Logo"
                        className="h-20 w-20 mb-4"
                    />
                    <h2 className="text-2xl font-bold text-center text-gray-800">Create an Account</h2>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            id="name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-[#18b26f] focus:border-[#18b26f]"
                            placeholder="John Doe"
                        />
                    </div>

                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-[#18b26f] focus:border-[#18b26f]"
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

                    <div>
                        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                            Confirm Password
                        </label>
                        <input
                            id="confirmPassword"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="w-full px-3 py-2 border text-black border-gray-300 rounded-md focus:outline-none focus:ring-[#18b26f] focus:border-[#18b26f]"
                            placeholder="••••••••"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            id="terms"
                            type="checkbox"
                            className="h-4 w-4 text-[#18b26f] border-gray-300 rounded focus:ring-[#18b26f]"
                        />
                        <label htmlFor="terms" className="ml-2 block text-sm text-gray-700">
                            I agree to the <a href="#" className="text-[#18b26f] hover:text-[#149d5f]">Terms of Service</a> and <a href="#" className="text-[#18b26f] hover:text-[#149d5f]">Privacy Policy</a>
                        </label>
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
                                    Creating account...
                                </div>
                            ) : (
                                'Create account'
                            )}
                        </button>
                    </div>
                </form>

                <div className="mt-4">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">Or continue with</span>
                        </div>
                    </div>

                    <div className="mt-3">
                        <div id="google-register-btn" className="w-full flex justify-center"></div>
                    </div>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="text-[#18b26f] hover:text-[#149d5f] font-medium">
                        Sign in here
                    </Link>
                </p>
            </div>
        </>
    );
}
