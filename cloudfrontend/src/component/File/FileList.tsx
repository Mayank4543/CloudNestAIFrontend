import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileCard from './filecard';

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

const FileList: React.FC = () => {
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

    // Function to handle file deletion
    const handleFileDelete = (fileId: string) => {
        setFiles(prevFiles => prevFiles.filter(file => file._id !== fileId));

        // Update pagination if needed
        if (pagination && files.length === 1 && pagination.currentPage > 1) {
            // If this was the last file on a page beyond page 1, go to previous page
            // This would ideally be replaced with a refetch of the current page
            setPagination({
                ...pagination,
                currentPage: pagination.currentPage - 1,
                totalFiles: pagination.totalFiles - 1,
                totalPages: Math.max(1, Math.ceil((pagination.totalFiles - 1) / pagination.limit))
            });
        } else if (pagination) {
            // Just update the counts
            setPagination({
                ...pagination,
                totalFiles: pagination.totalFiles - 1,
                totalPages: Math.max(1, Math.ceil((pagination.totalFiles - 1) / pagination.limit))
            });
        }
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
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Your Files</h1>

            {loading && (
                <div className="flex justify-center items-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {files.map((file) => (
                    <FileCard
                        key={file._id}
                        fileId={file._id}
                        fileName={file.originalname}
                        fileType={getFileType(file.mimetype)}
                        fileSize={file.size}
                        uploadedAt={formatDate(file.createdAt)}
                        tags={file.tags}
                        onDelete={handleFileDelete}
                    />
                ))}
            </div>

            {pagination && pagination.totalPages > 1 && (
                <div className="flex justify-center mt-8">
                    <nav className="flex items-center">
                        <button
                            className={`mx-1 px-3 py-1 rounded ${!pagination.hasPreviousPage
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            disabled={!pagination.hasPreviousPage}
                        >
                            Previous
                        </button>

                        <span className="mx-2 text-gray-600">
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </span>

                        <button
                            className={`mx-1 px-3 py-1 rounded ${!pagination.hasNextPage
                                ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                            disabled={!pagination.hasNextPage}
                        >
                            Next
                        </button>
                    </nav>
                </div>
            )}
        </div>
    );
};

export default FileList;
