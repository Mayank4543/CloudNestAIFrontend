'use client';

import { usePathname } from 'next/navigation';

const ConditionalFooter = () => {
    const pathname = usePathname();

    // Don't show footer on dashboard routes, auth routes, admin routes
    const hideFooterRoutes = [
        '/dashboard',
        '/auth',
        '/admin',
        '/profile',
        '/upload',
        '/insights',
        '/search'
    ];

    const shouldHideFooter = hideFooterRoutes.some(route => pathname.startsWith(route));

    if (shouldHideFooter) {
        return null;
    }

    return (
        <footer className="bg-white border-t border-gray-200 py-10 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Top Info */}
                <div className="mb-10 text-center">
                    <h3 className="font-semibold text-gray-800 text-xl">CloudNest AI</h3>
                    <p className="text-gray-600 text-sm max-w-md mx-auto mt-2">
                        Intelligent cloud storage solution for all your file management needs.
                    </p>
                </div>

                {/* Links Grid */}
                <div className="grid grid-cols-1  sm:grid-cols-3 gap-12 text-center sm:text-left mb-10">
                    <div>
                        <h3 className="font-semibold text-gray-800 text-base">Features</h3>
                        <div className="w-8 h-0.5 bg-[#18b26f] my-2 mx-auto sm:mx-0"></div>
                        <ul className="space-y-2">
                            <li><a href="/upload" className="text-gray-600 hover:text-[#18b26f] text-sm">File Upload</a></li>
                            <li><a href="/dashboard" className="text-gray-600 hover:text-[#18b26f] text-sm">Dashboard</a></li>
                            <li><a href="/insights" className="text-gray-600 hover:text-[#18b26f] text-sm">AI Insights</a></li>
                            <li><a href="/search" className="text-gray-600 hover:text-[#18b26f] text-sm">Search</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 text-base">Resources</h3>
                        <div className="w-8 h-0.5 bg-[#18b26f] my-2 mx-auto sm:mx-0"></div>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Documentation</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">API Reference</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Support</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Help Center</a></li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-semibold text-gray-800 text-base">Connect</h3>
                        <div className="w-8 h-0.5 bg-[#18b26f] my-2 mx-auto sm:mx-0"></div>
                        <ul className="space-y-2">
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Contact Us</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">Twitter</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">LinkedIn</a></li>
                            <li><a href="#" className="text-gray-600 hover:text-[#18b26f] text-sm">GitHub</a></li>
                        </ul>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="border-t border-gray-200 pt-6 text-center text-sm text-gray-500">
                    <p className="mb-3">© 2025 CloudNest AI. All rights reserved.</p>
                    <div className="flex flex-col sm:flex-row sm:justify-center sm:space-x-6 space-y-2 sm:space-y-0">
                        <a href="#" className="hover:text-[#18b26f]">Terms of Service</a>
                        <a href="#" className="hover:text-[#18b26f]">Privacy Policy</a>
                        <a href="#" className="hover:text-[#18b26f]">Cookie Policy</a>
                    </div>
                </div>
            </div>
        </footer>

    );
};

export default ConditionalFooter;
