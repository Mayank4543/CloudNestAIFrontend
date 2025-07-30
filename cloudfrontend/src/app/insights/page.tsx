'use client';

import React, { useState } from 'react';
import InsightsChart from '@/component/Insights/InsightsChart';
import Link from 'next/link';

export default function InsightsPage() {
    const [isDarkMode, setIsDarkMode] = useState(false);

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">File Insights</h1>
                <div className="flex space-x-4">
                    <button
                        onClick={() => setIsDarkMode(!isDarkMode)}
                        className="px-4 py-2 bg-white text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                    >
                        {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                    <Link
                        href="/"
                        className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                    >
                        Back to Files
                    </Link>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
                <InsightsChart
                    isDarkMode={isDarkMode}
                    title="File Storage Analytics"
                    description="View statistics and trends about your stored files"
                />
            </div>
        </div>
    );
}
