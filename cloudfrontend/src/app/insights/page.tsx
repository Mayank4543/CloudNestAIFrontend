'use client';

import React, { useState } from 'react';
import DashboardInsightsChart from '@/component/Dashboard/Insights/DashboardInsightsChart';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';

export default function InsightsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <DashboardLayout>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-800">File Insights</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Analytics and statistics for your stored files
                        </p>
                    </div>
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDarkMode
                            ? 'bg-gray-800 text-white hover:bg-gray-700'
                            : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                            }`}
                    >
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
                    <DashboardInsightsChart
                        isDarkMode={isDarkMode}
                        title="File Storage Analytics"
                        description="View statistics and trends about your stored files"
                    />
                </div>
            </div>
        </DashboardLayout>
    );
}
