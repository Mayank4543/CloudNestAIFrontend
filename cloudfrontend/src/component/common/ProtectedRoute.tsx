'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireAuth?: boolean;
    requireAdmin?: boolean;
}

export default function ProtectedRoute({
    children,
    requireAuth = true,
    requireAdmin = false
}: ProtectedRouteProps) {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthorized, setIsAuthorized] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            try {
                // Check for auth token in both localStorage and sessionStorage
                const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                const userSession = localStorage.getItem('userSession') || sessionStorage.getItem('userSession');
                const adminSession = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');

                if (!requireAuth) {
                    setIsAuthorized(true);
                    setIsLoading(false);
                    return;
                }

                if (!authToken || !userSession) {
                    // Not authenticated, redirect to login
                    router.push('/auth/login');
                    return;
                }

                if (requireAdmin && !adminSession) {
                    // Not admin, redirect to dashboard
                    router.push('/dashboard');
                    return;
                }

                // User is authorized
                setIsAuthorized(true);
            } catch (error) {
                console.error('Auth check error:', error);
                router.push('/auth/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [requireAuth, requireAdmin, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#f9fafb]">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#18b26f] rounded-full animate-spin will-change-transform"></div>
                        <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-l-[#18b26f] rounded-full animate-pulse"></div>
                    </div>
                   
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
