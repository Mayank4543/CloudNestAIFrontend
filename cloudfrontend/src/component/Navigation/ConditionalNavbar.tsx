'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import NavBar from './NavBar';

const ConditionalNavbar: React.FC = () => {
    const pathname = usePathname();

    // Don't show main navbar on dashboard-related pages
    const isDashboardPage = pathname.startsWith('/dashboard') ||
        pathname.startsWith('/profile') ||
        pathname.startsWith('/upload') ||
        pathname.startsWith('/insights') ||
        pathname.startsWith('/settings');

    // Don't show navbar on auth pages either
    const isAuthPage = pathname.startsWith('/auth/');

    if (isDashboardPage || isAuthPage) {
        return null;
    }

    return <NavBar />;
};

export default ConditionalNavbar;
