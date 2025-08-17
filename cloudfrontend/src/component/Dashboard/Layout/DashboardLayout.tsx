'use client';

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNavbar from './DashboardTopNavbar';

interface FileData {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    userId: string;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    url?: string;
    owner?: {
        name: string;
        email: string;
    };
}

interface DashboardLayoutProps {
    children: React.ReactNode;
    onSearchResults?: (results: FileData[], searchType: 'keyword' | 'semantic') => void;
    onClearSearch?: () => void; // Add clear search callback
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children, onSearchResults, onClearSearch }) => {
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const toggleSidebar = () => {
        setSidebarOpen(!sidebarOpen);
    };

    return (
        <div className="h-screen flex overflow-hidden bg-[#f9fafb] font-['Inter',system-ui,sans-serif]">
            {/* Sidebar */}
            <DashboardSidebar isOpen={sidebarOpen} />

            {/* Main content */}
            <div className="flex flex-col w-0 flex-1 overflow-hidden">
                <DashboardTopNavbar onMenuButtonClick={toggleSidebar} onSearchResults={onSearchResults} onClearSearch={onClearSearch} />

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
