import React, { useState, useEffect } from 'react';
import axios, { isAxiosError } from 'axios';
import DashboardFileCard from './DashboardFileCard';
import Link from 'next/link';

interface FileData {
    _id: string;
    filename: string;
    originalname: string;
    mimetype: string;
    size: number;
    path: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
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

interface DashboardFileListProps {
    onSearch?: (query: string) => void;
}

const DashboardFileList: React.FC<DashboardFileListProps> = ({ onSearch }) => {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [pagination, setPagination] = useState<PaginationData>({
        currentPage: 1,
        totalPages: 1,
        totalFiles: 0,
        hasNextPage: false,
        hasPreviousPage: false,
        limit: 10
    });

    // Sort options
    const [sortBy, setSortBy] = useState('createdAt');
    const [sortOrder, setSortOrder] = useState('desc');

    // View options
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    const loadFiles = async (page = 1) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get<ApiResponse>(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/files`, {
                params: {
                    page,
                    limit: pagination.limit,
                    search: searchQuery,
                    sortBy,
                    sortOrder
                }
            });

            if (response.data.success) {
                setFiles(response.data.data);
                setPagination(response.data.pagination);
            } else {
                setError(response.data.message);
            }
        } catch (err: unknown) {
            if (isAxiosError(err) && err.response) {
                setError(err.response.data?.message || 'Failed to fetch files');
            } else {
                setError('Failed to fetch files');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadFiles();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sortBy, sortOrder, pagination.limit]);

    const handlePageChange = (newPage: number) => {
        loadFiles(newPage);
    };

    const handleSearch = () => {
        if (onSearch) {
            onSearch(searchQuery);
        }
        loadFiles(1);
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {
        if (event.key === 'Enter') {
            handleSearch();
        }
    };

    const handleSort = (field: string) => {
        if (sortBy === field) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(field);
            setSortOrder('desc'); // Default to descending when changing sort field
        }
    };

    const handleDelete = (fileId: string) => {
        setFiles(files.filter(file => file._id !== fileId));
        // If we just deleted the last file on the current page, go to previous page
        if (files.length === 1 && pagination.currentPage > 1) {
            handlePageChange(pagination.currentPage - 1);
        } else {
            loadFiles(pagination.currentPage);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-100">
            <div className="flex flex-col space-y-4">
                {/* Search and filter bar */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-3 md:space-y-0">
                    <div className="relative w-full md:w-64">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Search files..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onKeyDown={handleKeyDown}
                        />
                    </div>

                    <div className="flex items-center space-x-2 w-full md:w-auto">
                        <div className="relative inline-block text-left w-full md:w-auto">
                            <select
                                className="block w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                                value={sortBy}
                                onChange={(e) => handleSort(e.target.value)}
                            >
                                <option value="createdAt">Date Uploaded</option>
                                <option value="originalname">Name</option>
                                <option value="size">Size</option>
                            </select>
                        </div>

                        <button
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                            className="p-2 border border-gray-300 rounded-md"
                            title={sortOrder === 'asc' ? 'Sort Descending' : 'Sort Ascending'}
                        >
                            {sortOrder === 'asc' ? (
                                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                            ) : (
                                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                                </svg>
                            )}
                        </button>

                        <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2 ${viewMode === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'} rounded-l-md`}
                                title="List View"
                            >
                                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                                </svg>
                            </button>
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2 ${viewMode === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'} rounded-r-md`}
                                title="Grid View"
                            >
                                <svg className="h-4 w-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Results count */}
                <div className="text-sm text-gray-500">
                    {pagination.totalFiles} results
                </div>

                {/* Loading state */}
                {loading && (
                    <div className="flex justify-center items-center h-40">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#18b26f]"></div>
                    </div>
                )}

                {/* Error state */}
                {error && !loading && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && files.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"></path>
                        </svg>
                        <h3 className="mt-2 text-sm font-medium text-gray-900">No files found</h3>
                        <p className="mt-1 text-sm text-gray-500">Get started by uploading a new file.</p>
                        <div className="mt-6">
                            <Link href="/upload" className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f]">
                                <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                Upload File
                            </Link>
                        </div>
                    </div>
                )}

                {/* File list */}
                {!loading && !error && files.length > 0 && (
                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-3'}`}>
                        {files.map((file) => (
                            <DashboardFileCard
                                key={file._id}
                                fileId={file._id}
                                fileName={file.originalname}
                                fileType={file.mimetype}
                                fileSize={file.size}
                                uploadedAt={file.createdAt}
                                tags={file.tags}
                                onDelete={handleDelete}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 bg-white py-3 mt-4">
                        <div className="flex flex-1 justify-between sm:hidden">
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPreviousPage}
                                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${!pagination.hasPreviousPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                className={`relative ml-3 inline-flex items-center px-4 py-2 text-sm font-medium rounded-md ${!pagination.hasNextPage ? 'text-gray-300 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-50'}`}
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Showing <span className="font-medium">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to <span className="font-medium">{Math.min(pagination.currentPage * pagination.limit, pagination.totalFiles)}</span> of <span className="font-medium">{pagination.totalFiles}</span> results
                                </p>
                            </div>
                            <div>
                                <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                                        disabled={!pagination.hasPreviousPage}
                                        className={`relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${!pagination.hasPreviousPage ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">Previous</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>

                                    {/* Dynamic page buttons */}
                                    {Array.from({ length: pagination.totalPages }, (_, i) => {
                                        const pageNum = i + 1;
                                        // Only show a few page numbers around the current page
                                        if (
                                            pageNum === 1 ||
                                            pageNum === pagination.totalPages ||
                                            (pageNum >= pagination.currentPage - 1 && pageNum <= pagination.currentPage + 1)
                                        ) {
                                            return (
                                                <button
                                                    key={pageNum}
                                                    onClick={() => handlePageChange(pageNum)}
                                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pagination.currentPage === pageNum
                                                        ? 'z-10 bg-[#18b26f] text-white focus:z-20  focus-visible:outline-offset-2 focus-visible:outline-[#18b26f]'
                                                        : 'text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                                        }`}
                                                >
                                                    {pageNum}
                                                </button>
                                            );
                                        } else if (
                                            (pageNum === 2 && pagination.currentPage > 3) ||
                                            (pageNum === pagination.totalPages - 1 && pagination.currentPage < pagination.totalPages - 2)
                                        ) {
                                            return (
                                                <span key={pageNum} className="relative inline-flex items-center px-4 py-2 text-sm font-semibold text-gray-700 ring-1 ring-inset ring-gray-300">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    })}

                                    <button
                                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                                        disabled={!pagination.hasNextPage}
                                        className={`relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${!pagination.hasNextPage ? 'cursor-not-allowed' : 'hover:bg-gray-50'}`}
                                    >
                                        <span className="sr-only">Next</span>
                                        <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                            <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                                        </svg>
                                    </button>
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardFileList;
