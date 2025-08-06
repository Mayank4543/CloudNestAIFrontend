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
        const checkAuth = () => {
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
            setIsLoading(false);
        };

        checkAuth();
    }, [requireAuth, requireAdmin, router]);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18b26f]"></div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null; // Will redirect in useEffect
    }

    return <>{children}</>;
}
