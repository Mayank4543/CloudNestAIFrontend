'use client';

import React, { useState } from 'react';
import Link from 'next/link';


interface DocSection {
    id: string;
    title: string;
    icon: React.ReactElement;
    content: React.ReactElement;
}

const DocsPage: React.FC = () => {
    const [activeSection, setActiveSection] = useState('getting-started');

    const docSections: DocSection[] = [
        {
            id: 'getting-started',
            title: 'Getting Started',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to CloudNest AI</h2>
                        <p className="text-gray-600 mb-6">
                            CloudNest AI is an intelligent cloud storage platform that combines secure file management with AI-powered features.
                            Get started in minutes with our intuitive interface and powerful capabilities.
                        </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Quick Start Guide</h3>
                        <ol className="list-decimal list-inside space-y-2 text-blue-800">
                            <li>Sign in with your Google account</li>
                            <li>Upload your first file via drag & drop</li>
                            <li>Explore AI-powered search and tagging</li>
                            <li>Organize files with partitions and tags</li>
                        </ol>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Upload Files</h4>
                            <p className="text-gray-600 text-sm mb-3">
                                Start by uploading your files using our intuitive drag & drop interface.
                            </p>
                            <Link href="/upload" className="text-[#18b26f] hover:text-[#149d5f] text-sm font-medium">
                                Go to Upload →
                            </Link>
                        </div>
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h4 className="font-semibold text-gray-900 mb-2">Manage Files</h4>
                            <p className="text-gray-600 text-sm mb-3">
                                Access your dashboard to organize, search, and manage all your files.
                            </p>
                            <Link href="/dashboard" className="text-[#18b26f] hover:text-[#149d5f] text-sm font-medium">
                                Go to Dashboard →
                            </Link>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'file-management',
            title: 'File Management',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">File Management</h2>
                        <p className="text-gray-600 mb-6">
                            CloudNest AI provides Google Drive-style file management with advanced organization features and secure access controls.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                                </svg>
                                File Upload
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Drag & drop multiple files</li>
                                <li>• Support for all common file types (PDF, DOCX, images, videos, etc.)</li>
                                <li>• Automatic file type detection</li>
                                <li>• Progress tracking for large uploads</li>
                                <li>• AI-powered automatic tagging</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" />
                                </svg>
                                Organization
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Custom tags for easy categorization</li>
                                <li>• Storage partitions (Personal, Work, Custom)</li>
                                <li>• Grid and list view modes</li>
                                <li>• Sort by name, date, or size</li>
                                <li>• Advanced filtering options</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                Security & Sharing
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Private by default</li>
                                <li>• Public sharing with link access</li>
                                <li>• Owner-based access control</li>
                                <li>• Secure file download URLs</li>
                                <li>• AI-powered sensitive data detection</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'ai-features',
            title: 'AI Features',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">AI-Powered Features</h2>
                        <p className="text-gray-600 mb-6">
                            CloudNest AI leverages artificial intelligence to enhance your file management experience with smart automation and insights.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
                                </svg>
                                Auto-Tagging
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                AI analyzes file content and automatically suggests relevant tags for better organization.
                            </p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Content-based tag generation</li>
                                <li>• Interactive tag selection</li>
                                <li>• Combined user and AI tags</li>
                                <li>• Supports text, documents, and images</li>
                            </ul>
                            <Link href="/ai-tagging-demo" className="inline-block mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium">
                                Try AI Tagging Demo →
                            </Link>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                Semantic Search
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                Find files by content meaning, not just keywords. Search using natural language.
                            </p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Natural language search queries</li>
                                <li>• Content-based file discovery</li>
                                <li>• Advanced search algorithms</li>
                                <li>• Context-aware results</li>
                            </ul>
                            <Link href="/search-demo" className="inline-block mt-2 text-purple-600 hover:text-purple-800 text-sm font-medium">
                                Try Search Demo →
                            </Link>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Sensitive Data Detection
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                Automatically scan files for sensitive information before sharing publicly.
                            </p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Detects credit cards, SSNs, passwords</li>
                                <li>• AI-powered content analysis</li>
                                <li>• Risk level assessment</li>
                                <li>• Smart sharing recommendations</li>
                            </ul>
                            <Link href="/sensitive-scan-demo" className="inline-block mt-2 text-red-600 hover:text-red-800 text-sm font-medium">
                                Try Sensitive Scan Demo →
                            </Link>
                        </div>
                    </div>
                </div>
            )
        },
        {
            id: 'storage-partitions',
            title: 'Storage Partitions',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Storage Partitions</h2>
                        <p className="text-gray-600 mb-6">
                            Organize your files into logical partitions with separate quotas and access controls, similar to Google Drive folders but with advanced features.
                        </p>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h3 className="font-semibold text-green-900 mb-2">Default Partitions</h3>
                        <p className="text-green-800 text-sm">
                            Every user gets Personal and Work partitions by default. Create custom partitions for specific projects or categories.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                Partition Management
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Create unlimited custom partitions</li>
                                <li>• Set individual storage quotas</li>
                                <li>• Visual usage indicators</li>
                                <li>• Edit and delete partitions</li>
                                <li>• Real-time usage tracking</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                Upload Integration
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Select partition during upload</li>
                                <li>• Automatic quota enforcement</li>
                                <li>• Smart partition suggestions</li>
                                <li>• Batch upload to different partitions</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-[#18b26f]" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Dashboard Filtering
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Filter files by partition</li>
                                <li>• Partition-specific views</li>
                                <li>• Quick partition switching</li>
                                <li>• Combined or isolated browsing</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">Quota Management</h3>
                        <p className="text-yellow-800 text-sm">
                            Partitions have individual storage quotas with visual warnings at 80%, 95%, and 100% usage.
                            Upload is automatically blocked when quota is exceeded.
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'search',
            title: 'Search & Discovery',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Search & Discovery</h2>
                        <p className="text-gray-600 mb-6">
                            CloudNest AI offers multiple search methods to help you find files quickly, from traditional keyword search to AI-powered semantic understanding.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                Keyword Search
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                Traditional search by filename, file type, and metadata with advanced filtering options.
                            </p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Search by filename and tags</li>
                                <li>• Filter by file type and date</li>
                                <li>• Sort results by relevance</li>
                                <li>• Real-time search suggestions</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.243 3.03a1 1 0 01.727 1.213L9.53 6h2.94l.56-2.243a1 1 0 111.94.486L14.53 6H17a1 1 0 110 2h-2.97l-1 4H15a1 1 0 110 2h-2.47l-.56 2.242a1 1 0 11-1.94-.485L10.47 14H7.53l-.56 2.242a1 1 0 11-1.94-.485L5.47 14H3a1 1 0 110-2h2.97l1-4H5a1 1 0 110-2h2.47l.56-2.243a1 1 0 011.213-.727zM9.03 8l-1 4h2.94l1-4H9.03z" clipRule="evenodd" />
                                </svg>
                                Semantic Search
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                AI-powered search that understands content meaning and context for more accurate results.
                            </p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Natural language queries</li>
                                <li>• Content-based matching</li>
                                <li>• Contextual understanding</li>
                                <li>• Concept-based discovery</li>
                            </ul>
                            <div className="mt-2 p-2 bg-purple-50 rounded text-sm">
                                <strong>Example:</strong> &quot;financial reports from last quarter&quot; finds relevant documents by content&ldquo; not just filename.
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Advanced Filters
                            </h3>
                            <p className="text-gray-600 text-sm mb-2">
                                Combine multiple search criteria for precise file discovery.
                            </p>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• File type filters (documents, images, videos)</li>
                                <li>• Date range selection</li>
                                <li>• Size-based filtering</li>
                                <li>• Tag-based categorization</li>
                                <li>• Partition-specific search</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Search Tips</h3>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>• Use quotation marks for exact phrases</li>
                            <li>• Try natural language for semantic search</li>
                            <li>• Combine filters for precise results</li>
                            <li>• Use tags for better organization and discovery</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'security',
            title: 'Security & Privacy',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Security & Privacy</h2>
                        <p className="text-gray-600 mb-6">
                            CloudNest AI prioritizes your data security and privacy with enterprise-grade protection and intelligent safeguards.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Authentication
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Google OAuth integration</li>
                                <li>• JWT token-based sessions</li>
                                <li>• Automatic session management</li>
                                <li>• Secure logout functionality</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                </svg>
                                File Access Control
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Private by default</li>
                                <li>• Owner-based permissions</li>
                                <li>• Secure public sharing</li>
                                <li>• Presigned download URLs</li>
                                <li>• Time-limited access tokens</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                AI Privacy Protection
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Sensitive data detection before sharing</li>
                                <li>• Credit card and SSN pattern recognition</li>
                                <li>• AI-powered content analysis</li>
                                <li>• Risk level assessment</li>
                                <li>• Smart sharing recommendations</li>
                            </ul>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                </svg>
                                Data Storage
                            </h3>
                            <ul className="text-gray-600 text-sm space-y-1">
                                <li>• Cloudflare R2 secure storage</li>
                                <li>• Encrypted file transmission</li>
                                <li>• Geographic data distribution</li>
                                <li>• Regular security audits</li>
                                <li>• GDPR compliance ready</li>
                            </ul>
                        </div>
                    </div>

                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h3 className="font-semibold text-red-900 mb-2">Privacy Best Practices</h3>
                        <ul className="text-red-800 text-sm space-y-1">
                            <li>• Keep sensitive files private by default</li>
                            <li>• Use AI scanning before public sharing</li>
                            <li>• Regularly review your shared files</li>
                            <li>• Enable two-factor authentication when available</li>
                            <li>• Monitor file access patterns</li>
                        </ul>
                    </div>
                </div>
            )
        },
        {
            id: 'api',
            title: 'API Reference',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">API Reference</h2>
                        <p className="text-gray-600 mb-6">
                            CloudNest AI provides a comprehensive REST API for developers to integrate file management features into their applications.
                        </p>
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Base URL</h3>
                        <code className="text-sm bg-gray-100 px-2 py-1 rounded">https://api.cloudnest.ai</code>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Authentication Endpoints
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">POST</span>
                                    <code>/api/auth/google</code>
                                    <span className="ml-auto text-gray-600">Google OAuth login</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">POST</span>
                                    <code>/api/auth/logout</code>
                                    <span className="ml-auto text-gray-600">User logout</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 font-mono">GET</span>
                                    <code>/api/auth/profile</code>
                                    <span className="ml-auto text-gray-600">Get user profile</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2v8h12V6H4z" clipRule="evenodd" />
                                </svg>
                                File Management Endpoints
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 font-mono">GET</span>
                                    <code>/api/files</code>
                                    <span className="ml-auto text-gray-600">List user files</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">POST</span>
                                    <code>/api/files/upload</code>
                                    <span className="ml-auto text-gray-600">Upload new file</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 font-mono">GET</span>
                                    <code>/api/files/:id</code>
                                    <span className="ml-auto text-gray-600">Get file details</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded mr-2 font-mono">PUT</span>
                                    <code>/api/files/:id</code>
                                    <span className="ml-auto text-gray-600">Update file metadata</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-red-100 text-red-800 px-2 py-1 rounded mr-2 font-mono">DEL</span>
                                    <code>/api/files/:id</code>
                                    <span className="ml-auto text-gray-600">Delete file</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                </svg>
                                Search Endpoints
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 font-mono">GET</span>
                                    <code>/api/search/keyword</code>
                                    <span className="ml-auto text-gray-600">Keyword-based search</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded mr-2 font-mono">GET</span>
                                    <code>/api/search/semantic</code>
                                    <span className="ml-auto text-gray-600">AI semantic search</span>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-indigo-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                                </svg>
                                AI Features Endpoints
                            </h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">POST</span>
                                    <code>/api/files/test-ai-tagging</code>
                                    <span className="ml-auto text-gray-600">Generate AI tags</span>
                                </div>
                                <div className="flex">
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded mr-2 font-mono">POST</span>
                                    <code>/api/files/:id/scan-sensitive</code>
                                    <span className="ml-auto text-gray-600">Scan for sensitive data</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h3 className="font-semibold text-yellow-900 mb-2">Authentication Required</h3>
                        <p className="text-yellow-800 text-sm">
                            All API endpoints require a valid JWT token in the Authorization header:
                            <code className="bg-yellow-100 px-1 rounded">Bearer &lt;token&gt;</code>
                        </p>
                    </div>
                </div>
            )
        },
        {
            id: 'troubleshooting',
            title: 'Troubleshooting',
            icon: (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            content: (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">Troubleshooting</h2>
                        <p className="text-gray-600 mb-6">
                            Common issues and solutions to help you get the most out of CloudNest AI.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Upload Issues
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <strong className="text-sm">File upload fails or gets stuck</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Check your internet connection</li>
                                        <li>• Ensure file size is under the limit</li>
                                        <li>• Try refreshing the page and uploading again</li>
                                        <li>• Clear browser cache and cookies</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-sm">Quota exceeded error</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Check partition usage in dashboard</li>
                                        <li>• Delete unnecessary files or increase quota</li>
                                        <li>• Try uploading to a different partition</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                </svg>
                                Search Problems
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <strong className="text-sm">Search returns no results</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Try different search terms or phrases</li>
                                        <li>• Check spelling and try synonyms</li>
                                        <li>• Use semantic search for content-based queries</li>
                                        <li>• Clear filters and try again</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-sm">AI features not working</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Ensure stable internet connection</li>
                                        <li>• Wait a moment and try again</li>
                                        <li>• Check if file contains extractable text</li>
                                        <li>• Contact support if issue persists</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Login & Authentication
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <strong className="text-sm">Can&apos;t sign in with Google</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Disable popup blockers</li>
                                        <li>• Clear browser cache and cookies</li>
                                        <li>• Try a different browser</li>
                                        <li>• Ensure third-party cookies are enabled</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-sm">Session expires frequently</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• This is normal for security</li>
                                        <li>• Simply sign in again when prompted</li>
                                        <li>• Keep your browser updated</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        <div className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                                <svg className="w-4 h-4 mr-2 text-purple-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                                </svg>
                                Performance Issues
                            </h3>
                            <div className="space-y-2">
                                <div>
                                    <strong className="text-sm">Slow loading times</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Check your internet connection speed</li>
                                        <li>• Close unnecessary browser tabs</li>
                                        <li>• Clear browser cache</li>
                                        <li>• Try using a different network</li>
                                    </ul>
                                </div>
                                <div>
                                    <strong className="text-sm">Mobile experience issues</strong>
                                    <ul className="text-gray-600 text-sm mt-1 ml-4 space-y-1">
                                        <li>• Use latest version of your mobile browser</li>
                                        <li>• Enable JavaScript and cookies</li>
                                        <li>• Try rotating device orientation</li>
                                        <li>• Consider using desktop for complex operations</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="font-semibold text-blue-900 mb-2">Still Need Help?</h3>
                        <p className="text-blue-800 text-sm mb-3">
                            If you&apos;re still experiencing issues, here are additional resources:
                        </p>
                        <ul className="text-blue-800 text-sm space-y-1">
                            <li>• Check browser console for error messages</li>
                            <li>• Try the same action in an incognito/private window</li>
                            <li>• Contact support with specific error details</li>
                            <li>• Include browser version and operating system info</li>
                        </ul>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50">

            <div className="container mx-auto px-4 py-8 max-w-6xl">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Sidebar Navigation */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8">
                            <nav className="space-y-1">
                                {docSections.map((section) => (
                                    <button
                                        key={section.id}
                                        onClick={() => setActiveSection(section.id)}
                                        className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center ${activeSection === section.id
                                            ? 'bg-[#18b26f] text-white'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                            }`}
                                    >
                                        {section.icon}
                                        <span className="ml-2">{section.title}</span>
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </div>

                    {/* Main Content */}
                    <div className="lg:col-span-3">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            {docSections.find(section => section.id === activeSection)?.content}
                        </div>
                    </div>
                </div>
            </div>



        </div>
    );
};

export default DocsPage;