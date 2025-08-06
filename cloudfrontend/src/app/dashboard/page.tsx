'use client';

import React, { useState, useEffect } from 'react';
import DashboardLayout from '@/component/Dashboard/Layout/DashboardLayout';
import ProtectedRoute from '@/component/common/ProtectedRoute';
import axios from 'axios';

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

function DashboardContent() {
    const [files, setFiles] = useState<FileData[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [pagination, setPagination] = useState<PaginationData | null>(null);

    useEffect(() => {
        const fetchFiles = async () => {
            try {
                setLoading(true);
                const response = await axios.get<ApiResponse>('https://cloudnestaibackend.onrender.com/api/files');

                if (response.data.success) {
                    setFiles(response.data.data);
                    setPagination(response.data.pagination);
                } else {
                    setError(response.data.message || 'Failed to fetch files');
                }
            } catch (err) {
                console.error('Error fetching files:', err);
                setError('An error occurred while fetching files. Please try again later.');
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

    return (
        <DashboardLayout>
            <div className="p-6">
                {/* Header with summary info */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800">My Drive</h2>
                        <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6 text-sm text-gray-500">
                            <div className="mt-2 flex items-center">
                                <span>Total Files: {files.length}</span>
                            </div>
                            <div className="mt-2 flex items-center">
                                <span>Storage Used: {calculateStorageUsed()}</span>
                            </div>
                            <div className="mt-2 flex items-center">
                                <span>Last Updated: {files.length > 0 ? new Date(files[0].updatedAt).toLocaleDateString() : 'N/A'}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-4 flex-shrink-0 flex md:mt-0 md:ml-4 space-x-2">
                        <a
                            href="/upload"
                            className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150"
                        >
                            <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            Upload New Files
                        </a>
                    </div>
                </div>                {/* File table with dynamic content */}
                <div className="mt-8 overflow-hidden">
                    {loading && (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#18b26f]"></div>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    {!loading && !error && files.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 text-lg">No files found. Upload some files to get started!</p>
                        </div>
                    )}

                    {!loading && files.length > 0 && (
                        <div className="align-middle inline-block min-w-full">
                            <div className="overflow-hidden border border-gray-200 sm:rounded-lg">
                                <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                        <tr>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File ID</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Size</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                        {files.map((file, index) => {
                                            // Helper function to format file size
                                            const formatFileSize = (bytes: number): string => {
                                                if (bytes < 1024) return bytes + ' B';
                                                else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
                                                else if (bytes < 1073741824) return (bytes / 1048576).toFixed(1) + ' MB';
                                                else return (bytes / 1073741824).toFixed(1) + ' GB';
                                            };

                                            // Function to get file type from mimetype
                                            const getFileType = (mimetype: string): string => {
                                                const parts = mimetype.split('/');
                                                if (parts.length > 1) {
                                                    return parts[1].toUpperCase();
                                                }
                                                return parts[0].toUpperCase();
                                            };

                                            // Format date to a readable format
                                            const formatDate = (dateString: string): string => {
                                                const date = new Date(dateString);
                                                return date.toLocaleDateString('en-US', {
                                                    year: 'numeric',
                                                    month: 'short',
                                                    day: 'numeric',
                                                });
                                            };

                                            return (
                                                <tr key={file._id} className="hover:bg-gray-50 transition-colors duration-150">
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{file._id.substring(0, 6)}...</td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-8 w-8 bg-[#e6f5ee] text-[#18b26f] rounded-md flex items-center justify-center">
                                                                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                                </svg>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">{file.originalname}</div>
                                                                <div className="text-xs text-gray-500">{file.filename}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{getFileType(file.mimetype)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatFileSize(file.size)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(file.createdAt)}</td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                        <div className="flex space-x-2">
                                                            <button
                                                                className="text-[#ff7a7a] hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-all duration-150"
                                                                onClick={async () => {
                                                                    if (window.confirm(`Are you sure you want to delete ${file.originalname}?`)) {
                                                                        try {
                                                                            const response: any = await axios.delete(`https://cloudnestaibackend.onrender.com/api/files/${file._id}`);
                                                                            if (response.data.success) {
                                                                                setFiles(prevFiles => prevFiles.filter(f => f._id !== file._id));
                                                                            }
                                                                        } catch (err) {
                                                                            console.error('Error deleting file:', err);
                                                                            alert('Failed to delete file. Please try again.');
                                                                        }
                                                                    }
                                                                }}
                                                            >
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                </svg>
                                                            </button>
                                                            <button
                                                                className="text-[#18b26f] hover:text-[#149d5f] p-1 rounded-full hover:bg-[#e6f5ee] transition-all duration-150"
                                                                onClick={() => {
                                                                    window.open(`https://cloudnestaibackend.onrender.com/api/files/download/${file._id}`, '_blank');
                                                                }}
                                                            >
                                                                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                {pagination && pagination.totalPages > 1 && (
                    <div className="flex justify-center mt-8">
                        <nav className="flex items-center">
                            <button
                                className={`mx-1 px-4 py-2 rounded-md shadow-sm text-sm font-medium ${!pagination.hasPreviousPage
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-[#18b26f] hover:bg-[#e6f5ee] border border-[#18b26f]'
                                    }`}
                                disabled={!pagination.hasPreviousPage}
                                onClick={async () => {
                                    if (pagination.hasPreviousPage) {
                                        try {
                                            setLoading(true);
                                            const page = pagination.currentPage - 1;
                                            const response = await axios.get<ApiResponse>(`https://cloudnestaibackend.onrender.com/api/files?page=${page}`);

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
                            >
                                Previous
                            </button>

                            <span className="mx-4 text-sm font-medium text-gray-700">
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                className={`mx-1 px-4 py-2 rounded-md shadow-sm text-sm font-medium ${!pagination.hasNextPage
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-white text-[#18b26f] hover:bg-[#e6f5ee] border border-[#18b26f]'
                                    }`}
                                disabled={!pagination.hasNextPage}
                                onClick={async () => {
                                    if (pagination.hasNextPage) {
                                        try {
                                            setLoading(true);
                                            const page = pagination.currentPage + 1;
                                            const response = await axios.get<ApiResponse>(`https://cloudnestaibackend.onrender.com/api/files?page=${page}`);

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
                            >
                                Next
                            </button>
                        </nav>
                    </div>
                )}

                {/* Summary and Actions */}
                <div className="mt-8 flex flex-col-reverse md:flex-row justify-between">
                    <div className="mt-4 md:mt-0">
                        <div className="flex space-x-3 mt-6">
                            <a
                                href="/upload"
                                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#18b26f] hover:bg-[#149d5f] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150 flex items-center"
                            >
                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                                </svg>
                                Upload New Files
                            </a>
                            <a
                                href="/insights"
                                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f] transition-all duration-150 flex items-center"
                            >
                                <svg className="mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                View Insights
                            </a>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                            <p>Total Files</p>
                            <p>{pagination?.totalFiles || files.length}</p>
                        </div>
                        <div className="flex justify-between text-lg font-semibold text-gray-900 mt-2">
                            <p>Storage Used</p>
                            <p>{calculateStorageUsed()}</p>
                        </div>
                    </div>
                </div>
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
