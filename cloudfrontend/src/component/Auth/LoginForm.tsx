'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function LoginForm() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // For demo purposes, we're using static admin credentials
            // In a real app, this would be an API call
            if (email === 'admin@cloudnest.ai' && password === 'admin123') {
                // Store admin session in localStorage
                localStorage.setItem('adminSession', 'true');
                router.push('/admin');
            } else if (email && password) {
                // Handle regular user login
                // For demo, we'll just redirect to dashboard
                localStorage.setItem('userSession', 'true');
                router.push('/dashboard');
            } else {
                setError('Please enter both email and password');
            }
        } catch (err) {
            setError('Failed to login. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
                <img
                    src="/cloudnest-logo.svg"
                    alt="CloudNest Logo"
                    className="h-20 w-20 mb-4"
                />
                <h2 className="text-2xl font-bold text-center text-gray-800">Login to CloudNest</h2>
            </div>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-[#18b26f] focus:border-[#18b26f]"
                        placeholder="••••••••"
                    />
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center">
                        <input
                            id="remember-me"
                            type="checkbox"
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

            <p className="mt-6 text-center text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link href="/auth/register" className="text-[#18b26f] hover:text-[#149d5f] font-medium">
                    Register here
                </Link>
            </p>

            <div className="mt-4 text-center text-xs text-gray-500">
                <p>Admin access: admin@cloudnest.ai / admin123</p>
            </div>
        </div>
    );
}
