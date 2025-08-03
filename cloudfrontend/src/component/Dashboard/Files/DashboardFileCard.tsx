import React, { useState } from 'react';
import axios from 'axios';

interface DeleteResponse {
    success: boolean;
    message: string;
}

interface DashboardFileCardProps {
    fileId: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    tags: string[];
    onDelete?: (fileId: string) => void;
}

const DashboardFileCard: React.FC<DashboardFileCardProps> = ({
    fileId,
    fileName,
    fileType,
    fileSize,
    uploadedAt,
    tags,
    onDelete
}) => {
    const [isDeleting, setIsDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // File icon mapping based on file type
    const getFileIcon = () => {
        if (fileType.includes('image')) {
            return (
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.includes('pdf')) {
            return (
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        } else if (fileType.includes('word') || fileType.includes('document')) {
            return (
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else if (fileType.includes('excel') || fileType.includes('sheet')) {
            return (
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
            );
        } else {
            return (
                <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            );
        }
    };

    // Format file size
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    // Delete file handler
    const handleDelete = async () => {
        setIsDeleting(true);
        setError(null);
        try {
            const response = await axios.delete<DeleteResponse>(`http://localhost:5000/api/files/${fileId}`);
            if (response.data.success) {
                if (onDelete) {
                    onDelete(fileId);
                }
            } else {
                setError(response.data.message);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete file');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="relative flex items-center border border-gray-100 rounded-lg p-4 hover:border-gray-200 transition-all bg-white shadow-sm">
            <div className="flex-shrink-0 mr-4 bg-gray-50 rounded-md p-2">
                {getFileIcon()}
            </div>
            <div className="flex-grow min-w-0">
                <h3 className="text-sm font-medium text-gray-800 truncate" title={fileName}>
                    {fileName}
                </h3>
                <div className="mt-1 flex items-center text-xs text-gray-500">
                    <span>{formatFileSize(fileSize)}</span>
                    <span className="mx-2">•</span>
                    <span>{formatDate(uploadedAt)}</span>
                </div>
                {tags && tags.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                        {tags.map((tag, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                            >
                                {tag}
                            </span>
                        ))}
                    </div>
                )}
            </div>
            <div className="flex-shrink-0 ml-4 flex items-center space-x-2">
                <button
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f]"
                    title="Download"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                </button>
                <button
                    className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#18b26f]"
                    title="Share"
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                </button>
                <button
                    className={`p-1 rounded-full ${isDeleting ? 'text-gray-300' : 'text-gray-400 hover:text-red-500'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500`}
                    title="Delete"
                    onClick={handleDelete}
                    disabled={isDeleting}
                >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
            </div>

            {error && (
                <div className="absolute bottom-0 left-0 right-0 transform translate-y-full mt-1 bg-red-100 text-red-600 text-xs p-1 rounded">
                    {error}
                </div>
            )}
        </div>
    );
};

export default DashboardFileCard;
