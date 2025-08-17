'use client';

import React from 'react';
import GlobalSearch from '../../component/common/GlobalSearch';

const SearchDemoPage: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">
                        Global Search Demo
                    </h1>
                    <p className="text-lg text-gray-600">
                        Test the unified global search bar with both keyword and AI search capabilities
                    </p>
                </div>

                {/* Search Bar Demo */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <h2 className="text-2xl font-semibold text-gray-900 mb-6">
                        Global Search Component
                    </h2>
                    <div className="max-w-2xl mx-auto">
                        <GlobalSearch />
                    </div>
                    <div className="mt-6 text-sm text-gray-500 text-center">
                        <p>• Type to search with 500ms debouncing</p>
                        <p>• Toggle between Keyword and AI search modes</p>
                        <p>• Use the 🌐 toggle to include/exclude public files</p>
                        <p>• Results appear in a dropdown overlay</p>
                    </div>
                </div>

                {/* Features Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">Keyword Search</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li>• Traditional text-based search</li>
                            <li>• Searches file names, content, and tags</li>
                            <li>• Fast and precise results</li>
                            <li>• Shows file owner, size, and type</li>
                        </ul>
                    </div>

                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">AI Semantic Search</h3>
                        <ul className="space-y-2 text-gray-600">
                            <li>• Natural language understanding</li>
                            <li>• Context-aware search results</li>
                            <li>• Relevance score percentage</li>
                            <li>• Includes public files toggle</li>
                        </ul>
                    </div>
                </div>

                {/* Usage Instructions */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4">How to Use</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">1. Choose Search Type</h4>
                            <p>Toggle between &quot;Keyword&quot; for exact matches or &quot;AI&quot; for semantic understanding</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">2. Configure Options</h4>
                            <p>Use the 🌐 toggle to include or exclude public files from other users</p>
                        </div>
                        <div>
                            <h4 className="font-medium text-gray-900 mb-2">3. Start Searching</h4>
                            <p>Type your query and results will appear in a dropdown below the search bar</p>
                        </div>
                    </div>
                </div>

                {/* API Integration Info */}
                <div className="bg-blue-50 rounded-lg p-6">
                    <h3 className="text-xl font-semibold text-blue-900 mb-4">API Integration</h3>
                    <p className="text-blue-800 mb-3">
                        This component integrates with your existing CloudNest backend APIs:
                    </p>
                    <ul className="text-blue-700 space-y-1 text-sm">
                        <li>• <code className="bg-blue-100 px-1 rounded">/api/files/search</code> - For keyword search</li>
                        <li>• <code className="bg-blue-100 px-1 rounded">/api/semantic/search</code> - For AI semantic search</li>
                        <li>• Uses existing authentication and error handling</li>
                        <li>• Responsive design for mobile and desktop</li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default SearchDemoPage;
