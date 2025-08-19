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
    relevanceScore?: number; // For AI search results
    starred?: boolean; // Track if file is starred
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
    const [sortBy, setSortBy] = useState<'name' | 'date' | 'size'>('date');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [timeframe, setTimeframe] = useState<'all' | 'today' | 'week' | 'month' | 'year'>('all');
    const [fileType, setFileType] = useState<'all' | 'images' | 'documents' | 'videos' | 'audio' | 'pdfs' | 'others'>('all');
    const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
    const [previewFile, setPreviewFile] = useState<FileData | null>(null);
    const [previewFileIndex, setPreviewFileIndex] = useState<number>(-1);
    const [searchResults, setSearchResults] = useState<FileData[]>([]);
    const [searchType, setSearchType] = useState<'keyword' | 'semantic'>('keyword');
    const [isSearching, setIsSearching] = useState(false);

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
                    const starredFiles = JSON.parse(localStorage.getItem('starredFiles') || '[]');

                    // Mark files as starred based on localStorage data
                    const filesWithStarred = normalizedFiles.map(file => ({
                        ...file,
                        starred: starredFiles.includes(file._id)
                    }));

                    setFiles(filesWithStarred);
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

        // Listen for file uploads from other tabs/components
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === 'fileUploaded' && e.newValue) {

                // Remove the flag
                localStorage.removeItem('fileUploaded');
                // Refresh the files
                fetchFiles();
            }
        };

        // Listen for storage events
        window.addEventListener('storage', handleStorageChange);

        // Also listen for custom events within the same tab
        const handleFileUpload = () => {
            ;
            fetchFiles();
        };

        window.addEventListener('fileUploaded', handleFileUpload);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('fileUploaded', handleFileUpload);
        };
    }, []);

    // Handle search results from GlobalSearch component
    const handleSearchResults = (results: FileData[], type: 'keyword' | 'semantic') => {


        // Normalize tags for search results
        const normalizedResults = results.map(file => ({
            ...file,
            tags: normalizeTags(file.tags)
        }));

        setSearchResults(normalizedResults);
        setSearchType(type);
        setIsSearching(normalizedResults.length > 0);

    };

    // Clear search results when search is cleared
    const clearSearchResults = () => {
        setSearchResults([]);
        setIsSearching(false);
        setSearchType('keyword');
    };

    // Calculate storage usage
    const calculateStorageUsed = () => {
        const filesToCalculate = isSearching ? searchResults : files;
        if (filesToCalculate.length === 0) return "0 MB";
        const totalBytes = filesToCalculate.reduce((total, file) => total + file.size, 0);
        if (totalBytes < 1048576) return (totalBytes / 1024).toFixed(2) + " KB";
        if (totalBytes < 1073741824) return (totalBytes / 1048576).toFixed(2) + " MB";
        return (totalBytes / 1073741824).toFixed(2) + " GB";
    };

    // Filter files by timeframe
    const filterByTimeframe = (files: FileData[]) => {
        if (timeframe === 'all') return files;

        const now = new Date();
        const startDate = new Date();

        switch (timeframe) {
            case 'today':
                startDate.setHours(0, 0, 0, 0);
                break;
            case 'week':
                startDate.setDate(now.getDate() - 7);
                break;
            case 'month':
                startDate.setMonth(now.getMonth() - 1);
                break;
            case 'year':
                startDate.setFullYear(now.getFullYear() - 1);
                break;
        }

        return files.filter(file => new Date(file.updatedAt) >= startDate);
    };

    // Filter files by type
    const filterByType = (files: FileData[]) => {
        if (fileType === 'all') return files;

        return files.filter(file => {
            const mimetype = file.mimetype.toLowerCase();
            switch (fileType) {
                case 'images':
                    return mimetype.includes('image');
                case 'documents':
                    return mimetype.includes('document') || mimetype.includes('text') ||
                        mimetype.includes('msword') || mimetype.includes('wordprocessingml');
                case 'videos':
                    return mimetype.includes('video');
                case 'audio':
                    return mimetype.includes('audio');
                case 'pdfs':
                    return mimetype.includes('pdf');
                case 'others':
                    return !mimetype.includes('image') && !mimetype.includes('document') &&
                        !mimetype.includes('text') && !mimetype.includes('video') &&
                        !mimetype.includes('audio') && !mimetype.includes('pdf') &&
                        !mimetype.includes('msword') && !mimetype.includes('wordprocessingml');
                default:
                    return true;
            }
        });
    };

    // Filter and sort files
    const filteredAndSortedFiles = (() => {
        let fileList = isSearching ? searchResults : files;

        // Apply timeframe filter
        fileList = filterByTimeframe(fileList);

        // Apply file type filter
        fileList = filterByType(fileList);

        // Apply sorting
        return fileList.sort((a, b) => {
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
                setSearchResults(prevResults => prevResults.filter(f => f._id !== fileId));
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
                setSearchResults(prevResults =>
                    prevResults.map(f =>
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
            const file = files.find(f => f._id === fileId) || searchResults.find(f => f._id === fileId);
            if (!file) return;

            // Toggle the starred state
            const newStarredState = !file.starred;

            // Update the file in state immediately for a responsive UI
            setFiles(prevFiles =>
                prevFiles.map(f =>
                    f._id === fileId ? { ...f, starred: newStarredState } : f
                )
            );
            setSearchResults(prevResults =>
                prevResults.map(f =>
                    f._id === fileId ? { ...f, starred: newStarredState } : f
                )
            );

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

            // You can also send this to your API if you want to persist it server-side
            // const authToken = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');
            // if (authToken) {
            //     await axios.patch(
            //         `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files/${fileId}`,
            //         { starred: newStarredState },
            //         {
            //             headers: { 'Authorization': `Bearer ${authToken}` },
            //         }
            //     );
            // }
        } catch (err) {
            console.error('Error toggling star:', err);
            // Revert the state change on error
            setFiles(prevFiles => [...prevFiles]);
            setSearchResults(prevResults => [...prevResults]);
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
        const fileIndex = filteredAndSortedFiles.findIndex(f => f._id === file._id);
        setPreviewFile(file);
        setPreviewFileIndex(fileIndex);
        setPreviewModalOpen(true);
    };

    const handleNavigatePreview = (newIndex: number) => {
        if (newIndex >= 0 && newIndex < filteredAndSortedFiles.length) {
            const newFile = filteredAndSortedFiles[newIndex];
            setPreviewFile(newFile);
            setPreviewFileIndex(newIndex);
        }
    };

    const handleMove = (fileId: string) => {
        // Placeholder for move functionality
        console.log('Move file functionality not yet implemented for ID:', fileId);
    };

    return (
        <DashboardLayout onSearchResults={handleSearchResults} onClearSearch={clearSearchResults}>
            <div className="p-6">
                {/* Header with search and controls */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900">
                            {isSearching ? 'Search Results' : 'My Drive'}
                        </h2>
                        <div className="mt-2 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-6 text-sm text-gray-500">
                            <div className="flex items-center">
                                <span>Total Files: {filteredAndSortedFiles.length}</span>
                            </div>
                            <div className="flex items-center">
                                <span>Storage Used: {calculateStorageUsed()}</span>
                            </div>
                            {isSearching && (
                                <div className="flex items-center">
                                    <span>Search Type: {searchType === 'semantic' ? 'AI' : 'Keyword'}</span>
                                </div>
                            )}
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

                {/* Controls bar - Single Row Layout (Desktop) & Chips (Mobile) */}
                <div className="flex items-center justify-between gap-2 mb-6 p-3 sm:p-5 bg-white rounded-xl shadow-sm border border-gray-100 backdrop-blur-sm overflow-x-auto">
                    {/* Left Side Controls - Desktop View */}
                    <div className="hidden md:flex items-center gap-2 sm:gap-4 flex-shrink-0">
                        {/* Sort By */}
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

                        {/* Modified (Timeframe) Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center whitespace-nowrap">
                                <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-[#18b26f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="hidden sm:inline">Modified:</span>
                                <span className="sm:hidden">Time:</span>
                            </label>
                            <div className="relative">
                                <select
                                    value={timeframe}
                                    onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
                                    className="appearance-none text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 pr-6 sm:pr-8 
                                             text-gray-700 hover:border-[#18b26f]/40 focus:border-[#18b26f] focus:outline-none 
                                             focus:ring-2 focus:ring-[#18b26f]/30 transition-all cursor-pointer shadow-sm min-w-[80px] sm:min-w-[120px]"
                                >
                                    <option value="all">Any time</option>
                                    <option value="today">Today</option>
                                    <option value="week">7 days</option>
                                    <option value="month">30 days</option>
                                    <option value="year">1 year</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-1 sm:px-2 pointer-events-none text-gray-500">
                                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* File Type Filter */}
                        <div className="flex items-center space-x-2">
                            <label className="text-xs sm:text-sm font-medium text-gray-700 flex items-center whitespace-nowrap">
                                <svg className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 text-[#18b26f]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                </svg>
                                Type:
                            </label>
                            <div className="relative">
                                <select
                                    value={fileType}
                                    onChange={(e) => setFileType(e.target.value as typeof fileType)}
                                    className="appearance-none text-xs sm:text-sm bg-white border border-gray-200 rounded-lg px-2 sm:px-3 py-1.5 sm:py-2 pr-6 sm:pr-8 
                                             text-gray-700 hover:border-[#18b26f]/40 focus:border-[#18b26f] focus:outline-none 
                                             focus:ring-2 focus:ring-[#18b26f]/30 transition-all cursor-pointer shadow-sm min-w-[70px] sm:min-w-[120px]"
                                >
                                    <option value="all">All</option>
                                    <option value="images">Images</option>
                                    <option value="documents">Docs</option>
                                    <option value="pdfs">PDFs</option>
                                    <option value="videos">Videos</option>
                                    <option value="audio">Audio</option>
                                    <option value="others">Others</option>
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-1 sm:px-2 pointer-events-none text-gray-500">
                                    <svg className="h-2.5 w-2.5 sm:h-3 sm:w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>
                            </div>
                        </div>

                        {/* Clear Filters Button - Desktop */}
                        {(timeframe !== 'all' || fileType !== 'all') && (
                            <button
                                onClick={() => {
                                    setTimeframe('all');
                                    setFileType('all');
                                }}
                                className="text-xs sm:text-sm text-[#18b26f] hover:text-[#149d5f] font-medium transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap px-2 py-1"
                            >
                                <svg className="h-3 w-3 sm:h-4 sm:w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span className="hidden sm:inline">Clear</span>
                            </button>
                        )}
                    </div>

                    {/* Left Side Controls - Mobile View with Chips */}
                    <div className="flex md:hidden flex-wrap items-center gap-2 flex-shrink-0">
                        {/* Sort By - Chip Style */}
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

                            {/* Mobile Sort Order Button */}
                            {/* <button
                                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                className="absolute right-[-22px] top-[2px] p-1.5 text-gray-500 hover:text-[#18b26f] bg-white rounded-full border border-gray-200 shadow-sm
                                        hover:border-[#18b26f]/40 transition-all duration-300 flex-shrink-0"
                                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
                            >
                                <svg className={`h-3 w-3 transform transition-transform duration-300 ${sortOrder === 'desc' ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                </svg>
                            </button> */}
                        </div>

                        {/* Modified Filter - Chip Style */}
                        <div className="relative">
                            <button
                                onClick={() => document.getElementById('modifiedDropdownMobile')?.click()}
                                className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full border 
                                    ${timeframe !== 'all'
                                        ? 'border-[#18b26f] bg-[#e6f5ee] text-[#18b26f] shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} 
                                    focus:outline-none focus:ring-2 focus:ring-[#18b26f]/20 shadow-sm transition-colors`}
                            >
                                <span className="font-medium">Modified</span>
                                {timeframe !== 'all' && (
                                    <span className="text-xs font-medium ml-1">&bull;</span>
                                )}
                                <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <select
                                id="modifiedDropdownMobile"
                                value={timeframe}
                                onChange={(e) => setTimeframe(e.target.value as typeof timeframe)}
                                className="absolute z-10 text-black opacity-0 top-0 left-0 w-full h-full cursor-pointer"
                            >
                                <option value="all">Any time</option>
                                <option value="today">Today</option>
                                <option value="week">7 days</option>
                                <option value="month">30 days</option>
                                <option value="year">1 year</option>
                            </select>
                        </div>

                        {/* Type Filter - Chip Style */}
                        <div className="relative">
                            <button
                                onClick={() => document.getElementById('typeDropdownMobile')?.click()}
                                className={`flex items-center space-x-1 text-xs px-3 py-1.5 rounded-full border 
                                    ${fileType !== 'all'
                                        ? 'border-[#18b26f] bg-[#e6f5ee] text-[#18b26f] shadow-sm'
                                        : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'} 
                                    focus:outline-none focus:ring-2 focus:ring-[#18b26f]/20 shadow-sm transition-colors`}
                            >
                                <span className="font-medium">Type</span>
                                {fileType !== 'all' && (
                                    <span className="text-xs font-medium ml-1">&bull;</span>
                                )}
                                <svg className="h-3 w-3 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            <select
                                id="typeDropdownMobile"
                                value={fileType}
                                onChange={(e) => setFileType(e.target.value as typeof fileType)}
                                className="absolute z-10 text-black opacity-0 top-0 left-0 w-full h-full cursor-pointer"
                            >
                                <option value="all">All</option>
                                <option value="images">Images</option>
                                <option value="documents">Docs</option>
                                <option value="pdfs">PDFs</option>
                                <option value="videos">Videos</option>
                                <option value="audio">Audio</option>
                                <option value="others">Others</option>
                            </select>
                        </div>

                        {/* Clear Filters Button - Mobile */}
                        {(timeframe !== 'all' || fileType !== 'all') && (
                            <button
                                onClick={() => {
                                    setTimeframe('all');
                                    setFileType('all');
                                }}
                                className="text-xs text-[#18b26f] hover:text-[#149d5f] font-medium transition-colors duration-200 flex items-center space-x-1 whitespace-nowrap px-3 py-1.5 rounded-full border border-[#18b26f]/20 hover:border-[#18b26f]/40 shadow-sm"
                            >
                                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Clear</span>
                            </button>
                        )}
                    </div>


                    {/* Right Side - View Mode Controls */}
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
                {!loading && !error && filteredAndSortedFiles.length === 0 && (
                    <div className="text-center py-12">
                        <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No files found</h3>
                        <p className="text-gray-500 mb-6">
                            {isSearching ? 'No files match your search criteria' : "Upload some files to get started!"}
                        </p>
                        {!isSearching && (
                            <a
                                href="/upload"
                                className="inline-flex items-center px-4 py-2 bg-[#18b26f] text-white text-sm font-medium rounded-lg hover:bg-[#149d5f]"
                            >
                                <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                </svg>
                                Upload Files
                            </a>
                        )}
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
                                onToggleStar={handleToggleStar}
                                searchType={searchType}
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
                                        onToggleStar={handleToggleStar}
                                    />
                                ))}
                            </div>
                        )}
                    </>
                )}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && !isSearching && (
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
                allFiles={filteredAndSortedFiles}
                currentIndex={previewFileIndex}
                onNavigate={handleNavigatePreview}
            />
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
