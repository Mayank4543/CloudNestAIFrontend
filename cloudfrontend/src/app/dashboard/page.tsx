'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import GoogleDriveFileItem from '@/component/Dashboard/Files/GoogleDriveFileItem';
import DashboardFileTable from '@/component/Dashboard/Files/DashboardFileTable';
import axios from 'axios';

interface FileData {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    userId: string;
    isPublic: boolean;
    tags: string[];
    createdAt: string;
    updatedAt: string;
    url?: string;
    owner?: {
        name: string;
        email: string;
    };
}

interface PaginationData {
    currentPage: number;
    totalPages: number;
    totalFiles: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    limit: number;
}

interface ApiResponse {
    success: boolean;
    message: string;
    data: FileData[];
    pagination: PaginationData;
}

function DashboardContent() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationData | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoading(true);
                setError(null);

                // Get authentication token
                const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

                if (!authToken) {
                    setError('Authentication required. Please log in first.');
                    return;
                }

                const response = await axios.get<ApiResponse>(
                    `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/`,
                    {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    }
                );

                if (response.data.success) {
                    setFiles(response.data.data);
                    setPagination(response.data.pagination);
                } else {
                    setError(response.data.message || 'Failed to fetch files');
                }
            } catch (err: Error | unknown) {
                console.error('Error fetching files:', err);
                const error = err as { response?: { status?: number } };
                if (error.response?.status === 401) {
                    setError('Session expired. Please log in again.');
                } else {
                    setError('An error occurred while fetching files. Please try again later.');
                }
            } finally {
                setLoading(false);
            }
        };

        fetchFiles();
    }, []);

    // Calculate storage usage
    const calculateStorageUsed = () => {
        if (files.length === 0) return "0 MB";
        const totalBytes = files.reduce((total, file) => total + file.size, 0);
        if (totalBytes < 1048576) return (totalBytes / 1024).toFixed(2) + " KB";
        if (totalBytes < 1073741824) return (totalBytes / 1048576).toFixed(2) + " MB";
        return (totalBytes / 1073741824).toFixed(2) + " GB";
    };

    // Filter and sort files
    const filteredAndSortedFiles = files
        .filter(file =>
            file.originalname.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        .sort((a, b) => {
            let comparison = 0;
            switch (sortBy) {
                case 'name':
                    comparison = a.originalname.localeCompare(b.originalname);
                    break;
                case 'date':
                    comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                    break;
                case 'size':
                    comparison = a.size - b.size;
                    break;
            }
            return sortOrder === 'asc' ? comparison : -comparison;
        });

    // Helper functions are removed since they're not used in this component
    // They are likely used in child components that are imported

    const handleDelete = async (fileId: string, fileName: string) => {
        if (!window.confirm(`Are you sure you want to delete "${fileName}"?`)) {
            return;
        }

        try {
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            if (!authToken) {
                setError('Authentication required. Please log in first.');
                return;
            }

            const response = await axios.delete<ApiResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}`,
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                setFiles(prevFiles => prevFiles.filter(f => f._id !== fileId));
            } else {
                setError('Failed to delete file. Please try again.');
            }
        } catch (err: Error | unknown) {
            console.error('Error deleting file:', err);
            const error = err as { response?: { status?: number } };
            if (error.response?.status === 401) {
                setError('Session expired. Please log in again.');
            } else {
                setError('Failed to delete file. Please try again.');
            }
        }
    };

    const handleDownload = (fileId: string, fileName: string) => {
        const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

        if (!authToken) {
            setError('Authentication required. Please log in first.');
            return;
        }

        // Create a temporary link to download the file
        const downloadUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/download/${fileId}`;
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = fileName;
        link.style.display = 'none';

        // Add authorization header by opening in new window
        window.open(downloadUrl, '_blank');
    };

    const handleRename = async (fileId: string, newName: string) => {
        try {
            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

            if (!authToken) {
                setError('Authentication required. Please log in first.');
                return;
            }

            const response = await axios.patch<ApiResponse>(
                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}`,
                { originalname: newName },
                {
                    headers: {
                        'Authorization': `Bearer ${authToken}`,
                    },
                }
            );

            if (response.data && response.data.success) {
                setFiles(prevFiles =>
                    prevFiles.map(f =>
                        f._id === fileId ? { ...f, originalname: newName } : f
                    )
                );
            } else {
                setError('Failed to rename file. Please try again.');
            }
        } catch (err: Error | unknown) {
            console.error('Error renaming file:', err);
            setError('Failed to rename file. Please try again.');
        }
    };

    const handleCopy = (fileId: string) => {
        // Copy file URL to clipboard
        const fileUrl = `${window.location.origin}/file/${fileId}`;
        navigator.clipboard.writeText(fileUrl).then(() => {
            console.log('File URL copied to clipboard');
        });
    };

    const handleShare = (fileId: string) => {
        // For now, just copy the shareable URL
        const shareUrl = `${window.location.origin}/file/${fileId}`;
        navigator.clipboard.writeText(shareUrl).then(() => {
            console.log('Share URL copied to clipboard');
        });
    };

    const handlePreview = (file: FileData) => {
        // Open file in new tab for preview
        const previewUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/download/${file._id}`;
        window.open(previewUrl, '_blank');
    };

    const handleMove = (fileId: string) => {
        // Placeholder for move functionality
        console.log('Move file functionality not yet implemented for ID:', fileId);
    };

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header with search and controls */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">My Drive</h2>
                        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <span>Total Files: {filteredAndSortedFiles.length}</span>
                            </div>
                            <div className="flex items-center">
                                <span>Storage Used: {calculateStorageUsed()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Search files..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#18b26f] focus:border-[#18b26f] w-full sm:w-64"
                            />
                            <svg className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m21 21-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <a
                            href="/upload"
                            className="inline-flex items-center px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-colors"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Upload
                        </a>
                    </div>
                </div>

                {/* Controls bar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-4 mb-4 sm:mb-0">
                        <div className="flex items-center space-x-2">
                            <label className="text-sm font-medium text-gray-700">Sort by:</label>
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                                className="text-sm bg-white border-0 rounded-lg px-3 py-2 text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18b26f] focus:ring-opacity-50 transition-all cursor-pointer"
                            >
                                <option value="date">Date</option>
                                <option value="name">Name</option>
                                <option value="size">Size</option>
                            </select>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-1 text-gray-500 hover:text-gray-700"
                                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                <svg className={`h-4 w-4 transform ${sortOrder === 'desc' ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 rounded-md ${viewMode === 'list' ? 'bg-[#18b26f] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            title="List view"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-md ${viewMode === 'grid' ? 'bg-[#18b26f] text-white' : 'text-gray-500 hover:text-gray-700'}`}
                            title="Grid view"
                        >
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#18b26f]"></div>
                    </div>
                )}

                {/* Error state */}
                {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && filteredAndSortedFiles.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                        <p className="text-gray-500 mb-6">
                            {searchTerm ? `No files match "${searchTerm}"` : "Upload some files to get started!"}
                        </p>
                        <a
                            href="/upload"
                            className="inline-flex items-center px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f]"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Upload Files
                        </a>
                    </div>
                )}

                {/* Files display */}
                {!loading && !error && filteredAndSortedFiles.length > 0 && (
                    <>
                        {viewMode === 'list' ? (
                            /* List View with Google Drive-like dropdown menu */
                            <DashboardFileTable
                                files={filteredAndSortedFiles}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                onRename={handleRename}
                                onCopy={handleCopy}
                                onShare={handleShare}
                                onPreview={handlePreview}
                                onMove={handleMove}
                            />
                        ) : (
                            /* Grid View */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {filteredAndSortedFiles.map((file) => (
                                    <GoogleDriveFileItem
                                        key={file._id}
                                        file={file}
                                        viewMode="grid"
                                        onDownload={handleDownload}
                                        onDelete={handleDelete}
                                        onRename={handleRename}
                                        onCopy={handleCopy}
                                        onShare={handleShare}
                                        onPreview={handlePreview}
                                        onMove={handleMove}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center space-x-2">
                            <button
                                disabled={!pagination.hasPreviousPage}
                                onClick={async () => {
                                    if (pagination.hasPreviousPage) {
                                        try {
                                            setLoading(true);
                                            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                                            const page = pagination.currentPage - 1;
                                            const response = await axios.get<ApiResponse>(
                                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/?page=${page}`,
                                                {
                                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                                }
                                            );

                                            if (response.data.success) {
                                                setFiles(response.data.data);
                                                setPagination(response.data.pagination);
                                            }
                                        } catch (err) {
                                            console.error('Error fetching previous page:', err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${!pagination.hasPreviousPage
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-[#18b26f] border border-[#18b26f] hover:bg-[#e6f5ee]'
                                    } transition-colors`}
                            >
                                Previous
                            </button>

                            <span className="px-4 py-2 text-sm font-medium text-gray-700">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                disabled={!pagination.hasNextPage}
                                onClick={async () => {
                                    if (pagination.hasNextPage) {
                                        try {
                                            setLoading(true);
                                            const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
                                            const page = pagination.currentPage + 1;
                                            const response = await axios.get<ApiResponse>(
                                                `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/?page=${page}`,
                                                {
                                                    headers: { 'Authorization': `Bearer ${authToken}` }
                                                }
                                            );

                                            if (response.data.success) {
                                                setFiles(response.data.data);
                                                setPagination(response.data.pagination);
                                            }
                                        } catch (err) {
                                            console.error('Error fetching next page:', err);
                                        } finally {
                                            setLoading(false);
                                        }
                                    }
                                }}
                                className={`px-4 py-2 rounded-md text-sm font-medium ${!pagination.hasNextPage
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-[#18b26f] border border-[#18b26f] hover:bg-[#e6f5ee]'
                                    } transition-colors`}
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}

                {/* Storage summary */}
                {!loading && !error && filteredAndSortedFiles.length > 0 && (
                    <div className="mt-8 bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Storage Summary</h3>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Files</div>
                                        <div className="text-2xl font-bold text-gray-900">{filteredAndSortedFiles.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Storage Used</div>
                                        <div className="text-2xl font-bold text-[#18b26f]">{calculateStorageUsed()}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Public Files</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {filteredAndSortedFiles.filter(f => f.isPublic).length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:flex space-x-3">
                                <a
                                    href="/upload"
                                    className="inline-flex items-center px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f]"
                                >
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                    Upload More
                                </a>
                                <a
                                    href="/insights"
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                                >
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                    View Insights
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}

export default function Dashboard() {
    return (
        <ProtectedRoute requireAuth={true}>
            <DashboardContent />
        </ProtectedRoute>
    );
}
