import React from 'react';

interface LoaderProps {
    fullHeight?: boolean;
    size?: 'small' | 'medium' | 'large';
}

export default function Loader({ fullHeight = false, size = 'medium' }: LoaderProps) {
    // Determine size classes
    const sizeClasses = {
        small: 'h-8 w-8 border-2',
        medium: 'h-12 w-12 border-2',
        large: 'h-16 w-16 border-t-2 border-b-2'
    };

    // Determine container height
    const heightClass = fullHeight ? 'h-screen' : 'h-[50vh]';

    return (
        <div className={`flex justify-center items-center ${heightClass}`}>
            <div className={`animate-spin rounded-full ${sizeClasses[size]} border-blue-500`}></div>
        </div>
    );
}
