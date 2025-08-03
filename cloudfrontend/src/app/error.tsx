'use client';
import { useEffect } from 'react';
import Link from 'next/link';
export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);

        // Hide navbar and footer
        document.querySelector('nav')?.classList.add('hidden');
        document.querySelector('footer')?.classList.add('hidden');

        // Show them again when component unmounts
        return () => {
            document.querySelector('nav')?.classList.remove('hidden');
            document.querySelector('footer')?.classList.remove('hidden');
        };
    }, [error]);

    return (
        <div className="flex flex-col items-center justify-center min-h-screen py-20 px-4 text-center bg-white">
            <div className="w-32 h-32 relative mb-8 text-red-500">
                <svg viewBox="0 0 24 24" className="w-full h-full" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong!</h2>
            <p className="text-gray-600 mb-6 max-w-md">
                An error occurred while loading this page. Please try again or return to the home page.
            </p>
            <div className="flex space-x-4">
                <button
                    onClick={() => reset()}
                    className="px-4 py-2 bg-[#18b26f] text-white rounded-md hover:bg-[#149d5f] transition-colors"
                >
                    Try again
                </button>
                <Link href="/"
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors"
                >
                    Go back home
                </Link>
            </div>
        </div>
    );
}
