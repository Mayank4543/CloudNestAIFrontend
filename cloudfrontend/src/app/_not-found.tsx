import Link from 'next/link';
import Image from 'next/image';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4 py-12">
            <div className="text-center">
                <Image
                    src="/cloudnest-logo.svg"
                    alt="CloudNest Logo"
                    width={100}
                    height={100}
                    className="mx-auto mb-6"
                />
                <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
                <h2 className="text-3xl font-semibold text-gray-800 mb-6">Page Not Found</h2>
                <p className="text-lg text-gray-600 mb-8">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                </p>
                <div className="space-x-4">
                    <Link
                        href="/"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f]"
                    >
                        Go to Homepage
                    </Link>
                    <Link
                        href="/dashboard"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-base font-medium rounded-md shadow-sm text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f]"
                    >
                        Go to Dashboard
                    </Link>
                </div>
            </div>
        </div>
    );
}
