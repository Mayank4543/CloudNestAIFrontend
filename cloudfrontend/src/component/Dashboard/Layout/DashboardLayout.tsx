'use client';

import React, { useState } from 'react';
import DashboardSidebar from './DashboardSidebar';
import DashboardTopNavbar from './DashboardTopNavbar';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
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
                <DashboardTopNavbar onMenuButtonClick={toggleSidebar} />

                <main className="flex-1 relative overflow-y-auto focus:outline-none">
                    <div className="py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                            {children}
                        </div>

                        {/* Action buttons at bottom - similar to Foodager reference */}
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150"
                            >
                                Cancel
                            </button>
                            <button
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150"
                            >
                                Save Changes
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
};

export default DashboardLayout;
