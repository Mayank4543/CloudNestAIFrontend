'use client';

import React from 'react';

interface OptimizedLoaderProps {
    message?: string;
    fullScreen?: boolean;
}

export default function OptimizedLoader({
    message = "Loading...",
    fullScreen = true
}: OptimizedLoaderProps) {
    const containerClass = fullScreen
        ? "fixed inset-0 bg-white bg-opacity-90 backdrop-blur-sm z-50 flex items-center justify-center"
        : "flex items-center justify-center py-8";

    return (
        <div className={containerClass}>
            <div className="text-center">
                {/* Optimized spinner with GPU acceleration */}
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-gray-200 border-t-[#18b26f] rounded-full animate-spin will-change-transform"></div>
                    <div className="absolute inset-0 w-12 h-12 border-4 border-transparent border-l-[#18b26f] rounded-full animate-pulse"></div>
                </div>

                {message && (
                    <p className="mt-4 text-gray-600 text-sm font-medium animate-pulse">
                        {message}
                    </p>
                )}
            </div>
        </div>
    );
}
