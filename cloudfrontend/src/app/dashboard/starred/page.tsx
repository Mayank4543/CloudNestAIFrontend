'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import GoogleDriveFileItem from '@/component/Dashboard/Files/GoogleDriveFileItem';
import DashboardFileTable from '@/component/Dashboard/Files/DashboardFileTable';
import FilePreviewModal from '@/component/Dashboard/Files/FilePreviewModal';
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
    relevanceScore?: number;
    starred?: boolean;
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

function StarredFilesContent() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [previewFileIndex, setPreviewFileIndex] = useState<number>(-1);

    // Helper function to normalize tags data
    const normalizeTags = (tags: unknown): string[] => {
        if (!tags) return [];

        if (Array.isArray(tags)) {
            return tags.map(tag =>
                typeof tag === 'string' ? tag.replace(/[\[\]"']/g, '').trim() : String(tag).trim()
            ).filter(tag => tag.length > 0);
        }

        if (typeof tags === 'string') {
            try {
                // Try to parse as JSON array
                const parsed = JSON.parse(tags);
                if (Array.isArray(parsed)) {
                    return parsed.map(tag => String(tag).replace(/[\[\]"']/g, '').trim()).filter(tag => tag.length > 0);
                }
                return [String(parsed).replace(/[\[\]"']/g, '').trim()].filter(tag => tag.length > 0);
            } catch {
                // If parsing fails, treat as single tag and clean it
                return [tags.replace(/[\[\]"']/g, '').trim()].filter(tag => tag.length > 0);
            }
        }

        return [];
    };

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
                    // Normalize tags for all files
                    const normalizedFiles = response.data.data.map(file => ({
                        ...file,
                        tags: normalizeTags(file.tags)
                    }));

                    // Load starred files from localStorage
                    const starredFileIds = JSON.parse(localStorage.getItem('starredFiles') || '[]');

                    // Filter and mark files as starred
                    const starredFiles = normalizedFiles
                        .filter(file => starredFileIds.includes(file._id))
                        .map(file => ({
                            ...file,
                            starred: true
                        }));

                    setFiles(starredFiles);
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

        // Listen for file uploads from other tabs/components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'fileUploaded' && e.newValue) {
                // Remove the flag
                localStorage.removeItem('fileUploaded');
                // Refresh the files
                fetchFiles();
            }

            // Also refresh when starredFiles changes
            if (e.key === 'starredFiles') {
                fetchFiles();
            }
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events within the same tab
        const handleFileUpload = () => {
            fetchFiles();
        };

        window.addEventListener('fileUploaded', handleFileUpload);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('fileUploaded', handleFileUpload);
        };
    }, []);

    // Calculate storage usage
    const calculateStorageUsed = () => {
        if (files.length === 0) return "0 MB";
        const totalBytes = files.reduce((total, file) => total + file.size, 0);
        if (totalBytes < 1048576) return (totalBytes / 1024).toFixed(2) + " KB";
        if (totalBytes < 1073741824) return (totalBytes / 1048576).toFixed(2) + " MB";
        return (totalBytes / 1073741824).toFixed(2) + " GB";
    };

    // Sort files
    const sortedFiles = (() => {
        return [...files].sort((a, b) => {
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
    })();

    // Handle file deletion
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

                // Also remove from starred files in localStorage
                const starredFiles = JSON.parse(localStorage.getItem('starredFiles') || '[]');
                const updatedStarredFiles = starredFiles.filter((id: string) => id !== fileId);
                localStorage.setItem('starredFiles', JSON.stringify(updatedStarredFiles));
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

        // Add authorization header by fetching the file first
        fetch(downloadUrl, {
            headers: {
                'Authorization': `Bearer ${authToken}`
            }
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Download failed');
                }
                return response.blob();
            })
            .then(blob => {
                // Create object URL from blob
                const url = window.URL.createObjectURL(blob);
                link.href = url;

                // Append to body, click, and remove
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                // Clean up the object URL
                window.URL.revokeObjectURL(url);
            })
            .catch(error => {
                console.error('Download error:', error);
                setError('Failed to download file. Please try again.');
            });
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

    const handleToggleStar = async (fileId: string) => {
        try {
            // Find the file in state
            const file = files.find(f => f._id === fileId);
            if (!file) return;

            // Toggle the starred state
            const newStarredState = !file.starred;

            // Update the file in state immediately for a responsive UI
            setFiles(prevFiles =>
                prevFiles.map(f =>
                    f._id === fileId ? { ...f, starred: newStarredState } : f
                )
            );

            // If we're unstarring, remove from the list after a brief delay
            if (!newStarredState) {
                setTimeout(() => {
                    setFiles(prevFiles => prevFiles.filter(f => f._id !== fileId));
                }, 300);
            }

            // Store starred files in localStorage
            const starredFiles = JSON.parse(localStorage.getItem('starredFiles') || '[]');
            if (newStarredState) {
                // Add to starred files if not already there
                if (!starredFiles.includes(fileId)) {
                    starredFiles.push(fileId);
                }
            } else {
                // Remove from starred files
                const index = starredFiles.indexOf(fileId);
                if (index > -1) {
                    starredFiles.splice(index, 1);
                }
            }
            localStorage.setItem('starredFiles', JSON.stringify(starredFiles));
        } catch (err) {
            console.error('Error toggling star:', err);
            // Revert the state change on error
            setFiles(prevFiles => [...prevFiles]);
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
        // Find the index of the file in the filtered list
        const fileIndex = sortedFiles.findIndex(f => f._id === file._id);
        setPreviewFile(file);
        setPreviewFileIndex(fileIndex);
        setPreviewModalOpen(true);
    };

    const handleNavigatePreview = (newIndex: number) => {
        if (newIndex >= 0 && newIndex < sortedFiles.length) {
            const newFile = sortedFiles[newIndex];
            setPreviewFile(newFile);
            setPreviewFileIndex(newIndex);
        }
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
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                            <svg className="w-6 h-6 mr-2 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                            </svg>
                            Starred Files
                        </h2>
                        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <span>Total Files: {sortedFiles.length}</span>
                            </div>
                            <div className="flex items-center">
                                <span>Storage Used: {calculateStorageUsed()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 lg:mt-0 hidden md:flex flex-col sm:flex-row gap-3">
                        <a
                            href="/upload"
                            className="inline-flex items-center px-5 py-3 bg-[#18b26f] text-white text-sm font-medium rounded-xl shadow-md hover:shadow-lg 
                                   hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-300
                                   transform hover:-translate-y-0.5"
                        >
                            <svg className="mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                            </svg>
                            Upload
                        </a>
                    </div>
                </div>

                {/* Controls bar */}
                <div className="flex items-center justify-between gap-2 mb-6 p-3 sm:p-5 bg-white rounded-xl shadow-sm border border-gray-100 backdrop-blur-sm overflow-x-auto">
                    <div className="hidden md:flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center whitespace-nowrap">
                                <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-[#18b26f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                                <span className="hidden sm:inline">Sort by:</span>
                                <span className="sm:hidden">Sort:</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                                    className="appearance-none text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 pr-6 sm:pr-8 
                                             text-gray-700 hover:border-[#18b26f]/40 focus:border-[#18b26f] focus:outline-none 
                                             focus:ring-2 focus:ring-[#18b26f]/30 transition-all cursor-pointer shadow-sm min-w-[70px] sm:min-w-[100px]"
                                >
                                    <option value="date">Date</option>
                                    <option value="name">Name</option>
                                    <option value="size">Size</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-1 sm:px-2 pointer-events-none text-gray-500">
                                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                            <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="p-1.5 sm:p-2 text-gray-500 hover:text-[#18b26f] bg-white rounded-lg border border-gray-200 shadow-sm
                                         hover:border-[#18b26f]/40 transition-all duration-300 flex-shrink-0"
                                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                <svg className={`h-3 w-3 sm:h-4 sm:w-4 transform transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Mobile controls */}
                    <div className="flex md:hidden flex-wrap items-center gap-2 flex-shrink-0">
                        <div className="relative">
                            <button
                                onClick={() => document.getElementById('sortDropdown')?.click()}
                                className="flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full border border-geen-200 
                                    hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#18b26f]/20 shadow-sm transition-colors"
                            >
                                <span className="font-medium text-black">Sort: {sortBy.charAt(0).toUpperCase() + sortBy.slice(1)}</span>
                                <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <select
                                id="sortDropdown"
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as 'name' | 'date' | 'size')}
                                className="absolute z-10 text-black  opacity-0 top-0 left-0 w-full h-full cursor-pointer"
                            >
                                <option value="date" >Date</option>
                                <option value="name">Name</option>
                                <option value="size">Size</option>
                            </select>
                        </div>
                    </div>

                    {/* View Mode Controls */}
                    <div className="flex items-center space-x-1 sm:space-x-3 flex-shrink-0">
                        <button
                            onClick={() => setViewMode('list')}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm ${viewMode === 'list'
                                ? 'bg-gradient-to-r from-[#18b26f] to-[#149d5f] text-white shadow-md'
                                : 'bg-white text-gray-500 hover:text-[#18b26f] hover:bg-[#e6f5ee]'
                                }`}
                            title="List view"
                        >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                            </svg>
                        </button>
                        <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 sm:p-2.5 rounded-xl transition-all duration-300 shadow-sm ${viewMode === 'grid'
                                ? 'bg-gradient-to-r from-[#18b26f] to-[#149d5f] text-white shadow-md'
                                : 'bg-white text-gray-500 hover:text-[#18b26f] hover:bg-[#e6f5ee]'
                                }`}
                            title="Grid view"
                        >
                            <svg className="h-4 w-4 sm:h-5 sm:w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                            </svg>
                            {error}
                        </div>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && sortedFiles.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-yellow-400 mb-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No starred files</h3>
                        <p className="text-gray-500 mb-6">
                            Star files that are important to you for quick access
                        </p>
                        <a
                            href="/dashboard"
                            className="inline-flex items-center px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f]"
                        >
                            <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                            </svg>
                            Go to My Drive
                        </a>
                    </div>
                )}

                {/* Files display */}
                {!loading && !error && sortedFiles.length > 0 && (
                    <>
                        {viewMode === 'list' ? (
                            /* List View with Google Drive-like dropdown menu */
                            <DashboardFileTable
                                files={sortedFiles}
                                onDownload={handleDownload}
                                onDelete={handleDelete}
                                onRename={handleRename}
                                onCopy={handleCopy}
                                onShare={handleShare}
                                onPreview={handlePreview}
                                onMove={handleMove}
                                onToggleStar={handleToggleStar}
                                searchType="keyword"
                            />
                        ) : (
                            /* Grid View */
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                {sortedFiles.map((file) => (
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
                                        onToggleStar={handleToggleStar}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Storage summary */}
                {!loading && !error && sortedFiles.length > 0 && (
                    <div className="mt-8 bg-gray-50 rounded-lg p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Starred Files Summary</h3>
                                <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                        <div className="text-sm text-gray-500">Total Files</div>
                                        <div className="text-2xl font-bold text-gray-900">{sortedFiles.length}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Storage Used</div>
                                        <div className="text-2xl font-bold text-[#18b26f]">{calculateStorageUsed()}</div>
                                    </div>
                                    <div>
                                        <div className="text-sm text-gray-500">Public Files</div>
                                        <div className="text-2xl font-bold text-blue-600">
                                            {sortedFiles.filter(f => f.isPublic).length}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden lg:block">
                                <a
                                    href="/dashboard"
                                    className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-50"
                                >
                                    <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                    Back to My Drive
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* File Preview Modal */}
            <FilePreviewModal
                file={previewFile}
                isOpen={previewModalOpen}
                onClose={() => {
                    setPreviewModalOpen(false);
                    setPreviewFile(null);
                    setPreviewFileIndex(-1);
                }}
                onDownload={handleDownload}
                onShare={handleShare}
                onDelete={(fileId, fileName) => {
                    handleDelete(fileId, fileName);
                    // Close modal after delete
                    setPreviewModalOpen(false);
                    setPreviewFile(null);
                    setPreviewFileIndex(-1);
                }}
                onRename={(fileId, newName) => {
                    handleRename(fileId, newName);
                    // Update the preview file with new name if it's still the same file
                    if (previewFile && previewFile._id === fileId) {
                        setPreviewFile({
                            ...previewFile,
                            originalname: newName
                        });
                    }
                }}
                allFiles={sortedFiles}
                currentIndex={previewFileIndex}
                onNavigate={handleNavigatePreview}
            />
        </DashboardLayout>
    );
}

export default function StarredFiles() {
    return (
        <ProtectedRoute requireAuth={true}>
            <StarredFilesContent />
        </ProtectedRoute>
    );
}
