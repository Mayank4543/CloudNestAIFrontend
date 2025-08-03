'use client';

import { useEffect } from 'react';

export default function NotFound() {
    // Hide the navbar and footer when this component mounts
    useEffect(() => {
        // Hide navbar and footer
        document.querySelector('nav')?.classList.add('hidden');
        document.querySelector('footer')?.classList.add('hidden');

        // Show them again when component unmounts
        return () => {
            document.querySelector('nav')?.classList.remove('hidden');
            document.querySelector('footer')?.classList.remove('hidden');
        };
    }, []);

    return (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center min-h-screen bg-white">
            <div className="w-40 h-40 relative mb-8">
                <svg viewBox="0 0 24 24" className="w-full h-full text-[#18b26f]" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 14V12M12 8H12.01M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <h1 className="text-5xl font-bold text-gray-900 mb-2">404</h1>
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Page Not Found</h2>
            <p className="text-gray-600 max-w-md text-lg">
                Sorry, we couldn't find the page you're looking for. The page might have been moved or doesn't exist.
            </p>
        </div>
    );
}
